"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createIngredient, updateIngredient, deleteIngredient } from "@/app/actions";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Ingredient {
    id: string;
    name: string;
    price: number;
    category: string;
    isAvailable: boolean;
}

export function IngredientsClient({ ingredients }: { ingredients: Ingredient[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        price: "0",
        category: "base", // base, cheese, meat, vegetable, finish
        isAvailable: true
    });

    const openCreate = () => {
        setEditingIngredient(null);
        setFormData({ name: "", price: "0", category: "base", isAvailable: true });
        setIsModalOpen(true);
    };

    const openEdit = (ing: Ingredient) => {
        setEditingIngredient(ing);
        setFormData({
            name: ing.name,
            price: ing.price.toString(),
            category: ing.category,
            isAvailable: ing.isAvailable
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(formData.price) || 0;

        if (editingIngredient) {
            await updateIngredient(editingIngredient.id, { ...formData, price });
        } else {
            await createIngredient({ ...formData, price });
        }
        setIsModalOpen(false);
        router.refresh();
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer cet ingrédient ? Cela peut affecter les pizzas existantes (mais c'est géré).")) {
            await deleteIngredient(id);
            router.refresh();
        }
    };

    const categories = ["base", "cheese", "meat", "vegetable", "finish"];
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredIngredients = ingredients
        .filter(ing => !selectedCategory || ing.category === selectedCategory)
        .sort((a, b) => a.name.localeCompare(b.name));

    return (
        <div className="space-y-6 h-full flex flex-col pt-6">
            <div className="flex items-center gap-4">
                <h2 className="text-3xl font-bold font-serif text-white">Ingrédients</h2>
                <Button onClick={openCreate} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter
                </Button>
            </div>

            <div className="flex gap-2 pb-2 overflow-x-auto">
                <Button
                    variant={selectedCategory === null ? "default" : "outline"}
                    onClick={() => setSelectedCategory(null)}
                    className={selectedCategory === null ? "bg-white text-slate-900" : "border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"}
                >
                    Tout
                </Button>
                {categories.map(cat => (
                    <Button
                        key={cat}
                        variant={selectedCategory === cat ? "default" : "outline"}
                        onClick={() => setSelectedCategory(cat)}
                        className={`capitalize ${selectedCategory === cat ? "bg-orange-500 text-white border-orange-500" : "border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"}`}
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto pr-2 pb-4 scrollbar-thin flex-1 min-h-0 content-start">
                {filteredIngredients.map((ing) => (
                    <div key={ing.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg flex items-center justify-between group hover:border-slate-700 transition-colors">
                        <div>
                            <p className="font-bold text-white group-hover:text-orange-400 transition-colors">{ing.name}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className={`px-1.5 py-0.5 rounded bg-slate-800 capitalize`}>{ing.category}</span>
                                <span>{ing.price} €</span>
                            </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-800" onClick={() => openEdit(ing)}>
                                <Pencil className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={() => handleDelete(ing.id)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingIngredient ? "Modifier" : "Ajouter"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>Nom</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-slate-950 border-slate-800 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label>Prix (€)</Label>
                            <Input
                                type="number"
                                step="0.5"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="bg-slate-950 border-slate-800 text-white"
                                required
                            />
                        </div>
                        <div>
                            <Label>Catégorie</Label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-white"
                            >
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        {/* Optionnel : Disponibilité checkbox */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isAvailable"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <Label htmlFor="isAvailable">Disponible</Label>
                        </div>
                        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                            Enregistrer
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
