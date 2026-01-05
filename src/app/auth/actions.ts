"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { compare } from "bcryptjs";
import { signSession } from "@/lib/auth";

export async function login(formData: FormData) {
    const password = formData.get("password") as string;
    const storedHash = process.env.ADMIN_PASSWORD_HASH;

    if (!storedHash) {
        console.error("ADMIN_PASSWORD_HASH is not defined in environment variables.");
        return { error: "Erreur configuration serveur" };
    }

    // Secure comparison
    const isValid = await compare(password, storedHash);

    if (isValid) {
        const cookieStore = await cookies();

        // Create JWT
        const token = await signSession({ role: "admin" });

        // Set cookie valid for 1 week
        cookieStore.set("admin_session", token, {
            httpOnly: true,
            secure: false, // process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
            sameSite: "lax",
        });
        redirect("/admin");
    } else {
        return { error: "Mot de passe incorrect" };
    }
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/");
}
