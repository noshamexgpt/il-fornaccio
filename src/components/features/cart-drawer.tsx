"use client";

import { useEffect, useState } from "react";
import { X, Trash2, ShoppingBag, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { INGREDIENTS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { checkoutSchema, CheckoutFormData } from "@/lib/schemas";
import { submitOrder } from "@/app/actions";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { useRouter } from "next/navigation";

// Actually I don't see sonner installed. I'll stick to local state isSuccess/isError.

export function CartDrawer() {
    const { items, removeItem, total, clearCart, isOpen, closeCart } = useCartStore();
    const onClose = closeCart;
    const [mounted, setMounted] = useState(false);
    const [isCheckout, setIsCheckout] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const router = useRouter();

    const onSubmit = async (data: CheckoutFormData) => {
        setServerError(null);
        try {
            const result = await submitOrder(data, items, total());

            if (result.success) {
                // 1. Order created in DB
                // 2. Initiate Payment
                const paymentRes = await fetch('/api/create-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId: result.orderId }),
                });

                const paymentData = await paymentRes.json();

                if (paymentData.checkoutUrl) {
                    // Redirect to Mollie
                    window.location.href = paymentData.checkoutUrl;
                } else {
                    setServerError("Erreur initialisation paiement");
                }
            } else {
                setServerError(result.error || "Une erreur est survenue");
            }
        } catch (e) {
            console.error(e);
            setServerError("Erreur de connexion serveur");
        }
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col"
                    >
                        {/* Success State */}
                        {isSuccess ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                                    <ShoppingBag className="w-10 h-10" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold font-serif mb-2">Commande Reçue !</h2>
                                    <p className="text-muted-foreground">
                                        Merci pour votre commande. Elle est en cours de préparation et arrivera bientôt.
                                    </p>
                                </div>
                                <Button onClick={onClose} className="bg-primary text-primary-foreground">
                                    Retour à l'accueil
                                </Button>
                            </div>
                        ) : (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-border flex items-center justify-between bg-muted/10">
                                    <div className="flex items-center gap-2">
                                        {isCheckout ? (
                                            <Button variant="ghost" size="icon" onClick={() => setIsCheckout(false)} className="-ml-2 mr-1">
                                                <ArrowLeft className="w-5 h-5" />
                                            </Button>
                                        ) : (
                                            <ShoppingBag className="w-6 h-6 text-primary" />
                                        )}
                                        <h2 className="text-xl md:text-2xl font-serif font-bold">
                                            {isCheckout ? "Paiement" : "Votre Panier"}
                                        </h2>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-destructive/10 hover:text-destructive">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    {isCheckout ? (
                                        /* Checkout Form */
                                        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Nom complet</label>
                                                    <input
                                                        {...register("name")}
                                                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                                        placeholder="Jean Dupont"
                                                    />
                                                    {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Téléphone</label>
                                                    <input
                                                        {...register("phone")}
                                                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                                        placeholder="06 12 34 56 78"
                                                    />
                                                    {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Adresse de livraison</label>
                                                    <AddressAutocomplete
                                                        {...register("address")}
                                                        className="w-full h-10 px-3 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                                                        placeholder="12 rue de la Paix, 75000 Paris"
                                                        onAddressSelect={(addr) => {
                                                            setValue("address", addr, { shouldValidate: true });
                                                        }}
                                                    />
                                                    {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium">Instructions (Optionnel)</label>
                                                    <textarea
                                                        {...register("instructions")}
                                                        className="w-full h-16 px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                                                        placeholder="Digicode, étage, sans gluten..."
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-muted/30 p-4 rounded-xl space-y-2 border border-border/50">
                                                <div className="flex justify-between text-sm">
                                                    <span>Sous-total</span>
                                                    <span>{total().toFixed(2)}€</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>Livraison</span>
                                                    <span>Gratuite</span>
                                                </div>
                                                <div className="pt-2 border-t border-border flex justify-between font-bold text-lg">
                                                    <span>Total</span>
                                                    <span className="text-primary">{total().toFixed(2)}€</span>
                                                </div>
                                            </div>

                                            {serverError && (
                                                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm font-medium">
                                                    {serverError}
                                                </div>
                                            )}
                                        </form>
                                    ) : (
                                        /* Cart Items */
                                        <div className="space-y-6">
                                            {items.length === 0 ? (
                                                <div className="h-[50vh] flex flex-col items-center justify-center text-muted-foreground space-y-4">
                                                    <ShoppingBag className="w-16 h-16 opacity-20" />
                                                    <p className="text-lg">Votre panier est vide</p>
                                                    <Button variant="link" onClick={onClose} className="text-primary">
                                                        Découvrir notre menu
                                                    </Button>
                                                </div>
                                            ) : (
                                                items.map((item) => (
                                                    <div key={item.id} className="bg-muted/30 rounded-xl p-4 border border-border/50 space-y-3">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                                <p className="text-sm text-primary font-medium">{item.totalPrice.toFixed(2)}€</p>
                                                            </div>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => removeItem(item.id)}
                                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>

                                                        {(item.removedIngredients.length > 0 || item.addedIngredients.length > 0) && (
                                                            <div className="text-xs space-y-1 bg-background/50 p-2 rounded-lg border border-border/50">
                                                                {item.removedIngredients.map(id => (
                                                                    <div key={id} className="text-destructive flex items-center gap-1">
                                                                        <span className="w-1 h-1 bg-destructive rounded-full" />
                                                                        Sans {INGREDIENTS[id].name}
                                                                    </div>
                                                                ))}
                                                                {item.addedIngredients.map(id => (
                                                                    <div key={id} className="text-green-500 flex items-center gap-1">
                                                                        <span className="w-1 h-1 bg-green-500 rounded-full" />
                                                                        + {INGREDIENTS[id].name}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                {items.length > 0 && (
                                    <div className="p-6 border-t border-border bg-muted/10 space-y-4">
                                        {!isCheckout ? (
                                            <>
                                                <div className="flex items-center justify-between text-lg font-medium">
                                                    <span>Total</span>
                                                    <span className="text-2xl font-bold font-serif text-primary">{total().toFixed(2)}€</span>
                                                </div>
                                                <Button
                                                    onClick={() => setIsCheckout(true)}
                                                    className="w-full text-lg h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                                                >
                                                    Commander
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="submit"
                                                form="checkout-form"
                                                disabled={isSubmitting}
                                                className="w-full text-lg h-12 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <CreditCard className="w-5 h-5" />
                                                        Payer avec Mollie {total().toFixed(2)}€
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
