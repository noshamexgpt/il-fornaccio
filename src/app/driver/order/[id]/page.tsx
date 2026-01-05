"use client";

import { useEffect, useState, use, useRef } from 'react';
import { updateDriverLocation, getOrderStatus } from "@/app/actions";
import { Map as MapIcon, Navigation } from "lucide-react";

export default function DriverPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const orderId = parseInt(id);

    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState<string>("Prêt");
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [orderInfo, setOrderInfo] = useState<any>(null);

    // Poll for Server-side GPS (Traccar)
    useEffect(() => {
        const poll = setInterval(() => {
            getOrderStatus(orderId).then(res => {
                if (res.success) {
                    setOrderInfo(res);
                    // Update location from server if we are not locally tracking (or separate display?)
                    // Best UX: "Carte App" uses BEST available location.
                    // If we have local GPS, use it. If not, use server GPS (Traccar).
                    if (!isTracking && res.driverLat && res.driverLng) {
                        setLocation({ lat: res.driverLat, lng: res.driverLng });
                        setStatus("Traccar Actif 📡");
                    }
                }
            });
        }, 5000);
        return () => clearInterval(poll);
    }, [orderId, isTracking]);

    const hasSignal = location && (location.lat !== 0);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 flex flex-col items-center justify-center font-sans tracking-tight">
            <h1 className="text-2xl font-bold mb-8 text-amber-500 font-serif">Livraison #{orderId}</h1>

            {orderInfo && (
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 w-full max-w-sm mb-6 text-center shadow-xl">
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-4">Destination Client</p>

                    <h2 className="text-2xl font-bold text-white mb-2">{orderInfo.customerName}</h2>
                    <p className="text-slate-300 text-lg leading-relaxed mb-6">
                        {orderInfo.customerAddress || "Adresse non trouvée"}
                    </p>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <a
                            href={`https://www.waze.com/ul?q=${encodeURIComponent(orderInfo.customerAddress || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="text-xl">🚙</span> Waze
                        </a>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(orderInfo.customerAddress || "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                        >
                            <span className="text-xl">🗺️</span> Maps
                        </a>
                    </div>
                    {orderInfo.customerPhone && (
                        <a
                            href={`tel:${orderInfo.customerPhone}`}
                            className="mt-3 block w-full border border-slate-600 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition-colors"
                        >
                            📞 Appeler {orderInfo.customerPhone}
                        </a>
                    )}
                </div>
            )}



            {!hasSignal && (
                <div className="bg-amber-900/20 text-amber-200 p-4 rounded-xl text-sm w-full max-w-sm mb-6 border border-amber-900/50 animate-pulse">
                    <p className="font-bold flex items-center gap-2 mb-1 text-amber-100">
                        <span>📡</span> Signal GPS inactif
                    </p>
                    <p className="text-xs opacity-90">
                        Le serveur ne reçoit pas votre position.<br />
                        👉 <strong>Lancez l'app "Traccar Client"</strong> pour activer le suivi en arrière-plan.
                    </p>
                </div>
            )}

            <div className="flex flex-col gap-4 w-full max-w-sm">
                {!isTracking ? (
                    <button
                        onClick={() => { setIsTracking(true); }} // Auto-open map logic removed
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-green-900/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        <span>🚀</span> Démarrer Course
                    </button>
                ) : (
                    <button
                        onClick={() => setIsTracking(false)}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-red-900/20 transition-all active:scale-95 flex items-center justify-center gap-3 animate-pulse"
                    >
                        <span>🛑</span> Arrêter Tracking
                    </button>
                )}
            </div>

            <div className="mt-8 text-center space-y-2">
                <p className="text-slate-400 font-mono text-sm">Status: <span className="text-white">{status}</span></p>
                {location && (
                    <p className="text-slate-600 text-xs font-mono bg-black/30 py-1 px-3 rounded-full inline-block">
                        GPS: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                    </p>
                )}
                {error && <p className="text-red-400 text-xs mt-2 bg-red-900/20 p-2 rounded">{error}</p>}
            </div>

            {/* Wake Lock Hint */}
            <p className="text-xs text-slate-600 mt-8 max-w-xs text-center">
                💡 L'écran restera allumé tant que vous êtes sur cette page.
            </p>
        </div>
    );
}
