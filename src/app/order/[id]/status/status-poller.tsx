"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { validatePayment } from "@/app/actions";

interface PaymentStatusPollerProps {
    orderId: number;
    initialStatus: string;
}

export function PaymentStatusPoller({ orderId, initialStatus }: PaymentStatusPollerProps) {
    const router = useRouter();

    useEffect(() => {
        if (initialStatus !== 'PENDING') return;

        console.log("Starting payment status polling for Order #", orderId);

        const interval = setInterval(async () => {
            try {
                const res = await validatePayment(orderId);
                if (res.success && res.status === 'CONFIRMED') {
                    console.log("Payment confirmed via polling! Refreshing...");
                    router.refresh();
                    clearInterval(interval);
                }
            } catch (e) {
                console.error("Polling error:", e);
            }
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, [orderId, initialStatus, router]);

    return null; // Invisible component
}
