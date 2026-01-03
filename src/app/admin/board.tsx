"use client";

import { Order, OrderItem } from "@prisma/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Phone, MapPin, CheckCircle, Flame, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
// ... existing imports ...
import { CustomerModal } from "./customer-modal";
import { OrderModal } from "./order-modal";
import { OrderCard } from "./order-card";
// Removed INGREDIENTS as it was only used in the inline OrderCard
import { User } from "lucide-react";

type OrderWithItems = Order & { items: OrderItem[] };

interface AdminBoardProps {
    orders: OrderWithItems[];
    pizzas: any[]; // using any for now or modify types
    ingredients: any[];
}

const COLUMNS = {
    PENDING: { id: "PENDING", title: "Nouvelles", color: "bg-red-500/10 border-red-500/20", icon: Clock, text: "text-red-400" },
    PREPARING: { id: "PREPARING", title: "Au Four", color: "bg-orange-500/10 border-orange-500/20", icon: Flame, text: "text-orange-400" },
    READY: { id: "READY", title: "Prêt / Livraison", color: "bg-green-500/10 border-green-500/20", icon: CheckCircle, text: "text-green-400" }
};

export function AdminBoard({ orders, pizzas, ingredients }: AdminBoardProps) {
    const router = useRouter();
    const [localOrders, setLocalOrders] = useState(orders);

    // Modal State
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState<OrderWithItems | null>(null);
    const [viewingCustomerPhone, setViewingCustomerPhone] = useState<string | null>(null);

    // Auto-refresh every 30s
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 30000);
        return () => clearInterval(interval);
    }, [router]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        // Optimistic Update
        const newStatus = destination.droppableId;
        const orderId = parseInt(draggableId);

        const updatedOrders = localOrders.map(o =>
            o.id === orderId ? { ...o, status: newStatus } : o
        );
        setLocalOrders(updatedOrders);

        // Server Update
        const res = await updateOrderStatus(orderId, newStatus);
        if (!res.success) {
            alert("Erreur serveur, rechargement...");
            router.refresh();
        }
    };

    const getColumnOrders = (columnId: string) => {
        if (columnId === "PENDING") return localOrders.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
        if (columnId === "READY") return localOrders.filter(o => o.status === "READY");
        return localOrders.filter(o => o.status === columnId);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
                {Object.values(COLUMNS).map((col) => (
                    <div key={col.id} className={cn("flex flex-col rounded-xl border p-4 h-full min-h-0", col.color)}>
                        {/* ... Header ... */}
                        <div className="flex items-center justify-between mb-4 flex-shrink-0">
                            <div className="flex items-center gap-2 font-bold text-lg">
                                <col.icon className={cn("w-5 h-5", col.text)} /> {col.title}
                            </div>
                            <div className="flex items-center gap-2">
                                {col.id === "PENDING" && (
                                    <Button size="sm" onClick={() => setIsCreateOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white gap-1">
                                        <Plus className="w-4 h-4" /> Nouvelle
                                    </Button>
                                )}
                                <Badge variant="secondary" className="bg-background/50">
                                    {getColumnOrders(col.id).length}
                                </Badge>
                            </div>
                        </div>

                        <Droppable droppableId={col.id}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin min-h-0"
                                >
                                    {getColumnOrders(col.id).map((order, index) => (
                                        <Draggable key={order.id} draggableId={String(order.id)} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    onDoubleClick={() => setEditingOrder(order)}
                                                >
                                                    <OrderCard
                                                        order={order}
                                                        onViewCustomer={(phone) => setViewingCustomerPhone(phone)}
                                                        ingredients={ingredients}
                                                    />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>

            <OrderModal
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                pizzas={pizzas}
                ingredients={ingredients}
            />

            <OrderModal
                isOpen={!!editingOrder}
                onClose={() => setEditingOrder(null)}
                existingOrder={editingOrder}
                pizzas={pizzas}
                ingredients={ingredients}
            />

            <CustomerModal
                isOpen={!!viewingCustomerPhone}
                onClose={() => setViewingCustomerPhone(null)}
                customerPhone={viewingCustomerPhone || ""}
            />
        </DragDropContext>
    );
}



