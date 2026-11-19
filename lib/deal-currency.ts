export const supportedCurrencies=["USD","INR","EUR","GBP","JPY","AUD","CAD"] as const;
export type DealCurrency=typeof supportedCurrencies[number];
export function validCurrency(value:unknown):value is DealCurrency{
 return typeof value==="string"&&(supportedCurrencies as readonly string[]).includes(value);
}
export function currencySymbol(currency:string):string{
 switch(currency){case "INR":return "₹";case "EUR":return "€";case "GBP":return "£";case "JPY":return "¥";case "AUD":case "CAD":case "USD":return "$";default:return currency;}
}
export function formatDealAmount(amount:number,currency:string):string{
 const code=validCurrency(currency)?currency:"USD";
 return new Intl.NumberFormat(code==="INR"?"en-IN":code==="EUR"?"de-DE":code==="JPY"?"ja-JP":"en-US",{style:"currency",currency:code,maximumFractionDigits:2}).format(amount);
}
export function totalsByCurrency(deals:readonly {amount:number;currency?:string|null}[]):{currency:string;amount:number}[]{
 const totals=new Map<string,number>();
 for(const deal of deals){const currency=validCurrency(deal.currency)?deal.currency:"USD";totals.set(currency,(totals.get(currency)||0)+Number(deal.amount||0));}
 return [...totals].map(([currency,amount])=>({currency,amount}));
}
