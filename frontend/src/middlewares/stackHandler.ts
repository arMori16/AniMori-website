import {
    NextMiddleware,
    NextRequest,
    NextResponse
  } from "next/server";
  
  export type MiddlewareFactory = (next: (request: NextRequest) => Promise<NextResponse>) => (request: NextRequest) => Promise<NextResponse>;
  
  export function stackMiddlewares(functions: MiddlewareFactory[] = [], index = 0): NextMiddleware {
    const current = functions[index];
  
    if (current) {
      // Recursively create the next middleware in the stack
      const next = stackMiddlewares(functions, index + 1) as (request: NextRequest) => Promise<NextResponse>;
      return (request: NextRequest) => current(next)(request); // Ensure `next` is compatible with `MiddlewareFactory`
    }
  
    // If no middleware is left, return NextResponse.next()
    return () => NextResponse.next();
  }
  