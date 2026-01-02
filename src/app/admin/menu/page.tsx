import { prisma } from "@/lib/db";
import { AdminMenuClient } from "./menu-client";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
    const pizzas = await prisma.pizza.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6">
            <h1 className="text-3xl font-bold font-serif text-orange-500 mb-8">
                Gestion du Menu
            </h1>
            <AdminMenuClient pizzas={pizzas} />
        </div>
    );
}
