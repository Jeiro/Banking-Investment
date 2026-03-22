import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname
    const isAuthPage =
        path.startsWith("/login") ||
        path.startsWith("/register") ||
        path.startsWith("/forgot-password")
    const isDashboard = path.startsWith("/dashboard")
    const isAdmin = path.startsWith("/admin")

    // ── Not logged in ──────────────────────────────────────────────────
    if (!user && (isDashboard || isAdmin)) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    // ── Logged in → away from auth pages ──────────────────────────────
    if (user && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard/overview", request.url))
    }

    // ── Admin route → STRICT role check ───────────────────────────────
    if (user && isAdmin) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single()

        // Anyone who is not exactly "admin" gets bounced to their dashboard
        if (!profile || profile.role !== "admin") {
            return NextResponse.redirect(
                new URL("/dashboard/overview", request.url)
            )
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
}
