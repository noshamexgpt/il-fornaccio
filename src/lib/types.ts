export type IngredientCategory = "base" | "cheese" | "meat" | "vegetable" | "finish";

export interface Ingredient {
    id: string;
    name: string;
    price: number;
    category: IngredientCategory;
    isDefault?: boolean; // If true, it's included in the base price of the pizza
}

export interface Pizza {
    id: string;
    slug: string;
    name: string;
    description: string;
    basePrice: number;
    image: string;
    ingredients: string[]; // List of ingredient IDs that come by default
}

export interface CartItem {
    id: string; // Unique ID for this specific cart item (uuid)
    pizzaId: string;
    name: string;
    basePrice: number;
    addedIngredients: string[]; // IDs of ingredients added by user
    removedIngredients: string[]; // IDs of default ingredients removed by user
    quantity: number;
    totalPrice: number;
}
