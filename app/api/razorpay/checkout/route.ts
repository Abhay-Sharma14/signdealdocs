import {jsonError} from "@/lib/deal-room";
export async function POST(){return jsonError("Razorpay checkout is not configured yet. Indian subscriptions are not available.",503);}
