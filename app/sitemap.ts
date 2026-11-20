import type {MetadataRoute} from "next";
import {siteUrl} from "@/lib/site-url";
export default function sitemap():MetadataRoute.Sitemap{
 const base=siteUrl().origin;
 return ["/","/pricing","/client-onboarding-software","/privacy","/terms","/fr","/de","/ja"].map(path=>({
  url:`${base}${path}`,
  changeFrequency:path==="/"?"weekly":"monthly",
  priority:path==="/"?1:path==="/pricing"||path==="/client-onboarding-software"?0.8:0.5,
 }));
}
