import { PrismaClient } from "@prisma/client";
import { PIZZAS } from "../src/lib/data";

const prisma = new PrismaClient();

async function main() {
    console.log("Seeding pizzas...");

    for (const pizza of PIZZAS) {
        const { id, ...data } = pizza;
        await prisma.pizza.upsert({
            where: { slug: pizza.slug }, // Use slug as unique identifier if ID might clash or to avoid duplicates
            update: {
                name: pizza.name,
                description: pizza.description,
                basePrice: pizza.basePrice,
                image: pizza.image,
                ingredients: JSON.stringify(pizza.ingredients),
                isAvailable: true,
            },
            create: {
                slug: pizza.slug,
                name: pizza.name,
                description: pizza.description,
                basePrice: pizza.basePrice,
                image: pizza.image,
                ingredients: JSON.stringify(pizza.ingredients),
                isAvailable: true,
            },
        });
        console.log(`Upserted pizza: ${pizza.name}`);
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
