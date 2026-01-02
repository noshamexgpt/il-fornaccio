"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pizza } from "@/lib/types";
import { motion } from "framer-motion";

interface PizzaCardProps {
    pizza: Pizza;
    onCustomize: (pizza: Pizza) => void;
}

export function PizzaCard({ pizza, onCustomize }: PizzaCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="group relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
        >
            <div className="aspect-square relative overflow-hidden bg-muted/20">
                <Image
                    src={pizza.image}
                    alt={pizza.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                <div className="absolute bottom-4 right-4">
                    <span className="text-2xl font-bold text-white drop-shadow-md">
                        {pizza.basePrice}€
                    </span>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div>
                    <h3 className="text-xl font-bold font-serif mb-2 group-hover:text-primary transition-colors">
                        {pizza.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2">
                        {pizza.description}
                    </p>
                </div>

                <Button
                    onClick={() => onCustomize(pizza)}
                    className="w-full bg-primary/90 hover:bg-primary text-primary-foreground group-hover:translate-y-0 transition-all"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Personnaliser & Commander
                </Button>
            </div>
        </motion.div>
    );
}
