export const dynamic = 'force-dynamic';
import { getOrderStatus, validatePayment } from "@/app/actions";
import Link from "next/link";
import { CheckCircle2, XCircle, ChefHat, Bike, Home, ShoppingBag, MapPin, Clock, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartClearer } from "@/components/features/cart-clearer";
import { RefreshButton } from "./refresh-button";
import { PaymentStatusPoller } from "./status-poller";
import { OrderStatusPoller } from "./order-status-poller";
import { PizzaProcessWrapper } from "@/components/ui/pizza-process-wrapper";
import { DeliveryMap } from "@/components/features/delivery-map";
import Image from "next/image";
import { OrderStatusVisuals } from "@/components/features/order-status-visuals";

export default async function OrderStatusPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) {
        return <div className="text-white text-center py-20">Commande invalide</div>;
    }

    let order = await getOrderStatus(id);

    // Auto-validate if pending
    if (order.success && order.status === 'PENDING') {
        const validation = await validatePayment(id);
        if (validation.success && validation.status) {
            order = await getOrderStatus(id);
        }
    }

    if (!order.success || !order.status) {
        return (
            // Simple Error View
            <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
                <Link href="/"><Button>Retour à l'accueil</Button></Link>
            </div>
        );
    }

    // Normalize Status
    const status = order.status.toUpperCase();
    // READY must be considered "active" (Confirmed+) so Visuals render
    const isConfirmed = status === "CONFIRMED" || status === "PREPARING" || status === "DELIVERING" || status === "COMPLETED" || status === "READY" || status === "ON_THE_WAY" || status === "LIVRAISON";
    const isCancelled = status === "CANCELLED" || status === "FAILED" || status === "EXPIRED";
    // Check for any variation of delivery status
    const isDelivering = status === "DELIVERING" || status === "LIVRAISON" || status === "COMPLETED" || status === "READY" || status === "ON_THE_WAY";
    // Preparing is active if confirmed but not yet delivering
    const isPreparing = status === "PREPARING";

    const steps = [
        { id: 'confirmed', label: 'Commande Reçue', icon: CheckCircle2, active: isConfirmed, date: order.createdAt },
        { id: 'preparing', label: 'Préparation', icon: ChefHat, active: isPreparing || isDelivering }, // Active if current or past
        { id: 'delivering', label: 'En Livraison', icon: Bike, active: isDelivering }
    ];

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col font-sans">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/bg-status.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-60"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>

            {/* Auto Clear Cart */}
            {isConfirmed && <CartClearer />}

            {/* Global Poller for Status Updates */}
            {!isCancelled && <OrderStatusPoller orderId={id} currentStatus={order.status} />}

            {/* Navbar */}
            <header className="px-6 py-6 flex justify-between items-center max-w-7xl mx-auto w-full z-10">
                <Link href="/" className="text-2xl font-extrabold tracking-tighter hover:text-primary transition-colors drop-shadow-lg">
                    Il Fornaccio
                </Link>
                <Link href="/">
                    <Button variant="ghost" className="text-white hover:text-primary hover:bg-white/10 backdrop-blur-sm">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Retour au Menu
                    </Button>
                </Link>
            </header>

            <main className="flex-grow flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-6 py-8 gap-8 lg:gap-16 z-10">

                {/* LEFT COLUMN: Status & Visuals */}
                <div className="flex-1 space-y-8">

                    {/* Status Text header */}
                    <div className="space-y-2">
                        {isCancelled ? (
                            <div className="flex items-center gap-4 text-red-500">
                                <XCircle className="w-12 h-12" />
                                <h1 className="text-4xl font-bold">Paiement Échoué</h1>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <h1 className="text-4xl lg:text-6xl font-black text-white tracking-wide uppercase drop-shadow-2xl">
                                    {isDelivering ? "En route !" : isPreparing ? "Au four !" : "Confirmé !"}
                                </h1>
                                <p className="text-xl text-gray-200 font-light">
                                    {isDelivering ? "Votre pizza arrive vers vous." : isPreparing ? "Nos chefs préparent votre commande avec amour." : "Paiement validé."}
                                </p>
                            </div>
                        )}

                        {!isConfirmed && !isCancelled && (
                            <div className="flex gap-4 mt-6">
                                <RefreshButton orderId={id} />
                                <PaymentStatusPoller orderId={id} initialStatus="PENDING" />
                            </div>
                        )}
                    </div>

                    {/* DYNAMIC VISUAL COMPONENT */}
                    {!isCancelled && isConfirmed && (
                        /* Replaced hardcoded logic with new orchestrator */
                        <OrderStatusVisuals
                            status={status}
                            createdAt={order.createdAt}
                            updatedAt={order.updatedAt}
                            customerAddress={order.customerAddress || ""}
                            driverLat={order.driverLat}
                            driverLng={order.driverLng}
                        />
                    )}
                </div>

                {/* RIGHT COLUMN: Sidebar (Tracker + Summary) */}
                <div className="lg:w-[400px] w-full shrink-0 space-y-6">

                    {/* Progress Tracker Vertical */}
                    {!isCancelled && (
                        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <h3 className="text-lg font-bold mb-8 text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" /> Suivi
                            </h3>
                            <div className="relative pl-2">
                                {/* Line */}
                                <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-white/10" />

                                <div className="space-y-10">
                                    {steps.map((step, index) => {
                                        const Icon = step.icon;
                                        const isStepActive = step.active;
                                        // Highlight current step
                                        const isCurrent = (isDelivering && step.id === 'delivering') ||
                                            (isPreparing && step.id === 'preparing') ||
                                            (!isPreparing && !isDelivering && isConfirmed && step.id === 'confirmed');

                                        return (
                                            <div key={step.id} className="relative flex items-center gap-6 group">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-500 ${isStepActive ? 'bg-primary border-primary text-black' : 'bg-black border-slate-700 text-slate-500'}`}>
                                                    <Icon className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-base font-bold transition-colors ${isStepActive ? 'text-white' : 'text-slate-500'}`}>{step.label}</p>
                                                    {isCurrent && <p className="text-xs text-primary animate-pulse font-mono mt-1">En cours...</p>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-2 mb-6 text-gray-400 uppercase text-xs font-bold tracking-widest">
                            <ShoppingBag className="w-4 h-4" />
                            Votre Commande #{id}
                        </div>

                        <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {order.items && order.items.length > 0 && (
                                <ul className="space-y-4">
                                    {order.items.map((item: any) => (
                                        <li key={item.id} className="flex justify-between items-start text-sm group">
                                            <div className="flex gap-4">
                                                <div className="w-6 h-6 flex items-center justify-center rounded bg-white/10 text-xs font-bold text-white group-hover:bg-primary group-hover:text-black transition-colors">
                                                    {item.quantity}
                                                </div>
                                                <span className="text-gray-300 font-medium">{item.pizzaName}</span>
                                            </div>
                                            <span className="font-semibold text-white">{item.finalPrice}€</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="flex justify-between items-center py-4 border-t border-white/10">
                            <span className="text-gray-400">Total</span>
                            <span className="text-3xl font-black text-primary">{order.total}€</span>
                        </div>
                    </div>

                    {/* Address Tiny Card */}
                    <div className="bg-black/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex items-center gap-4 text-sm text-gray-400">
                        <MapPin className="w-5 h-5 shrink-0" />
                        <span className="line-clamp-2">{order.customerAddress}</span>
                    </div>

                </div>

            </main>
        </div>
    );
}
