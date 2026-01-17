import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create a Supabase client configured to use cookies
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet: { name: string, value: string, options: CookieOptions }[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value)
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    // IMPORTANT: This call refreshes the session if it's expired!
    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl

    // 1. Authenticated users trying to access login OR root -> Send to Feed
    if (user && (pathname.startsWith('/login') || pathname === '/')) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/feed'
        return NextResponse.redirect(redirectUrl)
    }

    // 2. Unauthenticated users -> Let the Page Components handle it.
    // We do NOT redirect here to avoid loops.

    return response
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
