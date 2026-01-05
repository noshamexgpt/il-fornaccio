import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
    // Check if the path starts with /admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
        // Check for the admin_session cookie
        const adminSession = request.cookies.get("admin_session");

        // If no cookie, redirect to login
        if (!adminSession) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        // Verify validity of the token
        const isValid = await verifySession(adminSession.value);
        if (!isValid) {
            const response = NextResponse.redirect(new URL("/login", request.url));
            response.cookies.delete("admin_session");
            return response;
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/admin/:path*",
};
