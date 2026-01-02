"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPizza, updatePizza } from "@/app/actions";
import { INGREDIENTS } from "@/lib/data";
import { Loader2, Save, X } from "lucide-react";
import { Pizza } from "@prisma/client";

import { uploadFile } from "@/app/actions/upload";

interface AdminPizzaFormProps {
    existingPizza?: Pizza;
    onClose: () => void;
}

export function AdminPizzaForm({ existingPizza, onClose }: AdminPizzaFormProps) {
    const defaultIngredients = existingPizza && existingPizza.ingredients
        ? (typeof existingPizza.ingredients === 'string' ? JSON.parse(existingPizza.ingredients) : existingPizza.ingredients)
        : [];

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            name: existingPizza?.name || "",
            slug: existingPizza?.slug || "",
            description: existingPizza?.description || "",
            basePrice: existingPizza?.basePrice || 12,
            image: existingPizza?.image || "/pizza-margherita.png", // Default image
        }
    });

    const [selectedIngredients, setSelectedIngredients] = useState<string[]>(defaultIngredients);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const toggleIngredient = (id: string) => {
        if (selectedIngredients.includes(id)) {
            setSelectedIngredients(selectedIngredients.filter(i => i !== id));
        } else {
            setSelectedIngredients([...selectedIngredients, id]);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await uploadFile(formData);
        if (res.success && res.url) {
            setValue("image", res.url);
        } else {
            alert("Erreur lors de l'upload");
        }
        setIsUploading(false);
    };

    const onSubmit = async (data: any) => {
        setError(null);

        // Auto-generate slug if empty
        if (!data.slug) {
            data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        const payload = {
            ...data,
            basePrice: parseFloat(data.basePrice),
            ingredients: selectedIngredients
        };

        let res;
        if (existingPizza) {
            res = await updatePizza(existingPizza.id, { ...payload, isAvailable: existingPizza.isAvailable });
        } else {
            res = await createPizza(payload);
        }

        if (res.success) {
            onClose();
        } else {
            setError(res.error || "Une erreur est survenue");
        }
    };

    const allIngredients = Object.values(INGREDIENTS);
    // Sort: Checked first, then alphabetical
    const sortedIngredients = [...allIngredients].sort((a, b) => {
        const aSelected = selectedIngredients.includes(a.id);
        const bSelected = selectedIngredients.includes(b.id);
        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.name.localeCompare(b.name);
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-white">Nom de la pizza</Label>
                    <Input {...register("name", { required: true })} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-2">
                    <Label className="text-white">Slug (URL)</Label>
                    <Input {...register("slug")} placeholder="Auto-généré" className="bg-slate-800 border-slate-700 text-white" />
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-white">Description</Label>
                <Textarea {...register("description")} className="bg-slate-800 border-slate-700 text-white" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="text-white">Prix (€)</Label>
                    <Input type="number" step="0.5" {...register("basePrice", { required: true })} className="bg-slate-800 border-slate-700 text-white" />
                </div>
                <div className="space-y-2">
                    <Label className="text-white">Image</Label>
                    <div className="flex gap-2">
                        <Input {...register("image")} className="bg-slate-800 border-slate-700 text-white" />
                        <label className="cursor-pointer bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-md flex items-center justify-center">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Upload"}
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label className="text-white">Ingrédients</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-slate-700 rounded bg-slate-900/50">
                    {sortedIngredients.map(ing => (
                        <label key={ing.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-800 p-1 rounded transition-colors">
                            <input
                                type="checkbox"
                                checked={selectedIngredients.includes(ing.id)}
                                onChange={() => toggleIngredient(ing.id)}
                                className="accent-orange-500"
                            />
                            <span className={`text-sm ${selectedIngredients.includes(ing.id) ? 'text-white font-medium' : 'text-slate-400'}`}>
                                {ing.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="ghost" onClick={onClose} className="hover:bg-slate-800 text-slate-300">
                    Annuler
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
                </Button>
            </div>
        </form>
    );
}
