import axios from "axios";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { MiddlewareFactory } from "./stackHandler";

export const adminMiddleware:MiddlewareFactory = (next) => async (request)=> {
    const { pathname } = request.nextUrl;
    if (pathname.startsWith('/admin')) {
        try {
            const cookieStore = cookies();
            const atToken = cookieStore.get('accessToken')?.value
        // Send a request to the backend to verify the user's role
        const response = await axios.get('/admin/verify',{
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        });
        console.log('DTA MIDDLEWARE: ',response.data);
        
        if (response.data) {
            // User is authorized, allow them to proceed
            return next(request);
        } else {
            // User is unauthorized, redirect to login or error page
            return NextResponse.redirect(new URL('/login', request.url));
        }
        } catch (error) {
        console.error('Error verifying admin access:', error);
        return NextResponse.redirect(new URL('/404', request.url));
        }
    }
    return next(request);
}

export const config = {
    matcher: ['/admin/:path*'], // Apply only to /admin and subroutes
  };