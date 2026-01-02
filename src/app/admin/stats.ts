import { prisma } from "@/lib/db";

export async function getAdminStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Daily Stats
    // Aggregate orders created today which are NOT cancelled
    const todayOrders = await prisma.order.findMany({
        where: {
            createdAt: { gte: today },
            status: { not: "CANCELLED" }
        },
        include: { items: true }
    });

    const dailyRevenue = todayOrders.reduce((acc, order) => acc + order.total, 0);
    const todayCount = todayOrders.length;

    // 2. Global Stats
    const allOrders = await prisma.order.findMany({
        where: { status: { not: "CANCELLED" } }
    });
    const totalRevenue = allOrders.reduce((acc, order) => acc + order.total, 0);
    const totalCount = allOrders.length;

    // 3. Best Seller Calculation
    const allItems = await prisma.orderItem.findMany({
        where: {
            order: { status: { not: "CANCELLED" } }
        }
    });

    const pizzaStats: Record<string, { count: number, total: number }> = {};

    // We also need pizza base prices to calculate total generated revenue per pizza type nicely
    // or we can sum up the orderItem prices. 
    // Since orderItem stores finalPrice, we can use that.

    allItems.forEach(item => {
        if (!pizzaStats[item.pizzaName]) {
            pizzaStats[item.pizzaName] = { count: 0, total: 0 };
        }
        pizzaStats[item.pizzaName].count += item.quantity;
        pizzaStats[item.pizzaName].total += item.finalPrice;
    });

    // Convert to array and sort
    const bestSellers = Object.entries(pizzaStats)
        .map(([name, stats]) => ({
            name,
            count: stats.count,
            total: stats.total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5); // Top 5

    // Legacy support for single bestseller if needed elsewhere (though we updated dashboard)
    const bestSellerName = bestSellers[0]?.name || "N/A";
    const bestSellerCount = bestSellers[0]?.count || 0;

    return {
        dailyRevenue,
        todayCount,
        totalRevenue,
        totalCount,
        bestSellers,
        bestSellerName,
        bestSellerCount
    };
}
