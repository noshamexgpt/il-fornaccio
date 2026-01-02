"use client";

import { useEffect, useState, use, useRef } from "react";
import { getOrderStatus } from "@/app/actions";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChefHat, MapPin, PackageCheck, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// --- Components ---

const StatusIcon = ({ status, active }: { status: string; active: boolean }) => {
    // Return icon based on status
    if (status === "PENDING") return <PackageCheck className={cn("w-12 h-12", active ? "text-orange-500" : "text-slate-600")} />;
    if (status === "CONFIRMED") return <ChefHat className={cn("w-12 h-12", active ? "text-orange-500" : "text-slate-600")} />;
    if (status === "READY") return <Truck className={cn("w-12 h-12", active ? "text-green-500" : "text-slate-600")} />;
    if (status === "DELIVERED") return <CheckCircle className={cn("w-12 h-12", active ? "text-blue-500" : "text-slate-600")} />;
    return <PackageCheck />;
};

// Delivery Map using Google Maps API (Native)
const DeliveryMap = ({ address }: { address: string }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isMapReady, setIsMapReady] = useState(false);

    useEffect(() => {
        // Poll for Google Maps API
        const checkGoogle = () => {
            if (window.google && window.google.maps) {
                setIsMapReady(true);
                return true;
            }
            return false;
        };

        if (checkGoogle()) return;

        const interval = setInterval(() => {
            if (checkGoogle()) {
                clearInterval(interval);
            }
        }, 300);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (!isMapReady || !mapRef.current || !window.google) return;

        const initMap = async () => {
            try {
                // 1. Geocode Customer Address
                const geocoder = new window.google.maps.Geocoder();
                const result = await geocoder.geocode({ address: address });

                if (!result.results[0]) {
                    setError("Adresse introuvable pour le suivi GPS");
                    return;
                }

                const customerLoc = result.results[0].geometry.location;
                // Brussels Center as Mock Store
                const storeLoc = { lat: 50.8466, lng: 4.3517 };

                const map = new window.google.maps.Map(mapRef.current!, {
                    zoom: 13,
                    center: customerLoc,
                    styles: [ // Dark Mode Map Style
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                    ],
                    disableDefaultUI: true,
                });

                const directionsService = new window.google.maps.DirectionsService();
                const directionsRenderer = new window.google.maps.DirectionsRenderer({
                    map,
                    suppressMarkers: true,
                    polylineOptions: { strokeColor: "#ea580c", strokeWeight: 5 }
                });

                // Calculate Route
                const route = await directionsService.route({
                    origin: storeLoc,
                    destination: customerLoc,
                    travelMode: window.google.maps.TravelMode.DRIVING,
                });

                directionsRenderer.setDirections(route);

                // Add Markers
                new window.google.maps.Marker({
                    position: storeLoc,
                    map,
                    label: "🍕",
                    title: "Il Fornaccio"
                });

                const driverMarker = new window.google.maps.Marker({
                    position: storeLoc,
                    map,
                    icon: {
                        path: window.google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: "#ea580c",
                        fillOpacity: 1,
                        strokeWeight: 2,
                        strokeColor: "#ffffff",
                    },
                    title: "Livreur"
                });

                new window.google.maps.Marker({
                    position: customerLoc,
                    map,
                    label: "🏠",
                    title: "Vous"
                });

                // Animate Driver (Simulation)
                if (route.routes[0].overview_path) {
                    let count = 0;
                    const path = route.routes[0].overview_path;
                    const interval = setInterval(() => {
                        count = (count + 1) % path.length;
                        driverMarker.setPosition(path[count]);
                    }, 500);
                    return () => clearInterval(interval);
                }

            } catch (e) {
                console.error("Map Error", e);
                setError("Erreur chargement carte");
            }
        };

        initMap();
    }, [address, isMapReady]);

    return (
        <div className="w-full h-80 bg-slate-800 rounded-xl overflow-hidden relative">
            <div ref={mapRef} className="w-full h-full" />

            {/* Overlay Status */}
            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur p-4 rounded-lg border border-slate-700 flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <Truck className="w-6 h-6 text-green-500" />
                </div>
                <div>
                    <p className="font-bold text-white">Livreur en route</p>
                    <p className="text-xs text-slate-400">Arrivée estimée: 15 min</p>
                </div>
            </div>
            {error && <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-red-500">{error}</div>}
        </div>
    );
};


// --- Main Page ---

const STEPS = [
    { id: "PENDING", label: "Reçue", icon: PackageCheck },
    { id: "CONFIRMED", label: "Cuisine", icon: ChefHat },
    { id: "READY", label: "Livraison", icon: Truck },
    { id: "DELIVERED", label: "Validé", icon: CheckCircle },
];

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const orderId = parseInt(resolvedParams.id);
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        const res = await getOrderStatus(orderId);
        if (res.success) setOrder(res);
        setLoading(false);
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 15000);
        return () => clearInterval(interval);
    }, [orderId]);

    const getCurrentStepIndex = (status: string) => {
        if (status === "PREPARING") return 1;
        const index = STEPS.findIndex(s => s.id === status);
        return index === -1 ? 0 : index;
    };

    if (loading || !order) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Chargement...</div>;

    const currentStep = getCurrentStepIndex(order.status);
    const isDelivering = order.status === "READY";

    return (
        <div className="min-h-screen bg-slate-950 text-white p-4 pb-20 font-sans">
            <div className="max-w-md mx-auto space-y-8 mt-6">

                <div className="text-center">
                    <h1 className="text-2xl font-bold">Suivi de commande</h1>
                    <p className="text-slate-400">#{orderId}</p>
                </div>

                {/* VISUALIZER or MAP */}
                {isDelivering ? (
                    <DeliveryMap address={order.customerAddress || "Brussels"} />
                ) : (
                    <div className="h-64 w-full flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 relative overflow-hidden">
                        {/* Simple Background Pulse */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-800 to-transparent opacity-20" />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={order.status}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 1.2, opacity: 0 }}
                                className="flex flex-col items-center z-10"
                            >
                                <StatusIcon status={order.status} active={true} />
                                <p className="mt-4 text-xl font-bold">
                                    {STEPS[getCurrentStepIndex(order.status)]?.label || "En cours"}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                )}

                {/* TIMELINE */}
                <div className="relative flex justify-between px-2">
                    {/* Line */}
                    <div className="absolute top-5 left-4 right-4 h-0.5 bg-slate-800 -z-0" />
                    <motion.div
                        className="absolute top-5 left-4 h-0.5 bg-green-500 -z-0 origin-left"
                        initial={{ width: 0 }}
                        animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        style={{ maxWidth: 'calc(100% - 2rem)' }}
                    />

                    {STEPS.map((step, index) => {
                        const isCompleted = index <= currentStep;
                        const isCurrent = index === currentStep;

                        return (
                            <div key={step.id} className="flex flex-col items-center gap-2 z-10">
                                <motion.div
                                    animate={{
                                        scale: isCurrent ? 1.2 : 1,
                                        backgroundColor: isCompleted ? "#10b981" : "#1e293b" // Green vs Slate
                                    }}
                                    className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-slate-950 shadow-xl"
                                >
                                    <step.icon className={cn("w-5 h-5", isCompleted ? "text-white" : "text-slate-500")} />
                                </motion.div>
                                <span className={cn("text-xs font-medium", isCompleted ? "text-green-400" : "text-slate-600")}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* INFO */}
                <Card className="bg-slate-900/50 border-slate-800">
                    <CardHeader className="py-4">
                        <CardTitle className="text-sm text-white">Votre Commande</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-slate-400 pb-4">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between">
                                <span>{item.quantity}x {item.pizzaName}</span>
                                <span>{item.finalPrice}€</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
