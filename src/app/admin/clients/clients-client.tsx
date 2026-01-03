"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createCustomer, updateCustomer, deleteCustomer } from "@/app/actions";
import { Pencil, Trash2, Plus, Search, User, Phone, MapPin, ShoppingBag, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Client {
    id: string;
    firstName: string;
    lastName: string;
    name: string; // Combined
    phone: string;
    email?: string | null;
    address?: string | null;
    notes?: string | null;
    orderCount: number;
    updatedAt: string;
    orders?: any[];
}

export function ClientsClient({ initialClients }: { initialClients: Client[] }) {
    const [clients, setClients] = useState(initialClients);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const router = useRouter();

    // Sync state when server data changes (after router.refresh)
    useEffect(() => {
        setClients(initialClients);
    }, [initialClients]);

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        address: "",
        notes: ""
    });

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    const openCreate = () => {
        setEditingClient(null);
        setFormData({ firstName: "", lastName: "", phone: "", email: "", address: "", notes: "" });
        setIsModalOpen(true);
    };

    const openEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            firstName: client.firstName,
            lastName: client.lastName,
            phone: client.phone,
            email: client.email || "",
            address: client.address || "",
            notes: client.notes || ""
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        let result;
        if (editingClient) {
            result = await updateCustomer(editingClient.id, formData);
        } else {
            result = await createCustomer(formData);
        }

        if (result.success) {
            setIsModalOpen(false);
            router.refresh();
        } else {
            alert(result.error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce client ? Attention, impossible s'il a des commandes.")) {
            const result = await deleteCustomer(id);
            if (!result.success) alert(result.error);
            else router.refresh();
        }
    };

    return (
        <div className="space-y-6 h-full flex flex-col pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-bold font-serif text-white">Gestion des Clients</h2>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-8 bg-slate-900 border-slate-800 text-white w-64"
                        />
                    </div>
                    <Button onClick={openCreate} className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Plus className="w-5 h-5 mr-2" />
                        Nouveau
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto pr-2 pb-4 scrollbar-thin flex-1 min-h-0 content-start">
                {filteredClients.map((client) => (
                    <Card key={client.id} className="bg-slate-900 border-slate-800 text-slate-200 h-fit">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-medium text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-orange-500" />
                                <span className="capitalize">{client.firstName}</span> <span className="uppercase">{client.lastName}</span>
                            </CardTitle>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-slate-800" onClick={() => openEdit(client)}>
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-slate-800" onClick={() => handleDelete(client.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Phone className="w-4 h-4" />
                                {client.phone}
                            </div>
                            {client.address && (
                                <div className="flex items-start gap-2 text-sm text-slate-400">
                                    <MapPin className="w-4 h-4 mt-0.5 min-w-[1rem]" />
                                    <span className="line-clamp-2">{client.address}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-800 mt-2">
                                <div className="flex items-center gap-1.5 text-blue-400">
                                    <ShoppingBag className="w-4 h-4" />
                                    {client.orderCount} commandes
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(client.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingClient ? "Modifier Client" : "Nouveau Client"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <h3 className="text-lg font-semibold text-orange-400 border-b border-gray-700 pb-2 mb-4">Informations</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Nom</Label>
                                    <Input
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label>Prénom</Label>
                                    <Input
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="bg-slate-950 border-slate-800 text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Téléphone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-slate-950 border-slate-800 text-white"
                                    required
                                />
                            </div>
                            <div>
                                <Label>Adresse</Label>
                                <AddressAutocomplete
                                    value={formData.address}
                                    onAddressSelect={(addr) => setFormData(prev => ({ ...prev, address: addr }))}
                                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                    className="bg-slate-950 border-slate-800 text-white"
                                    placeholder="Rechercher une adresse..."
                                    required
                                />
                            </div>
                            <div>
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-slate-950 border-slate-800 text-white"
                                />
                            </div>
                            <div>
                                <Label>Notes (Interne)</Label>
                                <Textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="bg-slate-950 border-slate-800 text-white"
                                />
                            </div>
                            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
                                Enregistrer
                            </Button>
                        </form>

                        {/* History Section */}
                        {editingClient && (
                            <div className="space-y-4 border-l border-slate-800 md:pl-6">
                                <h3 className="text-lg font-semibold text-orange-400 border-b border-gray-700 pb-2">Historique des Commandes</h3>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                    {editingClient.orders && editingClient.orders.length > 0 ? (
                                        editingClient.orders.map((order: any) => (
                                            <div key={order.id} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="font-bold text-white">#{order.id}</span>
                                                    <span className="text-slate-400 text-xs">{new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-300">
                                                        <span className="font-semibold text-orange-400">{order.items?.length || 0}</span> pizzas
                                                    </span>
                                                    <span className="font-bold text-white">{order.total.toFixed(2)}€</span>
                                                </div>
                                                <div className="mt-2 pt-2 border-t border-slate-800/50 flex flex-wrap gap-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${order.status === 'READY' || order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-400' :
                                                        order.status === 'CANCELLED' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-yellow-500/10 text-yellow-400'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${order.type === 'delivery' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'
                                                        }`}>
                                                        {order.type === 'delivery' ? 'Livraison' : 'Emporter'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-500 text-center py-8 italic">Ao cune commande enregistrée</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
