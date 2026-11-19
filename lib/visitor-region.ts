export function isIndiaVisitor():boolean{
 if(typeof window==="undefined")return false;
 let zone="";try{zone=Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{}
 if(["Asia/Kolkata","Asia/Calcutta"].includes(zone))return true;
 // A non-India timezone takes precedence over browser language.
 if(zone)return false;
 return /(?:-|_)IN(?:-|_|$)/i.test(navigator.language);
}
