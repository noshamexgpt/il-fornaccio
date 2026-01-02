"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pizza, Ingredient } from "@/lib/types";
import { INGREDIENTS } from "@/lib/data";
import { useCartStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface PizzaBuilderProps {
    pizza: Pizza | null;
    isOpen: boolean;
    onClose: () => void;
}

export function PizzaBuilder({ pizza, isOpen, onClose }: PizzaBuilderProps) {
    const addItem = useCartStore((state) => state.addItem);

    // State for customization
    const [removedIngredients, setRemovedIngredients] = useState<Set<string>>(new Set());
    const [addedIngredients, setAddedIngredients] = useState<Set<string>>(new Set());

    // Reset state when pizza changes
    useEffect(() => {
        if (isOpen) {
            setRemovedIngredients(new Set());
            setAddedIngredients(new Set());
        }
    }, [isOpen, pizza]);

    if (!isOpen || !pizza) return null;

    const toggleRemoveDefault = (id: string) => {
        const next = new Set(removedIngredients);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setRemovedIngredients(next);
    };

    const toggleAddExtra = (id: string) => {
        const next = new Set(addedIngredients);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setAddedIngredients(next);
    };

    // Calculate prices
    const extrasPrice = Array.from(addedIngredients).reduce(
        (acc, id) => acc + INGREDIENTS[id].price,
        0
    );
    const totalPrice = pizza.basePrice + extrasPrice;

    const handleAddToCart = () => {
        addItem({
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            pizzaId: pizza.id,
            name: pizza.name,
            basePrice: pizza.basePrice,
            addedIngredients: Array.from(addedIngredients),
            removedIngredients: Array.from(removedIngredients),
            quantity: 1,
            totalPrice: totalPrice,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl h-[100dvh] md:h-[85vh] bg-card md:rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-20 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Left: Image & Summary */}
                    <div className="relative w-full md:w-5/12 min-h-[200px] md:min-h-full bg-muted/10">
                        <Image
                            src={pizza.image}
                            alt={pizza.name}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:bg-gradient-to-r" />

                        <div className="absolute bottom-6 left-6 text-white">
                            <h2 className="text-3xl font-serif font-bold mb-2">{pizza.name}</h2>
                            <p className="text-xl font-bold text-primary">{totalPrice.toFixed(2)}€</p>
                        </div>
                    </div>

                    {/* Right: Customization */}
                    <div className="flex-1 flex flex-col h-full bg-card overflow-hidden">
                        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

                            {/* Default Ingredients (Removable) */}
                            <section>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    Ingrédients de base
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {pizza.ingredients.map((id) => {
                                        const ing = INGREDIENTS[id];
                                        const isRemoved = removedIngredients.has(id);
                                        return (
                                            <div
                                                key={id}
                                                onClick={() => toggleRemoveDefault(id)}
                                                className={cn(
                                                    "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                                    isRemoved
                                                        ? "border-dashed border-muted-foreground/30 opacity-50 bg-muted/20"
                                                        : "border-border bg-card hover:border-primary/50"
                                                )}
                                            >
                                                <span className={cn("font-medium", isRemoved && "line-through")}>{ing.name}</span>
                                                {isRemoved ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4 text-destructive" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Extra Ingredients (Addable) */}
                            <section>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-primary rounded-full" />
                                    Suppléments
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.values(INGREDIENTS)
                                        .filter(i => !pizza.ingredients.includes(i.id))
                                        .map((ing) => {
                                            const isAdded = addedIngredients.has(ing.id);
                                            return (
                                                <div
                                                    key={ing.id}
                                                    onClick={() => toggleAddExtra(ing.id)}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                                        isAdded
                                                            ? "border-primary bg-primary/10"
                                                            : "border-border hover:border-primary/50"
                                                    )}
                                                >
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{ing.name}</span>
                                                        <span className="text-xs text-muted-foreground">+{ing.price.toFixed(2)}€</span>
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full flex items-center justify-center transition-colors",
                                                        isAdded ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                    )}>
                                                        <Check className={cn("w-4 h-4", !isAdded && "opacity-0")} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </section>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-border bg-card">
                            <Button
                                onClick={handleAddToCart}
                                size="lg"
                                className="w-full text-lg h-14 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                Ajouter au panier - {totalPrice.toFixed(2)}€
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
