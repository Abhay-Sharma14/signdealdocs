import type {MetadataRoute} from "next";
import {siteUrl} from "@/lib/site-url";
export default function robots():MetadataRoute.Robots{
 const origin=siteUrl().origin;
 return {
  rules:[
   {userAgent:"*",allow:"/",disallow:["/api/","/dashboard","/settings","/login","/d/","/sign/"]},
  ],
  sitemap:`${origin}/sitemap.xml`,
  host:origin,
 };
}
