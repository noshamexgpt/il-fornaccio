import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const lastOrder = await prisma.order.findFirst({
            orderBy: { createdAt: 'desc' }
        });

        if (lastOrder) {
            console.log(`Found order #${lastOrder.id} - Current Status: ${lastOrder.status}`);
            const updated = await prisma.order.update({
                where: { id: lastOrder.id },
                data: {
                    status: 'DELIVERING',
                    updatedAt: new Date() // Updates timestamp for animations
                }
            });
            console.log(`Updated order #${updated.id} to ${updated.status}`);
        } else {
            console.log("No orders found.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
