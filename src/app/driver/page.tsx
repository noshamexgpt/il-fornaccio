
"use client";

import { useEffect, useState } from "react";
import { getDriverOrders } from "@/app/actions";
import Link from "next/link";
import { MapPin, Phone, Navigation, Package, RefreshCw, LayoutList, Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DriverDashboard() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    const fetchOrders = async () => {
        setLoading(true);
        const res = await getDriverOrders();
        if (res.success && res.orders) {
            setOrders(res.orders);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
        // Poll every 30s
        const interval = setInterval(fetchOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-20">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
                    Espace Livreur
                </h1>
                <Button variant="ghost" size="icon" onClick={fetchOrders} className={loading && "animate-spin"}>
                    <RefreshCw className="w-5 h-5" />
                </Button>
            </header>

            {/* Content */}
            <main className="pt-20 px-4 max-w-md mx-auto space-y-4">

                {/* View Toggles */}
                <div className="flex bg-white/5 p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <LayoutList className="w-4 h-4" /> Liste
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors ${viewMode === 'map' ? 'bg-primary text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                        <MapIcon className="w-4 h-4" /> Carte
                    </button>
                </div>

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-4">
                        {orders.length === 0 && !loading && (
                            <div className="text-center py-20 text-gray-500">
                                <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Aucune course active.</p>
                            </div>
                        )}

                        {orders.map(order => (
                            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 active:scale-[0.98] transition-transform">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs font-bold">#{order.id}</span>
                                            <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className="font-bold text-lg">{order.customerName}</h3>
                                    </div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${order.status === 'DELIVERING' || order.status === 'LIVRAISON' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="flex items-start gap-3 mb-4 text-gray-300">
                                    <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-sm leading-relaxed">{order.customerAddress || "Adresse non renseignée"}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Link href={`/driver/order/${order.id}`} className="w-full">
                                        <Button className="w-full bg-primary text-black hover:bg-yellow-400 font-bold">
                                            <Navigation className="w-4 h-4 mr-2" />
                                            Go
                                        </Button>
                                    </Link>

                                    <a href={`tel:${order.customerPhone}`} className="w-full">
                                        <Button variant="outline" className="w-full border-white/20 hover:bg-white/10 text-white">
                                            <Phone className="w-4 h-4 mr-2" />
                                            Appeler
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Map View Placeholder */}
                {viewMode === 'map' && (
                    <div className="h-[60vh] bg-white/5 rounded-2xl flex items-center justify-center text-gray-500">
                        <p>Carte globale bientôt disponible</p>
                    </div>
                )}

            </main>
        </div>
    );
}
