import type {Metadata} from "next";
import {NextIntlClientProvider,hasLocale} from "next-intl";
import {getMessages,setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import {routing} from "@/i18n/routing";
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
 const {locale}=await params;
 if(!hasLocale(routing.locales,locale))return {};
 const path=locale==="en"?"/":`/${locale}`;
 return {alternates:{canonical:path,languages:{"en":"/","fr":"/fr","de":"/de","ja":"/ja"}}};
}
export function generateStaticParams(){return routing.locales.map(locale=>({locale}));}
export default async function LocaleLayout({children,params}:{children:React.ReactNode;params:Promise<{locale:string}>}){
 const {locale}=await params;
 if(!hasLocale(routing.locales,locale))notFound();
 setRequestLocale(locale);
 const messages=await getMessages();
 return <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>;
}
