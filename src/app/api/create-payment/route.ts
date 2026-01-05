import { NextResponse } from "next/server";
import { mollieClient } from "@/lib/mollie";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { orderId } = await req.json();

        // 1. Fetch the order to get the total amount
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // 2. Format amount to string "10.00"
        const amountValue = order.total.toFixed(2);

        // 2a. Determine Base URL dynamically to handle port changes (e.g. 3000 vs 3002)
        const host = req.headers.get("host") || "localhost:3000";
        const protocol = host.includes("localhost") ? "http" : "https";
        const baseUrl = `${protocol}://${host}`;

        // 3. Create payment
        // We set the webhookUrl and redirectUrl. 
        // Note: localhost webhooks won't work without ngrok/tunnel, 
        // but redirect will work.
        const isLocalhost = baseUrl.includes("localhost");
        const webhookUrl = isLocalhost ? undefined : `${baseUrl}/api/webhooks/mollie`;

        const payment = await mollieClient.payments.create({
            amount: {
                currency: 'EUR',
                value: amountValue,
            },
            description: `Commande #${order.id}`,
            redirectUrl: `${baseUrl}/order/${order.id}/status`,
            webhookUrl: webhookUrl,
            metadata: {
                orderId: orderId,
            },
        });

        // Save paymentId to order for validation on return
        await prisma.order.update({
            where: { id: orderId },
            data: { paymentId: payment.id }
        });

        // 4. Return the checkout URL to frontend
        return NextResponse.json({ checkoutUrl: payment.getCheckoutUrl() });

    } catch (error) {
        console.error("Mollie Create Payment Error:", error);
        return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
    }
}
