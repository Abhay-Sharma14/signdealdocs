import createMiddleware from "next-intl/middleware";
import {NextRequest,NextResponse} from "next/server";
import {routing} from "./i18n/routing";
const intlMiddleware=createMiddleware(routing);
export default function proxy(request:NextRequest){
 const pathname=request.nextUrl.pathname;
 if(pathname==="/en"||pathname==="/en/"){
  const url=request.nextUrl.clone();url.pathname="/";
  return NextResponse.redirect(url,308);
 }
 return intlMiddleware(request);
}
// Localize only marketing home pages; leave dashboard, signing, API and deal routes intact.
export const config={matcher:["/","/(en|fr|de|ja)","/(en|fr|de|ja)/"]};
