"use server";
import { PrismaClient } from "@prisma/client";
import { checkoutSchema, CheckoutFormData } from "@/lib/schemas";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { parsePhoneNumber } from "libphonenumber-js";
import { verifySession } from "@/lib/auth";
import { mollieClient } from "@/lib/mollie";
/**
 * Checks if the request is authenticated as an admin.
 * Verifies the presence of the 'admin_session' cookie.
 * @throws {Error} If the user is not authenticated.
 */
export async function checkAuth() {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (!session) {
        throw new Error("Unauthorized: Admin session required");
    }
    const isValid = await verifySession(session.value);
    if (!isValid) {
        throw new Error("Unauthorized: Invalid session");
    }
}
// Helper to manage customers
// Normalizes phone to ensure uniqueness (e.g. 0470... -> +32470...)
async function upsertCustomer(phone: string, firstName: string, lastName: string, address?: string) {
    const parsed = parsePhoneNumber(phone, 'BE');
    const normalizedPhone = parsed ? parsed.number : phone;
    try {
        const customer = await prisma.customer.upsert({
            where: { phone: normalizedPhone },
            update: {
                firstName,
                lastName,
                ...(address && { address }),
            },
            create: {
                phone: normalizedPhone,
                firstName,
                lastName,
                address,
            }
        });
        return customer;
    } catch (e) {
        console.error("Error upserting customer:", e);
        return null;
    }
}

/**
 * Searches for customers by name or phone number.
 * Protected: Requires admin authentication.
 */
export async function searchCustomers(query: string) {
    await checkAuth();
    if (query.length < 2) return [];

    return await prisma.customer.findMany({
        where: {
            OR: [
                { lastName: { contains: query } },
                { firstName: { contains: query } },
                { phone: { contains: query } }
            ]
        },
        take: 10
    });
}

export async function getAllCustomers() {
    await checkAuth();
    return await prisma.customer.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: { orders: true }
            },
            orders: {
                orderBy: { createdAt: 'desc' },
                include: {
                    items: true
                }
            }
        }
    });
}

interface CartItemData {
    name: string;
    totalPrice: number;
    ingredients: string[];
    removedIngredients: string[];
    addedIngredients: string[];
    basePrice: number;
    finalPrice: number;
    modifications?: string;
    quantity: number;
}

/**
 * Submits a new order from the public checkout.
 */
export async function submitOrder(formData: CheckoutFormData, cartItems: any[], totalAmount: number) {
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
        console.error("Validation Error:", result.error);
        return { success: false, error: "Données invalides: " + result.error.issues[0].message };
    }
    const data = result.data;

    // Split name strictly for database
    const nameParts = data.name.trim().split(" ");
    const lastName = nameParts.pop() || "";
    const firstName = nameParts.join(" ") || lastName; // Fallback if single word
    // If only one word, use it as First Name (informal) or Last Name? 
    // Let's say if single word: FirstName = "", LastName = Word.
    // If "Jean Dupont": First="Jean", Last="Dupont"

    try {
        // 1. Manage Customer
        const customer = await upsertCustomer(data.phone, firstName, lastName, data.address);
        // 2. Create Order
        const order = await prisma.order.create({
            data: {
                customerName: data.name, // Keep full name string in Order snapshot
                customerPhone: data.phone,
                customerAddress: data.address,
                instructions: data.instructions || "",
                total: totalAmount,
                status: "PENDING",
                customerId: customer?.id,
                items: {
                    create: cartItems.map((item: any) => ({
                        pizzaName: item.name,
                        basePrice: item.basePrice,
                        finalPrice: item.totalPrice,
                        modifications: JSON.stringify({
                            removed: item.removedIngredients || [],
                            added: item.addedIngredients || []
                        }),
                        quantity: 1
                    }))
                }
            }
        });
        revalidatePath("/admin");
        return { success: true, orderId: order.id };
    } catch (e: any) {
        console.error("CRITICAL DATABASE ERROR:", e);
        return { success: false, error: "Erreur serveur: " + (e.message || "Inconnue") };
    }
}

export async function updateOrderStatus(orderId: number, newStatus: string) {
    try {
        await checkAuth();
        await prisma.order.update({
            where: { id: orderId },
            data: {
                status: newStatus,
                updatedAt: new Date() // Force update time
            },
        });
        // Revalidate both admin board and the specific order status page
        revalidatePath("/admin");
        revalidatePath(`/order/${orderId}/status`);
        return { success: true };
    } catch (e) {
        console.error("Status update error:", e);
        return { success: false, error: "Impossible de mettre à jour le statut" };
    }
}

export async function createManualOrder(data: {
    customerName: string;
    firstName: string;
    lastName: string;
    customerPhone: string;
    customerAddress?: string;
    items: {
        pizzaId: string;
        quantity: number;
        modifications?: { added: string[]; removed: string[] };
    }[];
    type: 'takeaway' | 'delivery';
}) {
    await checkAuth();
    try {
        const PIZZAS = await prisma.pizza.findMany();

        // Ensure address is present for everyone to avoid duplicates in DB
        if (!data.customerAddress || data.customerAddress.trim() === "") {
            return { success: false, error: "L'adresse est requise (même pour à emporter) pour le fichier client." };
        }
        const finalAddress = data.customerAddress;

        const customer = await upsertCustomer(
            data.customerPhone,
            data.firstName,
            data.lastName,
            finalAddress
        );

        let orderTotal = 0;
        const validItems = [];
        for (const item of data.items) {
            const pizza = PIZZAS.find(p => p.id === item.pizzaId);
            if (!pizza) continue;
            const lineTotal = pizza.basePrice * item.quantity;
            orderTotal += lineTotal;
            validItems.push({
                pizzaName: pizza.name,
                basePrice: pizza.basePrice,
                finalPrice: lineTotal,
                modifications: item.modifications ? JSON.stringify(item.modifications) : JSON.stringify({ removed: [], added: [] }),
                quantity: item.quantity
            });
        }
        if (validItems.length === 0) {
            return { success: false, error: "Aucune pizza valide" };
        }

        const parsed = parsePhoneNumber(data.customerPhone, 'BE');
        const normalizedPhone = parsed ? parsed.number : data.customerPhone;

        await prisma.order.create({
            data: {
                customerName: data.customerName,
                customerPhone: normalizedPhone,
                customerAddress: finalAddress!,
                instructions: data.type === 'delivery' ? "⚠️ LIVRAISON" : "A Emporter",
                total: orderTotal,
                status: "PENDING",
                customerId: customer?.id,
                items: { create: validItems }
            }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error("Create manual order error", e);
        return { success: false, error: "Erreur création commande" };
    }
}

export async function updateManualOrder(orderId: number, data: {
    customerName: string;
    firstName: string;
    lastName: string;
    customerPhone: string;
    customerAddress?: string;
    items: {
        pizzaId: string;
        quantity: number;
        modifications?: { added: string[]; removed: string[] };
    }[];
    type: 'takeaway' | 'delivery';
}) {
    await checkAuth();
    try {
        const PIZZAS = await prisma.pizza.findMany();

        if (!data.customerAddress || data.customerAddress.trim() === "") {
            return { success: false, error: "L'adresse est requise (même pour à emporter) pour le fichier client." };
        }
        const finalAddress = data.customerAddress;

        const parsed = parsePhoneNumber(data.customerPhone, 'BE');
        const normalizedPhone = parsed ? parsed.number : data.customerPhone;

        await upsertCustomer(normalizedPhone, data.firstName, data.lastName, finalAddress);

        let orderTotal = 0;
        const validItems: any[] = [];
        for (const item of data.items) {
            const pizza = PIZZAS.find(p => p.id === item.pizzaId);
            if (!pizza) continue;
            const lineTotal = pizza.basePrice * item.quantity;
            orderTotal += lineTotal;
            validItems.push({
                pizzaName: pizza.name,
                basePrice: pizza.basePrice,
                finalPrice: lineTotal,
                modifications: item.modifications ? JSON.stringify(item.modifications) : JSON.stringify({ removed: [], added: [] }),
                quantity: item.quantity
            });
        }
        if (validItems.length === 0) {
            return { success: false, error: "Aucune pizza valide" };
        }

        await prisma.$transaction(async (tx) => {
            await tx.orderItem.deleteMany({ where: { orderId: orderId } });
            await tx.order.update({
                where: { id: orderId },
                data: {
                    customerName: data.customerName,
                    customerPhone: normalizedPhone,
                    customerAddress: finalAddress!,
                    instructions: data.type === 'delivery' ? "⚠️ LIVRAISON" : "A Emporter",
                    total: orderTotal,
                    items: { create: validItems }
                }
            });
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error("Update Error:", e);
        return { success: false, error: "Erreur mise à jour commande" };
    }
}

export async function getCustomerDetails(phone: string) {
    try {
        await checkAuth();
        const customer = await prisma.customer.findUnique({
            where: { phone },
            include: {
                orders: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!customer) return null;
        const stats = await prisma.order.aggregate({
            where: { customerId: customer.id },
            _sum: { total: true },
            _count: { id: true }
        });
        return {
            ...customer,
            totalSpent: stats._sum.total || 0,
            totalCount: stats._count.id || 0
        };
    } catch (e) {
        console.error("Error fetching customer details:", e);
        return null;
    }
}

export async function getOrderStatus(orderId: number) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { items: true }
        });
        if (!order) return { success: false, error: "Commande introuvable" };
        return {
            success: true,
            status: order.status,
            customerName: order.customerName,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items,
            total: order.total,
            customerAddress: order.customerAddress,
            driverLat: order.driverLat,
            driverLng: order.driverLng
        };
    } catch (e) {
        console.error("Tracking Error:", e);
        return { success: false, error: "Erreur serveur" };
    }
}

export async function getAdminPizzas() {
    await checkAuth();
    return await prisma.pizza.findMany({ orderBy: { name: 'asc' } });
}

export async function createPizza(data: {
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    image: string;
    ingredients: string[];
}) {
    await checkAuth();
    try {
        await prisma.pizza.create({
            data: { ...data, ingredients: JSON.stringify(data.ingredients) }
        });
        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur création pizza" };
    }
}

export async function updatePizza(id: string, data: {
    name: string;
    description: string;
    basePrice: number;
    ingredients: string[];
    isAvailable: boolean;
}) {
    await checkAuth();
    try {
        await prisma.pizza.update({
            where: { id },
            data: { ...data, ingredients: JSON.stringify(data.ingredients) }
        });
        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur modification pizza" };
    }
}

export async function deletePizza(id: string) {
    await checkAuth();
    try {
        await prisma.pizza.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur suppression pizza" };
    }
}

export async function getAllIngredients() {
    const ingredients = await prisma.ingredient.findMany({ orderBy: { category: 'desc' } });
    return ingredients;
}

export async function createIngredient(data: {
    name: string;
    price: number;
    category: string;
}) {
    await checkAuth();
    try {
        await prisma.ingredient.create({
            data: { ...data, isAvailable: true }
        });
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur création ingrédient" };
    }
}

export async function updateIngredient(id: string, data: {
    name: string;
    price: number;
    category: string;
    isAvailable: boolean;
}) {
    await checkAuth();
    try {
        await prisma.ingredient.update({ where: { id }, data });
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur modification ingrédient" };
    }
}

export async function deleteIngredient(id: string) {
    await checkAuth();
    try {
        await prisma.ingredient.delete({ where: { id } });
        revalidatePath("/admin");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur suppression ingrédient" };
    }
}

export async function createCustomer(data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
}) {
    await checkAuth();
    const parsed = parsePhoneNumber(data.phone, 'BE');
    const normalizedPhone = parsed ? parsed.number : data.phone;

    try {
        await prisma.customer.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: normalizedPhone,
                email: data.email,
                address: data.address
            }
        });
        revalidatePath("/admin/clients");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur création client" };
    }
}

export async function updateCustomer(id: string, data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    address?: string;
    notes?: string;
}) {
    await checkAuth();
    const parsed = parsePhoneNumber(data.phone, 'BE');
    const normalizedPhone = parsed ? parsed.number : data.phone;

    try {
        await prisma.customer.update({
            where: { id },
            data: {
                ...data,
                phone: normalizedPhone
            }
        });
        revalidatePath("/admin/clients");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Erreur modification client" };
    }
}


export async function deleteCustomer(id: string) {
    await checkAuth();
    try {
        await prisma.customer.delete({ where: { id } });
        revalidatePath("/admin/clients");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Impossible supprimer client" };
    }
}

export async function sendOrderConfirmationEmail(orderId: number) {
    console.log(`[📧 EMAIL MOCK] Sending confirmation email for Order #${orderId}`);
    console.log(`[📧 EMAIL MOCK] Content: "Merci pour votre commande ! Votre pizza arrive..."`);
    return true;
}

export async function validatePayment(orderId: number) {
    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order || !order.paymentId) return { success: false };

        // CRITICAL FIX: If order is already in an advanced state, DO NOT revert to CONFIRMED.
        const advancedStatuses = ['PREPARING', 'READY', 'DELIVERING', 'LIVRAISON', 'COMPLETED', 'ON_THE_WAY'];
        if (order.status === 'CONFIRMED' || advancedStatuses.includes(order.status.toUpperCase())) {
            return { success: true, status: order.status };
        }

        // Check Mollie
        const payment = await mollieClient.payments.get(order.paymentId);

        if (payment.status === 'paid') {
            // Only update to CONFIRMED if it was PENDING/CREATED
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CONFIRMED' }
            });
            await sendOrderConfirmationEmail(orderId);
            revalidatePath(`/order/${orderId}/status`);
            return { success: true, status: 'CONFIRMED' };
        } else if (payment.status === 'canceled' || payment.status === 'expired') {
            await prisma.order.update({
                where: { id: orderId },
                data: { status: 'CANCELLED' }
            });
            revalidatePath(`/order/${orderId}/status`);
            return { success: true, status: 'CANCELLED' };
        }

        return { success: true, status: order.status };

    } catch (e) {
        console.error("Payment validation error:", e);
        return { success: false, error: "Validation failed" };
    }
}

export async function updateDriverLocation(orderId: number, lat: number, lng: number) {
    try {
        await prisma.order.update({
            where: { id: orderId },
            data: {
                driverLat: lat,
                driverLng: lng
            }
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to update driver location:", error);
        return { success: false, error: "Failed to update location" };
    }
}

export async function getDriverOrders() {
    try {
        const activeStatuses = ['PREPARING', 'READY', 'DELIVERING', 'ON_THE_WAY', 'LIVRAISON'];
        const orders = await prisma.order.findMany({
            where: {
                status: {
                    in: activeStatuses
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                items: true
            }
        });

        // Safe serialization using standard map
        return {
            success: true,
            orders: orders.map(order => ({
                id: order.id,
                status: order.status,
                customerName: order.customerName,
                customerAddress: order.customerAddress,
                customerPhone: order.customerPhone,
                total: order.total,
                createdAt: order.createdAt,
                items: order.items
            }))
        };
    } catch (e) {
        console.error("Failed to fetch driver orders:", e);
        return { success: false, error: "Impossible de charger les courses" };
    }
}
