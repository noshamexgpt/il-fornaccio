
"use client";

import { useEffect, useState } from "react";
import { LottiePlayer } from "@/components/ui/lottie-player";
import { DeliveryMap } from "@/components/features/delivery-map";
import { AnimatePresence, motion } from "framer-motion";

interface OrderStatusVisualsProps {
    status: string;
    createdAt: Date;
    updatedAt: Date;
    customerAddress: string;
    driverLat?: number | null;
    driverLng?: number | null;
}

export const OrderStatusVisuals = ({ status, createdAt, updatedAt, customerAddress, driverLat, driverLng }: OrderStatusVisualsProps) => {
    // We use a local timer to update visual state based on elapsed time
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const statusUpper = status.toUpperCase();

    // Debug logging for Status Issue
    useEffect(() => {
        console.log(`[Visuals] Current Status: ${status} (Upper: ${statusUpper})`);
        console.log(`[Visuals] UpdatedAt: ${updatedAt} (Parsed: ${new Date(updatedAt).getTime()})`);
    }, [status, updatedAt]);

    // Logic Refined:
    // 1. CONFIRMED (New) -> Waiting Animation
    const isConfirmed = statusUpper === "CONFIRMED";

    // 2. PREPARING (Au Four) -> Slices (slow) then Chef
    const isPreparing = statusUpper === "PREPARING";

    // Ensure accurate time parsing
    const updateTime = new Date(updatedAt).getTime();
    const nowTime = now.getTime();
    // Default to a high value if invalid calc to show Chef, or 0? 
    // If updateTime is invalid (NaN), timeInPhase is NaN.
    // If timeInPhase is NaN, showChef (NaN > 15) is false.
    let timeInPhase = (nowTime - updateTime) / 1000;
    if (isNaN(timeInPhase)) timeInPhase = 100; // Fallback to show Chef if parsing fails


    // Debug log
    useEffect(() => {
        if (isPreparing) {
            console.log(`Preparation Phase Timer: ${timeInPhase.toFixed(1)}s (Threshold: 60s)`);
        }
    }, [isPreparing, timeInPhase]);

    const showChef = timeInPhase > 60;

    // 3. DELIVERY (En Livraison) -> Box then Map
    // Ensure we capture all "delivery-like" statuses
    const isDelivering = statusUpper === "DELIVERING" || statusUpper === "LIVRAISON" || statusUpper === "COMPLETED" || statusUpper === "ON_THE_WAY" || statusUpper === "READY";

    // If status is something weird, fallback?
    // If the user says it goes back to "Commande Reçue", it implies isConfirmed=true.
    // If statusUpper is "DELIVERING", isConfirmed is false.
    // So the passed status MUST be CONFIRMED.
    // This implies a Backend issue where status isn't saving/returning correctly.

    const deliveryElapsed = (now.getTime() - new Date(updatedAt).getTime()) / 1000;
    const showMap = deliveryElapsed > 5;



    // Render Logic
    return (
        <div className="w-full min-h-[400px] flex items-center justify-center py-10 relative overflow-hidden">
            <AnimatePresence mode="wait">

                {/* CONFIRMED / WAITING PHASE */}
                {isConfirmed && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-[400px] aspect-square flex flex-col items-center justify-center text-center"
                    >
                        <div className="w-32 h-32 rounded-full border-4 border-primary border-t-transparent animate-spin mb-8" />
                        <h2 className="text-2xl font-bold text-white mb-2 uppercase">Commande Reçue</h2>
                        <p className="text-gray-400 max-w-xs animate-pulse">
                            Votre commande est bien enregistrée. Un chef va la prendre en charge très rapidement !
                        </p>
                    </motion.div>
                )}

                {/* PREPARATION PHASE */}
                {isPreparing && (
                    <motion.div
                        key="chef"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-[500px] flex flex-col items-center justify-center text-center"
                    >
                        <LottiePlayer
                            key="chef-anim"
                            src="/chef-making-pizza.json"
                            className="w-full h-full max-h-[300px]"
                            loop={true}
                            autoplay={true}
                        />
                        <h2 className="text-2xl font-bold text-white mt-6 mb-2 uppercase">Au four !</h2>
                        <p className="text-gray-400 max-w-xs">
                            Votre pizza est entre les mains de nos experts. Cuisson parfaite en cours...
                        </p>
                    </motion.div>
                )}

                {/* DELIVERY PHASE */}
                {isDelivering && (
                    !showMap ? (
                        <motion.div
                            key="box"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }} // Zoom out effect
                            transition={{ duration: 0.8 }}
                            className="w-full max-w-[400px] aspect-square"
                        >
                            <LottiePlayer src="/Pizza box order.json" className="w-full h-full drop-shadow-2xl" />
                            <p className="text-center text-white font-bold tracking-widest mt-4 uppercase">
                                Mise en boîte terminée !
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5 }} // Slow fade in for map
                            className="w-full h-full"
                        >
                            <DeliveryMap
                                customerAddress={customerAddress}
                                driverLat={driverLat ?? undefined}
                                driverLng={driverLng ?? undefined}
                            />
                        </motion.div>
                    )
                )}

            </AnimatePresence>
        </div>
    );
};
