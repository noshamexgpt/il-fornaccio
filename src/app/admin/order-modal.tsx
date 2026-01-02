"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2, Trash2, ShoppingCart, Edit2, Check, Save, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { INGREDIENTS } from "@/lib/data";
import { createManualOrder, updateManualOrder, searchCustomers } from "@/app/actions";

interface CartItem {
    pizzaId: string;
    name: string;
    quantity: number;
    price: number;
    modifications: {
        added: string[];
        removed: string[];
    };
}

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    existingOrder?: any;
    pizzas: any[];
}

export function OrderModal({ isOpen, onClose, existingOrder, pizzas }: OrderModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");
    const [type, setType] = useState<'takeaway' | 'delivery'>('takeaway');
    const [address, setAddress] = useState("");

    // Search State
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [activeSearchField, setActiveSearchField] = useState<'phone' | 'firstName' | 'lastName' | null>(null);

    // Item Selection State
    const [selectedPizzaId, setSelectedPizzaId] = useState(pizzas[0]?.id || "");
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);

    // Edit Modal State
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    // Load existing order data
    useEffect(() => {
        if (existingOrder) {
            // Try to split name if it matches "First Last" pattern from DB
            // This is a best-effort since we stored it as string
            const parts = (existingOrder.customerName || "").split(" ");
            const last = parts.pop() || "";
            const first = parts.join(" ") || last;

            setFirstName(first);
            setLastName(last);
            setPhone(existingOrder.customerPhone || "");
            setType(existingOrder.instructions?.includes("LIVRAISON") ? 'delivery' : 'takeaway');
            setAddress(existingOrder.customerAddress === "A emporter (Comptoir)" ? "" : existingOrder.customerAddress);

            // Reconstruct Cart
            const loadedCart: CartItem[] = existingOrder.items.map((item: any) => {
                const matchedPizza = pizzas.find(p => p.name === item.pizzaName) || pizzas[0];

                let mods = { added: [], removed: [] };
                try {
                    mods = JSON.parse(item.modifications);
                } catch (e) { }

                return {
                    pizzaId: matchedPizza?.id || "unknown",
                    name: item.pizzaName,
                    quantity: item.quantity,
                    price: item.finalPrice,
                    modifications: mods
                };
            });
            setCart(loadedCart);
        } else {
            // Reset
            setFirstName("");
            setLastName("");
            setPhone("");
            setType('takeaway');
            setAddress("");
            setCart([]);
            setSearchResults([]);
            setShowResults(false);
        }
    }, [existingOrder, isOpen]);

    // Customer Search Logic
    const handleSearch = useCallback(async (query: string, field: 'phone' | 'firstName' | 'lastName') => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setActiveSearchField(field);

        try {
            const results = await searchCustomers(query);
            setSearchResults(results);
            setShowResults(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const selectCustomer = (customer: any) => {
        setFirstName(customer.firstName);
        setLastName(customer.lastName);
        setPhone(customer.phone);
        if (customer.address) {
            setAddress(customer.address);
            setType('delivery');
        }
        setShowResults(false);
        setActiveSearchField(null);
    };

    // Debounce search for Name (First or Last)
    useEffect(() => {
        const timer = setTimeout(() => {
            if (lastName.length >= 2 && !existingOrder && activeSearchField !== 'phone' && activeSearchField !== 'firstName') {
                handleSearch(lastName, 'lastName');
            } else if (firstName.length >= 2 && !existingOrder && activeSearchField !== 'phone' && activeSearchField !== 'lastName') {
                handleSearch(firstName, 'firstName');
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [firstName, lastName, handleSearch, existingOrder, activeSearchField]);

    // Debounce search for Phone
    useEffect(() => {
        const timer = setTimeout(() => {
            if (phone.length >= 2 && !existingOrder && activeSearchField !== 'firstName' && activeSearchField !== 'lastName') {
                handleSearch(phone, 'phone');
            } else if (phone.length < 2 && activeSearchField === 'phone') {
                setShowResults(false);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [phone, handleSearch, existingOrder, activeSearchField]);


    const addToCart = () => {
        const pizza = pizzas.find(p => p.id === selectedPizzaId);
        if (!pizza) return;

        setCart(prev => [
            ...prev,
            {
                pizzaId: pizza.id,
                name: pizza.name,
                quantity: selectedQuantity,
                price: pizza.basePrice * selectedQuantity,
                modifications: { added: [], removed: [] }
            }
        ]);
        setSelectedQuantity(1);
    };

    const removeFromCart = (index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateCartItem = (index: number, mods: { added: string[], removed: string[] }) => {
        setCart(prev => prev.map((item, i) =>
            i === index ? { ...item, modifications: mods } : item
        ));
        setEditingItemIndex(null);
    };

    const cartTotal = cart.reduce((acc, item) => acc + item.price, 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cart.length === 0) {
            setError("Ajoutez au moins une pizza !");
            return;
        }

        setIsLoading(true);
        setError(null);

        const orderData = {
            customerName: `${firstName} ${lastName}`,
            firstName,
            lastName,
            customerPhone: phone,
            customerAddress: address,
            type,
            items: cart.map(item => ({
                pizzaId: item.pizzaId,
                quantity: item.quantity,
                modifications: item.modifications
            }))
        };

        let res;
        if (existingOrder) {
            res = await updateManualOrder(existingOrder.id, orderData);
        } else {
            res = await createManualOrder(orderData);
        }

        if (res.success) {
            onClose();
            if (!existingOrder) {
                setFirstName("");
                setLastName("");
                setPhone("");
                setAddress("");
                setCart([]);
            }
        } else {
            setError(res.error || "Erreur");
        }
        setIsLoading(false);
    };

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
                        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
                    />

                    {/* Main Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold font-serif">
                                {existingOrder ? `Modifier #${existingOrder.id}` : "Nouvelle Commande"}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Type Selection */}
                            <div className="flex bg-slate-800 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setType('takeaway')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'takeaway'
                                        ? 'bg-orange-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    A Emporter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('delivery')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'delivery'
                                        ? 'bg-orange-600 text-white shadow'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    Livraison
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-slate-200">Téléphone</label>
                                    <div className="relative">
                                        <Input
                                            required
                                            value={phone}
                                            onChange={(e) => {
                                                setPhone(e.target.value);
                                                setActiveSearchField('phone');
                                                setShowResults(true);
                                            }}
                                            onFocus={() => {
                                                if (searchResults.length > 0 && activeSearchField === 'phone') setShowResults(true);
                                            }}
                                            placeholder="Ex: 06..."
                                            className="bg-slate-800 border-slate-700 text-white pl-8"
                                            autoComplete="off"
                                        />
                                        <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                                    </div>

                                    {/* Phone Results Dropdown */}
                                    <AnimatePresence>
                                        {showResults && activeSearchField === 'phone' && searchResults.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto"
                                            >
                                                {searchResults.map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => selectCustomer(customer)}
                                                        className="w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col gap-0.5 border-b border-slate-700/50 last:border-0"
                                                    >
                                                        <span className="text-orange-400 font-bold">{customer.name}</span>
                                                        <span className="text-xs text-slate-400">{customer.phone}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-slate-200">Prénom</label>
                                    <Input
                                        required
                                        value={firstName}
                                        onChange={(e) => {
                                            setFirstName(e.target.value);
                                            setActiveSearchField('firstName');
                                        }}
                                        onFocus={() => {
                                            if (searchResults.length > 0 && activeSearchField === 'firstName') setShowResults(true);
                                        }}
                                        placeholder="Ex: Thomas"
                                        className="bg-slate-800 border-slate-700 text-white"
                                        autoComplete="off"
                                    />
                                    {/* FirstName Search Results */}
                                    <AnimatePresence>
                                        {showResults && activeSearchField === 'firstName' && searchResults.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto"
                                            >
                                                {searchResults.map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => selectCustomer(customer)}
                                                        className="w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col gap-0.5 border-b border-slate-700/50 last:border-0"
                                                    >
                                                        <span className="text-orange-400 font-bold">{customer.name}</span>
                                                        <span className="text-xs text-slate-400">{customer.phone}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-sm font-medium text-slate-200">Nom</label>
                                    <Input
                                        required
                                        value={lastName}
                                        onChange={(e) => {
                                            setLastName(e.target.value);
                                            setActiveSearchField('lastName');
                                        }}
                                        onFocus={() => {
                                            if (searchResults.length > 0 && activeSearchField === 'lastName') setShowResults(true);
                                        }}
                                        placeholder="Ex: Dupuis"
                                        className="bg-slate-800 border-slate-700 text-white"
                                        autoComplete="off"
                                    />
                                    {/* LastName Search Results */}
                                    <AnimatePresence>
                                        {showResults && activeSearchField === 'lastName' && searchResults.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-md shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto"
                                            >
                                                {searchResults.map(customer => (
                                                    <button
                                                        key={customer.id}
                                                        type="button"
                                                        onClick={() => selectCustomer(customer)}
                                                        className="w-full text-left px-3 py-2 hover:bg-slate-700 flex flex-col gap-0.5 border-b border-slate-700/50 last:border-0"
                                                    >
                                                        <span className="text-orange-400 font-bold">{customer.name}</span>
                                                        <span className="text-xs text-slate-400">{customer.phone}</span>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {type === 'delivery' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-2"
                                >
                                    <label className="text-sm font-medium text-slate-200">Adresse</label>
                                    <AddressAutocomplete
                                        required
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        onAddressSelect={(addr) => setAddress(addr)}
                                        placeholder="Adresse complète"
                                        className="bg-slate-800 border-slate-700 text-white"
                                    />
                                </motion.div>
                            )}

                            <div className="border-t border-slate-800 pt-4 space-y-3">
                                <label className="text-sm font-medium text-slate-200 flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4" /> Pizza
                                </label>

                                <div className="flex gap-2">
                                    <select
                                        value={selectedPizzaId}
                                        onChange={(e) => setSelectedPizzaId(e.target.value)}
                                        className="flex-1 h-10 rounded-md border border-slate-700 bg-slate-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        {pizzas.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} ({p.basePrice}€)</option>
                                        ))}
                                    </select>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={selectedQuantity}
                                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                                        className="w-20 bg-slate-800 border-slate-700 text-white"
                                    />
                                    <Button type="button" onClick={addToCart} className="bg-slate-700 hover:bg-slate-600 text-white">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Cart Summary */}
                            {cart.length > 0 && (
                                <div className="bg-slate-950/50 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                                    {cart.map((item, idx) => (
                                        <div key={idx} className="flex flex-col gap-1 border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                                            <div className="flex justify-between items-center text-sm text-slate-300">
                                                <span>{item.quantity}x {item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span>{item.price}€</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingItemIndex(idx)}
                                                        className="text-slate-400 hover:text-white p-1"
                                                    >
                                                        <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFromCart(idx)}
                                                        className="text-slate-400 hover:text-red-400 p-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            {(item.modifications.added.length > 0 || item.modifications.removed.length > 0) && (
                                                <div className="flex flex-wrap gap-1 text-[10px]">
                                                    {item.modifications.removed.map(r => (
                                                        <span key={r} className="text-red-400 bg-red-400/10 px-1 rounded">- {INGREDIENTS[r]?.name || r}</span>
                                                    ))}
                                                    {item.modifications.added.map(a => (
                                                        <span key={a} className="text-green-400 bg-green-400/10 px-1 rounded">+ {INGREDIENTS[a]?.name || a}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div className="pt-2 flex justify-between font-bold text-white">
                                        <span>Total</span>
                                        <span>{cartTotal}€</span>
                                    </div>
                                </div>
                            )}

                            {error && <p className="text-red-400 text-sm">{error}</p>}

                            <div className="pt-2 flex justify-end gap-2">
                                <Button variant="ghost" type="button" onClick={onClose} className="hover:bg-slate-800 text-slate-300">
                                    Annuler
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || cart.length === 0}
                                    className="bg-orange-600 hover:bg-orange-700 text-white min-w-[100px]"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (existingOrder ? <><Save className="w-4 h-4 mr-1" /> Enregistrer</> : `Créer (${cartTotal}€)`)}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}

            {/* Edit Ingredients Sub-Modal (Reused) */}
            {editingItemIndex !== null && (
                <IngredientEditor
                    item={cart[editingItemIndex]}
                    onSave={(mods) => updateCartItem(editingItemIndex, mods)}
                    onClose={() => setEditingItemIndex(null)}
                    pizzas={pizzas}
                />
            )}
        </AnimatePresence>
    );
}

// Sub Component for Editing Ingredients
function IngredientEditor({ item, onSave, onClose, pizzas }: { item: CartItem, onSave: (mods: { added: string[], removed: string[] }) => void, onClose: () => void, pizzas: any[] }) {
    const pizza = pizzas.find(p => p.id === item.pizzaId);
    if (!pizza) return null;

    // pizza.ingredients is JSON string in DB, but prisma might auto-parse if typed? 
    // Wait, in schema it is String. But previously in file it was string[].
    // If I fetch from DB, it is a String. I need to JSON.parse it?
    // In seed script I did JSON.stringify.
    // So here I must parse it.
    let baseIngredients: string[] = [];
    try {
        if (typeof pizza.ingredients === 'string') {
            baseIngredients = JSON.parse(pizza.ingredients);
        } else {
            // Fallback if somehow it's already array (unlikely with prisma typed client but possible if I mocked it)
            baseIngredients = pizza.ingredients;
        }
    } catch (e) { baseIngredients = [] }

    const allIngredients = Object.values(INGREDIENTS);

    const [removed, setRemoved] = useState<string[]>(item.modifications.removed);
    const [added, setAdded] = useState<string[]>(item.modifications.added);

    const toggleBase = (ingId: string) => {
        if (removed.includes(ingId)) {
            setRemoved(removed.filter(id => id !== ingId));
        } else {
            setRemoved([...removed, ingId]);
        }
    };

    const toggleExtra = (ingId: string) => {
        if (added.includes(ingId)) {
            setAdded(added.filter(id => id !== ingId));
        } else {
            setAdded([...added, ingId]);
        }
    };

    const handleSave = () => {
        onSave({ added, removed });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm p-6 max-h-[80vh] overflow-y-auto flex flex-col"
            >
                <div className="flex justify-between items-center mb-4">
                    <h4 className="font-bold text-lg text-white">Modifier {item.name}</h4>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-6">
                    <div>
                        <h5 className="text-sm font-semibold text-slate-300 mb-2">Ingrédients de base (Décocher pour retirer)</h5>
                        <div className="space-y-2">
                            {baseIngredients.map(ingId => {
                                const ing = INGREDIENTS[ingId];
                                if (!ing) return null;
                                const isRemoved = removed.includes(ingId);
                                return (
                                    <label key={ingId} className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${!isRemoved ? 'bg-green-600 border-green-600 text-white' : 'border-slate-600 bg-slate-800'}`}>
                                            {!isRemoved && <Check className="w-3 h-3" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={!isRemoved}
                                            onChange={() => toggleBase(ingId)}
                                        />
                                        <span className={`text-sm ${isRemoved ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{ing.name}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h5 className="text-sm font-semibold text-slate-300 mb-2">Suppléments (Cocher pour ajouter)</h5>
                        <div className="grid grid-cols-1 gap-2">
                            {allIngredients
                                .filter(ing => !baseIngredients.includes(ing.id))
                                .map(ing => {
                                    const isAdded = added.includes(ing.id);
                                    return (
                                        <label key={ing.id} className="flex items-center gap-2 cursor-pointer">
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isAdded ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-600 bg-slate-800'}`}>
                                                {isAdded && <Plus className="w-3 h-3" />}
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="hidden"
                                                checked={isAdded}
                                                onChange={() => toggleExtra(ing.id)}
                                            />
                                            <span className={`text-sm ${isAdded ? 'text-orange-300 font-medium' : 'text-slate-400'}`}>{ing.name}</span>
                                        </label>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-800 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Annuler</Button>
                    <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">Valider</Button>
                </div>
            </motion.div>
        </motion.div>
    );
}
