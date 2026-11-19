import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{
 return {name:"SignDealDocs — Deal Rooms & E-Signatures",short_name:"SignDealDocs",description:"Share proposals, collect electronic signatures, request client documents, and manage deal rooms.",start_url:"/",display:"standalone",background_color:"#ffffff",theme_color:"#4f46e5",icons:[{src:"/favicon.ico",sizes:"any",type:"image/x-icon"}]};
}
