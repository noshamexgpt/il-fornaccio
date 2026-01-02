import { PrismaClient } from "@prisma/client";
import { INGREDIENTS } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding ingredients...");

    for (const [key, ingredient] of Object.entries(INGREDIENTS)) {
        await prisma.ingredient.upsert({
            where: { id: ingredient.id },
            update: {
                name: ingredient.name,
                price: ingredient.price,
                category: ingredient.category,
            },
            create: {
                id: ingredient.id,
                name: ingredient.name,
                price: ingredient.price,
                category: ingredient.category,
                isAvailable: true,
            }
        });
        console.log(`Upserted ingredient: ${ingredient.name}`);
    }

    console.log("Seeding finished.");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
