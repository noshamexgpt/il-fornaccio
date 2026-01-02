import { getAllCustomers } from "@/app/actions";
import { ClientsClient } from "./clients-client";

export default async function ClientsPage() {
    const clients = await getAllCustomers();
    // Serialize dates for client component
    const sanitizedClients = clients.map((c: any) => ({
        ...c,
        name: `${c.firstName} ${c.lastName}`.trim(), // Combined for display
        firstName: c.firstName,
        lastName: c.lastName,
        orderCount: c._count.orders,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
    }));

    return <ClientsClient initialClients={sanitizedClients} />;
}
