import {AgencyDealRoom} from "./room";
export default async function DealRoomPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <AgencyDealRoom token={slug}/>;}
