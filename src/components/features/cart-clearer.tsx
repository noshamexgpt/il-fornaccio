"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store";

export function CartClearer() {
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return null;
}
