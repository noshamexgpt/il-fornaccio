"use client";

import { useState } from "react";
import { AdminPizzaForm } from "@/components/admin/admin-pizza-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Edit2, Trash2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { deletePizza } from "@/app/actions"; // We'll assume this is exported from actions.ts now
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface AdminMenuClientProps {
    pizzas: any[];
}

export function AdminMenuClient({ pizzas }: AdminMenuClientProps) {
    const router = useRouter();
    const [editingPizza, setEditingPizza] = useState<any | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleEdit = (pizza: any) => {
        setEditingPizza(pizza);
        setIsEditOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette pizza ?")) {
            await deletePizza(id);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.push("/admin")} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Retour Cuisine
                </Button>
                <Button onClick={() => setIsCreateOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Nouvelle Pizza
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pizzas.map((pizza) => (
                    <Card key={pizza.id} className="bg-slate-900 border-slate-800 overflow-hidden flex flex-col">
                        <div className="relative h-48 w-full bg-slate-800">
                            <Image
                                src={pizza.image}
                                alt={pizza.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-orange-400 font-bold">
                                {pizza.basePrice} €
                            </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-white mb-2">{pizza.name}</h3>
                            <p className="text-sm text-slate-400 flex-1 mb-4 line-clamp-3">
                                {pizza.description}
                            </p>
                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white" onClick={() => handleEdit(pizza)}>
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-400" onClick={() => handleDelete(pizza.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">Nouvelle Pizza</DialogTitle>
                    </DialogHeader>
                    <AdminPizzaForm onClose={() => setIsCreateOpen(false)} />
                </DialogContent>
            </Dialog>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-white">Modifier Pizza</DialogTitle>
                    </DialogHeader>
                    {editingPizza && (
                        <AdminPizzaForm
                            existingPizza={editingPizza}
                            onClose={() => {
                                setIsEditOpen(false);
                                setEditingPizza(null);
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
