"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { validatePayment } from "@/app/actions";
import { useRouter } from "next/navigation";

export function RefreshButton({ orderId }: { orderId: number }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRefresh = async () => {
        setLoading(true);
        try {
            await validatePayment(orderId);
            router.refresh(); // Reload server components
        } catch (e) {
            console.error("Refresh failed", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            className="mt-4 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
        >
            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Vérification..." : "Actualiser le statut"}
        </Button>
    );
}
