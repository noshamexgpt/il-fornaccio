import { Ingredient, Pizza } from "./types";

export const INGREDIENTS: Record<string, Ingredient> = {
    // Base
    "tomato-sauce": { id: "tomato-sauce", name: "Sauce Tomate San Marzano", price: 0, category: "base" },
    "creme-fraiche": { id: "creme-fraiche", name: "Crème Fraîche", price: 0, category: "base" },

    // Cheese
    "mozzarella": { id: "mozzarella", name: "Mozzarella Fior di Latte", price: 1.5, category: "cheese" },
    "buffalo-mozzarella": { id: "buffalo-mozzarella", name: "Mozzarella di Bufala", price: 3, category: "cheese" },
    "gorgonzola": { id: "gorgonzola", name: "Gorgonzola DOP", price: 2, category: "cheese" },
    "parmesan": { id: "parmesan", name: "Parmigiano Reggiano", price: 1.5, category: "cheese" },

    // Meat
    "spicy-salami": { id: "spicy-salami", name: "Spianata Piccante", price: 2, category: "meat" },
    "parma-ham": { id: "parma-ham", name: "Jambon de Parme (24 mois)", price: 3, category: "meat" },
    "cooked-ham": { id: "cooked-ham", name: "Jambon Blanc aux Herbes", price: 2, category: "meat" },

    // Vegetable
    "basil": { id: "basil", name: "Basilic Frais", price: 0.5, category: "vegetable" },
    "mushrooms": { id: "mushrooms", name: "Champignons de Paris", price: 1, category: "vegetable" },
    "cherry-tomatoes": { id: "cherry-tomatoes", name: "Tomates Cerises", price: 1.5, category: "vegetable" },
    "arugula": { id: "arugula", name: "Roquette", price: 1, category: "vegetable" },
    "olives": { id: "olives", name: "Olives Taggiasca", price: 1, category: "vegetable" },

    // Finish
    "truffle-oil": { id: "truffle-oil", name: "Huile de Truffe Blanche", price: 2, category: "finish" },
    "honey": { id: "honey", name: "Miel d'Acacia", price: 1, category: "finish" },

    // New Ingredients
    "base-white": { id: "base-white", name: "Base Blanche (Crème)", price: 0, category: "base" },
    "goat-cheese": { id: "goat-cheese", name: "Chèvre Affiné", price: 2, category: "cheese" },
    "egg": { id: "egg", name: "Œuf Bio", price: 1, category: "meat" },
    "peppers": { id: "peppers", name: "Poivrons Grillés", price: 1.5, category: "vegetable" },
    "zucchini": { id: "zucchini", name: "Courgettes", price: 1.5, category: "vegetable" },
    "eggplant": { id: "eggplant", name: "Aubergines", price: 1.5, category: "vegetable" },
    "anchovies": { id: "anchovies", name: "Anchois de Cetara", price: 2, category: "meat" },
    "capers": { id: "capers", name: "Câpres au Sel", price: 1, category: "vegetable" },
    "artichokes": { id: "artichokes", name: "Cœurs d'Artichauts", price: 2, category: "vegetable" },
};

export const PIZZAS: Pizza[] = [
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
