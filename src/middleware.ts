import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { VerifyJWT } from './jwt'
import { cookies } from 'next/headers'
// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if(request.nextUrl.pathname.startsWith("/admin")){
    const cookie = cookies().get( "Authorization")
    if(!cookie || !await VerifyJWT(cookie.value))
      return NextResponse.redirect(request.nextUrl.origin+"/login")
  }
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  runtime: "nodejs"
}
export const runtime = 'nodejs'