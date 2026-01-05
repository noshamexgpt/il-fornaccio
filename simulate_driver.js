
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const orderId = 4;
    console.log(`Updating Order ${orderId} location...`);

    // Set location to somewhere in Brussels (e.g. near Cathedral)
    // Grand Place: 50.8467, 4.3524
    // Cathedral: 50.847556, 4.360098

    const lat = 50.847556;
    const lng = 4.360098;

    await prisma.order.update({
        where: { id: orderId },
        data: {
            driverLat: lat,
            driverLng: lng
        }
    });

    console.log('Location updated to:', lat, lng);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
