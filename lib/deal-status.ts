/** Shared, accessible status badge presentation for deal-room workflows. */
export function dealStatusBadge(status:string,paymentNotified=false):{label:string;classes:string}{
 const value=status.trim().toLowerCase();
 if(value==="paid")return {label:"Paid",classes:"bg-emerald-100 text-emerald-700"};
 if(paymentNotified)return {label:"Pending Payment",classes:"bg-amber-100 text-amber-700"};
 if(value==="signed"||value==="completed")return {label:"Signed",classes:"bg-emerald-100 text-emerald-700"};
 if(value==="viewed")return {label:"Viewed",classes:"bg-amber-100 text-amber-700"};
 if(value==="sent")return {label:"Sent",classes:"bg-blue-100 text-blue-700"};
 if(value==="pending_payment"||value==="pending payment")return {label:"Pending Payment",classes:"bg-amber-100 text-amber-700"};
 return {label:value.replace(/_/g," ").replace(/\b\w/g,ch=>ch.toUpperCase())||"Pending",classes:"bg-slate-100 text-slate-700"};
}
