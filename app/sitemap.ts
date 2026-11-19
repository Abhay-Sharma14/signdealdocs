import type {MetadataRoute} from "next";
import {siteUrl} from "@/lib/site-url";
export default function sitemap():MetadataRoute.Sitemap{
 const base=siteUrl().origin;
 return ["/","/pricing","/privacy","/terms","/fr","/de","/ja"].map(path=>({
  url:`${base}${path}`,
  changeFrequency:path==="/"?"weekly":"monthly",
  priority:path==="/"?1:path==="/pricing"?0.8:0.5,
 }));
}
