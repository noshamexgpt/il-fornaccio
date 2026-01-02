import { NextResponse } from "next/server";
import { mollieClient } from "@/lib/mollie";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        // Mollie sends the payment ID as 'id' in form-urlencoded body
        const formData = await req.formData();
        const paymentId = formData.get('id') as string;

        if (!paymentId) {
            return NextResponse.json({ error: "No payment ID provided" }, { status: 400 });
        }

        // Fetch valid payment status from Mollie
        const payment = await mollieClient.payments.get(paymentId);
        const orderId = payment.metadata.orderId;

        if (payment.status === 'paid') {
            await prisma.order.update({
                where: { id: parseInt(orderId as string) },
                data: { status: 'CONFIRMED' }
            });
        } else if (payment.status === 'canceled' || payment.status === 'expired' || payment.status === 'failed') {
            // Optional: Mark as cancelled or just leave pending
            // We could mark it as canceled if we want to show it in admin
        }

        return NextResponse.json({ received: true });

    } catch (error) {
        console.error("Mollie Webhook Error:", error);
        return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
    }
}
