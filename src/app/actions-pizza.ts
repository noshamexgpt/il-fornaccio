"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { verifySession } from "@/lib/auth";

/**
 * Checks if the request is authenticated as an admin.
 */
async function checkAuth() {
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

/**
 * Pizza Management Actions
 */

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
            data: {
                ...data,
                ingredients: JSON.stringify(data.ingredients)
            }
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
            data: {
                ...data,
                ingredients: JSON.stringify(data.ingredients)
            }
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
