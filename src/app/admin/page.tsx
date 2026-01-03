
import { prisma } from "@/lib/db";
import { AdminBoard } from "./board";
import { getAdminStats } from "./stats";
import { AdminStats } from "./AdminStats";

// Server Component fetching data
export default async function AdminPage() {
    // Fetch active orders (non-archived)
    const activeOrders = await prisma.order.findMany({
        where: {
            status: {
                in: ["PENDING", "CONFIRMED", "PREPARING", "READY"]
            }
        },
        include: {
            items: true
        },
        orderBy: {
            createdAt: 'asc'
        }
    });

    const stats = await getAdminStats();

    const pizzas = await prisma.pizza.findMany({ orderBy: { name: 'asc' } });
    const ingredients = await prisma.ingredient.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="space-y-8 h-full flex flex-col pt-6">
            <h2 className="text-3xl font-bold font-serif text-white">Tableau de Bord</h2>
            <AdminStats stats={stats} />
            <div className="flex-1 min-h-0">
                <AdminBoard orders={activeOrders} pizzas={pizzas} ingredients={ingredients} />
            </div>
        </div>
    );
}

