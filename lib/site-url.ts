/** Public canonical origin; set NEXT_PUBLIC_APP_URL to the verified production domain. */
export function siteUrl():URL {
 const value=process.env.NEXT_PUBLIC_APP_URL||"https://signdealdocs.com";
 try {
  const url=new URL(value);
  if(url.protocol==="https:"||url.hostname==="localhost")return new URL(url.origin);
 } catch {}
 return new URL("https://signdealdocs.com");
}
