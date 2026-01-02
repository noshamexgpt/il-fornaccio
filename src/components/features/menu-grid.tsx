"use client";

import { useState } from "react";
import { PizzaCard } from "@/components/features/pizza-card";
import { PizzaBuilder } from "@/components/features/pizza-builder";
import { Pizza } from "@prisma/client";

interface MenuGridProps {
    pizzas: any[]; // Using any to avoid strict type issues with JSON ingredients for now, or assume compatible shape
}

export function MenuGrid({ pizzas }: MenuGridProps) {
    // Map Prisma pizzas to app Pizza type (parse ingredients JSON)
    const typedPizzas = pizzas.map(p => ({
        ...p,
        ingredients: typeof p.ingredients === 'string' ? JSON.parse(p.ingredients) : p.ingredients
    }));

    const [selectedPizza, setSelectedPizza] = useState<any | null>(null);
    const [isBuilderOpen, setIsBuilderOpen] = useState(false);

    const handleCustomize = (pizza: any) => {
        setSelectedPizza(pizza);
        setIsBuilderOpen(true);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {typedPizzas.map((pizza) => (
                    <PizzaCard
                        key={pizza.id}
                        pizza={pizza}
                        onCustomize={handleCustomize}
                    />
                ))}
            </div>

            <PizzaBuilder
                pizza={selectedPizza}
                isOpen={isBuilderOpen}
                onClose={() => setIsBuilderOpen(false)}
            />
        </>
    );
}
