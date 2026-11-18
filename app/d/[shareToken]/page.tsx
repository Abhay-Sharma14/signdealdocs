import {AgencyDealRoom} from "./room";
export default async function DealRoomPage({params}:{params:Promise<{shareToken:string}>}){
 const {shareToken}=await params;return <AgencyDealRoom token={shareToken}/>;
}
