import {getRequestConfig} from "next-intl/server";
import {routing} from "./routing";
export default getRequestConfig(async ({requestLocale})=>{
 const requested=await requestLocale;
 const locale=routing.locales.includes(requested as "en"|"fr"|"de"|"ja")?requested!:"en";
 return {locale,messages:(await import(`../messages/${locale}.json`)).default};
});
