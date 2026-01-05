
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getOrderStatus } from "@/app/actions";

interface OrderStatusPollerProps {
    orderId: number;
    currentStatus: string;
}

export function OrderStatusPoller({ orderId, currentStatus }: OrderStatusPollerProps) {
    const router = useRouter();

    useEffect(() => {
        // If cancelled or delivered/completed, stop polling (unless we want to track driver to door)
        // But the user specifically mentioned "Quand je passe en livraison rien ne change".
        // Use a simpler logic: just poll always if active.

        console.log(`Polling status for #${orderId} (Current: ${currentStatus})`);

        const interval = setInterval(async () => {
            try {
                const res = await getOrderStatus(orderId);
                if (res.success && res.status && res.status !== currentStatus) {
                    console.log(`Status changed from ${currentStatus} to ${res.status}! Refreshing...`);
                    router.refresh();
                }
            } catch (e) {
                console.error("Status polling error:", e);
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(interval);
    }, [orderId, currentStatus, router]);

    return null;
}
