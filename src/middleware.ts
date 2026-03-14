import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export default function middleware(req: NextRequest) {
    // 1. Check if the user is trying to access a protected dashboard route
    const isDashboardRoute = req.nextUrl.pathname.match(/^\/(uz|ru|en)\/dashboard/);

    // 2. Look for the simple `firebase_auth_token` cookie set by AuthContext
    const token = req.cookies.get('firebase_auth_token');

    if (isDashboardRoute && !token) {
        // 3. Unauthorized user trying to access /dashboard -> redirect to /signin
        const locale = req.nextUrl.pathname.split('/')[1] || 'uz';
        const loginUrl = new URL(`/${locale}/signin`, req.url);
        return NextResponse.redirect(loginUrl);
    }

    // 4. Check if the user is accessing the landing page and is already authenticated
    const isLandingPage = req.nextUrl.pathname === '/' || req.nextUrl.pathname.match(/^\/(uz|ru|en)\/?$/);
    if (isLandingPage && token) {
        const locale = req.nextUrl.pathname.split('/')[1] || 'uz';
        const dashboardUrl = new URL(`/${locale}/dashboard`, req.url);
        return NextResponse.redirect(dashboardUrl);
    }

    // 5. Otherwise, handle standard internationalization
    return intlMiddleware(req);
}

export const config = {
    // Match only internationalized pathnames, and ignore API, _next, etc.
    matcher: ['/', '/(uz|ru|en)/:path*']
};
