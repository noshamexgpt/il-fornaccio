"use client";

import { Card } from "@/components/ui/card";
import { Clock, Phone, MapPin, User } from "lucide-react";

interface OrderCardProps {
    order: any;
    onViewCustomer: (phone: string) => void;
    ingredients: any[];
}

/**
 * OrderCard Component
 * Displays summary of an order in the Kanban board.
 */
export function OrderCard({ order, onViewCustomer, ingredients }: OrderCardProps) {

    // Create a lookup map for ingredients
    const INGREDIENTS_MAP = ingredients.reduce((acc: any, ing: any) => {
        acc[ing.id] = ing;
        return acc;
    }, {});

    // Calculate time difference for display
    const timeAgo = (date: Date) => {
        const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
        return diff < 1 ? "À l'instant" : `${diff} min`;
    };

    return (
        <Card className="bg-slate-900 border-slate-800 p-4 space-y-3 shadow-lg group hover:border-slate-700 transition-colors cursor-grab active:cursor-grabbing relative">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="font-bold text-lg text-white flex items-center gap-2">
                        #{order.id} - {order.customerName}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onViewCustomer(order.customerPhone);
                            }}
                            className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-orange-400 transition-colors"
                            title="Voir Fiche Client"
                        >
                            <User className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {timeAgo(order.createdAt)}
                    </div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-orange-400 font-bold">{order.total.toFixed(2)}€</div>
                </div>
            </div>

            {/* Order Items */}
            <div className="space-y-1 py-2 border-t border-slate-800 border-b">
                {order.items.map((item: any) => {
                    // Safe parse of modifications
                    const modifs = item.modifications ? JSON.parse(item.modifications) : { added: [], removed: [] };
                    const hasModifs = modifs.added?.length > 0 || modifs.removed?.length > 0;

                    return (
                        <div key={item.id} className="text-sm text-slate-200">
                            <span className="font-medium text-white">{item.quantity}x</span> {item.pizzaName}
                            {hasModifs && (
                                <div className="pl-4 text-xs font-bold tracking-wide mt-1">
                                    {modifs.removed?.map((r: string) => (
                                        <span key={r} className="text-red-500 block">
                                            - Sans {INGREDIENTS_MAP[r]?.name || r}
                                        </span>
                                    ))}
                                    {modifs.added?.map((a: string) => (
                                        <span key={a} className="text-green-500 block">
                                            + Avec {INGREDIENTS_MAP[a]?.name || a}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Customer Details Footer */}
            <div className="text-xs text-slate-400 space-y-1">
                <div className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {order.customerPhone}
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {order.customerAddress}
                </div>
                {order.instructions && (
                    <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded mt-2 border border-yellow-500/20 font-bold">
                        ⚠️ {order.instructions}
                    </div>
                )}
            </div>
        </Card>
    );
}
