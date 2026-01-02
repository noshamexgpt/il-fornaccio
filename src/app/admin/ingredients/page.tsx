import { getAllIngredients } from "@/app/actions";
import { IngredientsClient } from "./ingredients-client";

export default async function IngredientsPage() {
    const ingredients = await getAllIngredients();
    return <IngredientsClient ingredients={ingredients} />;
}
