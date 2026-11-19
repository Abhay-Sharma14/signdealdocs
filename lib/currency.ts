export const CURRENCIES={
 USD:{symbol:"$",rate:1,label:"USD"},
 EUR:{symbol:"€",rate:0.92,label:"EUR"},
 GBP:{symbol:"£",rate:0.79,label:"GBP"},
 INR:{symbol:"₹",rate:83,label:"INR"},
 JPY:{symbol:"¥",rate:150,label:"JPY"},
 AUD:{symbol:"A$",rate:1.52,label:"AUD"},
 CAD:{symbol:"C$",rate:1.36,label:"CAD"}
} as const;
export type CurrencyCode=keyof typeof CURRENCIES;
export const CURRENCY_CODES=Object.keys(CURRENCIES) as CurrencyCode[];
export function estimatePrice(usd:number,currency:CurrencyCode){return Math.round(usd*CURRENCIES[currency].rate);}
export function formatEstimatedPrice(usd:number,currency:CurrencyCode){
 const value=estimatePrice(usd,currency);
 return new Intl.NumberFormat(currency==="INR"?"en-IN":"en-US",{style:"currency",currency,minimumFractionDigits:0,maximumFractionDigits:0}).format(value);
}
export function detectCurrency(timeZone?:string,language?:string):CurrencyCode{
 const tz=(timeZone||"").toLowerCase();
 if(tz==="asia/kolkata"||tz==="asia/calcutta")return "INR";
 if(tz==="asia/tokyo")return "JPY";
 if(tz.startsWith("australia/"))return "AUD";
 if(tz.startsWith("canada/")||tz==="america/toronto"||tz==="america/vancouver"||tz==="america/edmonton"||tz==="america/halifax")return "CAD";
 if(tz==="europe/london"||tz==="europe/belfast"||tz==="europe/guernsey"||tz==="europe/jersey"||tz==="europe/isle_of_man")return "GBP";
 if(tz.startsWith("europe/")&&!["europe/zurich","europe/istanbul","europe/moscow","europe/minsk","europe/kiev","europe/kyiv","europe/belgrade","europe/sarajevo","europe/tirana","europe/skopje","europe/chisinau"].includes(tz))return "EUR";
 const lang=(language||"").toLowerCase();
 const region=lang.match(/[-_]([a-z]{2})(?:-|_|$)/)?.[1];
 if(region==="in")return "INR";
 if(region==="jp")return "JPY";
 if(region==="gb")return "GBP";
 if(region==="au")return "AUD";
 if(region==="ca")return "CAD";
 if(["fr","de","es","it","nl","pt","ie","at","be","fi","gr","lu"].includes(region||""))return "EUR";
 if(!region&&lang.startsWith("ja"))return "JPY";
 return "USD";
}
