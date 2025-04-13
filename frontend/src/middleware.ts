import axios from './api/axios';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const { pathname } = request.nextUrl;
  const user =  accessToken && await axios.get('/user/profile/info',{
    headers:{
      'Authorization':`Bearer ${accessToken}`
    }
  }) || null;
  
  if ((request.cookies.get('banned') || user && user?.data.userInfo.isBanned) && pathname !== '/banned'){
    return NextResponse.redirect(new URL('/banned', request.url));
  }
  if (!accessToken && refreshToken) {
    try {
      
      const response = await axios.post('/refresh', { refreshToken }, {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      const res = NextResponse.next();
      const fifteenMinutes = 15 * 60;
      const expirationDate = new Date(Date.now() + fifteenMinutes);

      res.cookies.set('accessToken', response.data.access_token, { maxAge: fifteenMinutes,expires:expirationDate });
      res.cookies.set('refreshToken', response.data.refresh_token, { maxAge: 28 * 24 * 60 * 60 });

      return res;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
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
          if (response.data) {
              // User is authorized, allow them to proceed
              return NextResponse.next();
          } else {
              // User is unauthorized, redirect to login or error page
              return NextResponse.redirect(new URL('/login', request.url));
          }
          } catch (error) {
            console.error('Error verifying admin access:', error);
            return NextResponse.redirect(new URL('/404', request.url));
          }
    }
  // For all other routes, proceed as normal
  return NextResponse.next();
}

export const config = {
  matcher: ['/:path*'], // Apply middleware to /admin and subroutes
};
