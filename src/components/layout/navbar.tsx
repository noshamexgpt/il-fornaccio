"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Pizza } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useCartStore } from "@/lib/store";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const { items, openCart } = useCartStore();

    // Calculate total items count
    const itemCount = items.length;

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-transparent",
                isScrolled ? "bg-background/80 backdrop-blur-md border-border py-2" : "bg-transparent py-4"
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground group-hover:scale-110 transition-transform">
                        <Pizza className="w-6 h-6" />
                    </div>
                    <span className="text-xl md:text-2xl font-bold font-serif tracking-tight text-foreground">
                        Il Fornaccio
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Accueil
                    </Link>
                    <Link href="#menu" className="text-sm font-medium hover:text-primary transition-colors">
                        Nos Pizzas
                    </Link>
                    <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">
                        À propos
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative hover:bg-muted/50"
                        onClick={openCart}
                    >
                        <ShoppingCart className="w-5 h-5" />
                        {itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center animate-in zoom-in">
                                {itemCount}
                            </span>
                        )}
                    </Button>
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={openCart}
                        className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                        Commander
                    </Button>
                </div>
            </div>
        </header>
    );
}
