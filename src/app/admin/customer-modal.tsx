"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MapPin, Clock, Calendar, Pizza, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCustomerDetails } from "@/app/actions";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerPhone: string;
}

export function CustomerModal({ isOpen, onClose, customerPhone }: CustomerModalProps) {
    const [customer, setCustomer] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && customerPhone) {
            setIsLoading(true);
            getCustomerDetails(customerPhone).then((data) => {
                setCustomer(data);
                setIsLoading(false);
            });
        }
    }, [isOpen, customerPhone]);

    const timeAgo = (date: Date) => {
        return format(new Date(date), "d MMM yyyy 'à' HH:mm", { locale: fr });
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
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 p-6 text-slate-100 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold font-serif text-orange-400">
                                    {isLoading ? "Chargement..." : (customer?.name || "Client Inconnu")}
                                </h3>
                                <div className="text-sm text-slate-400 flex items-center gap-2 mt-1">
                                    <Phone className="w-3 h-3" /> {customerPhone}
                                </div>
                            </div>
                            <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-10">
                                <span className="animate-spin text-4xl">🍕</span>
                            </div>
                        ) : customer ? (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                            <Receipt className="w-3 h-3" /> Total Dépensé
                                        </div>
                                        <div className="text-2xl font-bold text-white">{customer.totalSpent?.toFixed(2)}€</div>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                                        <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1 flex items-center gap-1">
                                            <Pizza className="w-3 h-3" /> Commandes
                                        </div>
                                        <div className="text-2xl font-bold text-white">{customer.totalCount}</div>
                                    </div>
                                </div>

                                {/* Address */}
                                {customer.address && (
                                    <div className="bg-slate-800/50 p-3 rounded-lg flex items-start gap-3 border border-slate-700/50">
                                        <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                                        <div>
                                            <div className="font-bold text-sm text-slate-200">Adresse enregistrée</div>
                                            <div className="text-sm text-slate-400">{customer.address}</div>
                                        </div>
                                    </div>
                                )}

                                {/* History */}
                                <div>
                                    <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" /> Dernières commandes
                                    </h4>
                                    <div className="space-y-3">
                                        {customer.orders.map((order: any) => (
                                            <div key={order.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-sm">
                                                <div>
                                                    <div className="font-bold text-slate-200">
                                                        {timeAgo(order.createdAt)}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {order.instructions && order.instructions.includes("LIVRAISON") ? "🛵 Livraison" : "👜 A emporter"}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-orange-400">{order.total.toFixed(2)}€</div>
                                                    <Badge variant="outline" className="text-[10px] h-5 px-1 border-slate-700 text-slate-400">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 text-slate-400">
                                <p>Aucune information trouvée pour ce numéro.</p>
                                <p className="text-xs mt-2">Le client n'a peut-être pas encore de profil créé.</p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
