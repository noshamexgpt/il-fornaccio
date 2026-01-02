const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PIZZAS = [
    {
        id: "margherita",
        slug: "margherita",
        name: "Margherita",
        description: "L'incontournable. Sauce tomate San Marzano, mozzarella fior di latte, basilic frais, huile d'olive vierge.",
        basePrice: 12,
        image: "/pizza-margherita.png",
        ingredients: ["tomato-sauce", "mozzarella", "basil"],
    },
    {
        id: "diavola",
        slug: "diavola",
        name: "Diavola",
        description: "Pour les amateurs de piquant. Sauce tomate, mozzarella, spianata piccante, olives noires.",
        basePrice: 14,
        image: "/pizza-diavola.png",
        ingredients: ["tomato-sauce", "mozzarella", "spicy-salami", "olives"],
    },
    {
        id: "tartufo",
        slug: "tartufo",
        name: "Tartufo",
        description: "Élégance et saveurs. Crème de truffe, mozzarella, champignons, huile de truffe.",
        basePrice: 18,
        image: "/pizza-tartufo.png",
        ingredients: ["creme-fraiche", "mozzarella", "mushrooms", "truffle-oil"],
    },
    {
        id: "regina",
        slug: "regina",
        name: "Regina",
        description: "La reine des classiques. Sauce tomate, mozzarella, jambon blanc, champignons frais.",
        basePrice: 13,
        image: "/pizza-regina.png",
        ingredients: ["tomato-sauce", "mozzarella", "cooked-ham", "mushrooms"],
    },
    {
        id: "4-formaggi",
        slug: "4-formaggi",
        name: "4 Formaggi",
        description: "L'alliance parfaite. Mozzarella, gorgonzola, parmesan, chèvre.",
        basePrice: 15,
        image: "/pizza-4-formaggi.png",
        ingredients: ["base-white", "mozzarella", "gorgonzola", "parmesan", "goat-cheese"],
    },
    {
        id: "calzone",
        slug: "calzone",
        name: "Calzone",
        description: "Le chausson gourmand. Sauce tomate, mozzarella, jambon, œuf (à l'intérieur).",
        basePrice: 14,
        image: "/pizza-calzone.png",
        ingredients: ["tomato-sauce", "mozzarella", "cooked-ham", "egg"],
    },
    {
        id: "vegetariana",
        slug: "vegetariana",
        name: "Vegetariana",
        description: "Fraîcheur du jardin. Sauce tomate, mozzarella, poivrons, courgettes, aubergines grillées.",
        basePrice: 14,
        image: "/pizza-vegetariana.png",
        ingredients: ["tomato-sauce", "mozzarella", "peppers", "zucchini", "eggplant"],
    },
    {
        id: "napoli",
        slug: "napoli",
        name: "Napoli",
        description: "L'authentique. Sauce tomate, mozzarella, anchois, câpres, origan.",
        basePrice: 13,
        image: "/pizza-napoli.png",
        ingredients: ["tomato-sauce", "mozzarella", "anchovies", "capers"],
    },
    {
        id: "capricciosa",
        slug: "capricciosa",
        name: "Capricciosa",
        description: "La capricieuse. Sauce tomate, mozzarella, jambon, champignons, artichauts, olives.",
        basePrice: 15,
        image: "/pizza-capricciosa.png",
        ingredients: ["tomato-sauce", "mozzarella", "cooked-ham", "mushrooms", "artichokes", "olives"],
    },
    {
        id: "parma",
        slug: "parma",
        name: "Parma",
        description: "Raffinement italien. Sauce tomate, mozzarella, jambon de Parme, roquette, copeaux de parmesan.",
        basePrice: 16,
        image: "/pizza-parma.png",
        ingredients: ["tomato-sauce", "mozzarella", "parma-ham", "arugula", "parmesan"],
    }
];

async function main() {
    console.log(`Start seeding ...`);
    for (const pizza of PIZZAS) {
        const user = await prisma.pizza.upsert({
            where: { slug: pizza.slug },
            update: {},
            create: {
                id: pizza.id,
                slug: pizza.slug,
                name: pizza.name,
                description: pizza.description,
                basePrice: pizza.basePrice,
                image: pizza.image,
                ingredients: JSON.stringify(pizza.ingredients),
                isAvailable: true
            },
        });
        console.log(`Created pizza with id: ${user.id}`);
    }
    console.log(`Seeding finished.`);
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
