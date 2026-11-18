"use client";
import {useRef,useState,type PointerEvent} from "react";
type Mode="draw"|"type"|"upload";
type Stroke={x:number;y:number}[];
const fonts=["cursive","'Brush Script MT', cursive","'Segoe Script', cursive","'Lucida Handwriting', cursive"];
export function SignatureCapture({onSign,disabled=false}:{onSign:(pngDataUrl:string)=>Promise<void>;disabled?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null);
 const strokes=useRef<Stroke[]>([]);
 const active=useRef<Stroke|null>(null);
 const [mode,setMode]=useState<Mode>("draw");
 const [version,setVersion]=useState(0);
 const [name,setName]=useState("");
 const [font,setFont]=useState(0);
 const [upload,setUpload]=useState<string|null>(null);
 const [consent,setConsent]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const render=()=>{
  const ctx=canvas.current?.getContext("2d");if(!ctx||!canvas.current)return;
  ctx.clearRect(0,0,canvas.current.width,canvas.current.height);
  ctx.strokeStyle="#111827";ctx.fillStyle="#111827";ctx.lineWidth=3;ctx.lineCap="round";ctx.lineJoin="round";
  for(const stroke of [...strokes.current,...(active.current?[active.current]:[])]){
   if(!stroke.length)continue;ctx.beginPath();ctx.moveTo(stroke[0].x,stroke[0].y);
   for(const p of stroke.slice(1))ctx.lineTo(p.x,p.y);
   if(stroke.length===1){ctx.arc(stroke[0].x,stroke[0].y,1.5,0,Math.PI*2);ctx.fill();}else ctx.stroke();
  }
 };
 const point=(e:PointerEvent<HTMLCanvasElement>)=>{
  const rect=e.currentTarget.getBoundingClientRect();
  return {x:(e.clientX-rect.left)*e.currentTarget.width/rect.width,y:(e.clientY-rect.top)*e.currentTarget.height/rect.height};
 };
 const finish=()=>{if(active.current){strokes.current.push(active.current);active.current=null;setVersion(v=>v+1);render();}};
 const exportPng=async()=>{
  if(mode==="draw"){if(!strokes.current.length)throw Error("Draw a signature first.");return canvas.current!.toDataURL("image/png");}
  if(mode==="upload"){if(!upload)throw Error("Upload a signature first.");return upload;}
  if(!name.trim())throw Error("Type your signature first.");
  const c=document.createElement("canvas");c.width=900;c.height=220;
  const ctx=c.getContext("2d");if(!ctx)throw Error("Canvas unavailable.");
  ctx.fillStyle="#111827";ctx.textBaseline="middle";ctx.font=`italic 76px ${fonts[font]}`;
  const text=name.trim().slice(0,100);
  const measured=ctx.measureText(text).width;
  ctx.save();ctx.translate(30,110);ctx.scale(Math.min(1,830/Math.max(1,measured)),1);ctx.fillText(text,0,0);ctx.restore();
  return c.toDataURL("image/png");
 };
 const loadFile=async(file?:File)=>{
  setUpload(null);setError("");if(!file)return;
  if(!["image/png","image/jpeg"].includes(file.type)||file.size>2_000_000){setError("Choose a PNG/JPG image under 2 MB.");return;}
  try{
   const bitmap=await createImageBitmap(file);
   const c=document.createElement("canvas");const scale=Math.min(1,900/Math.max(bitmap.width,bitmap.height));
   c.width=Math.max(1,Math.round(bitmap.width*scale));c.height=Math.max(1,Math.round(bitmap.height*scale));
   c.getContext("2d")?.drawImage(bitmap,0,0,c.width,c.height);bitmap.close();
   setUpload(c.toDataURL("image/png"));
  }catch{setError("Could not read signature image.");}
 };
 const submit=async()=>{setError("");setBusy(true);try{await onSign(await exportPng());}catch(e){setError(e instanceof Error?e.message:"Signing failed.");}finally{setBusy(false);}};
 return <section className="space-y-4">
  <div role="tablist" aria-label="Signature method" className="flex gap-2">{(["draw","type","upload"] as Mode[]).map(m=><button key={m} type="button" role="tab" aria-selected={mode===m} onClick={()=>{setMode(m);setError("");}} className={`rounded-lg px-4 py-2 text-sm font-semibold ${mode===m?"bg-indigo-600 text-white":"border bg-white text-slate-700"}`}>{m[0].toUpperCase()+m.slice(1)}</button>)}</div>
  {mode==="draw"&&<div><canvas ref={canvas} width={900} height={220} aria-label="Draw your signature" className="h-40 w-full touch-none rounded-xl border bg-white" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);active.current=[point(e)];render();}} onPointerMove={e=>{if(active.current){active.current.push(point(e));render();}}} onPointerUp={finish} onPointerCancel={finish}/><div className="mt-2 flex gap-3"><button type="button" onClick={()=>{strokes.current=[];active.current=null;setVersion(v=>v+1);render();}} className="text-sm text-indigo-700">Clear</button><button type="button" disabled={version===0||strokes.current.length===0} onClick={()=>{strokes.current.pop();setVersion(v=>v+1);render();}} className="text-sm text-indigo-700 disabled:opacity-40">Undo</button></div></div>}
  {mode==="type"&&<div className="space-y-3"><label className="block text-sm font-semibold">Type your signature<input className="mt-1 w-full rounded-lg border p-3" value={name} maxLength={100} onChange={e=>setName(e.target.value)}/></label><label className="block text-sm">Signature style<select className="ml-3 rounded-lg border p-2" value={font} onChange={e=>setFont(Number(e.target.value))}>{fonts.map((_,i)=><option key={i} value={i}>Style {i+1}</option>)}</select></label><div className="min-h-24 overflow-hidden rounded-lg border bg-white p-4 text-4xl italic text-slate-900" style={{fontFamily:fonts[font]}}>{name||"Signature preview"}</div></div>}
  {mode==="upload"&&<div className="space-y-3"><input aria-label="Upload signature PNG or JPG" type="file" accept="image/png,image/jpeg" onChange={e=>void loadFile(e.target.files?.[0])}/>{upload&&<img src={upload} alt="Signature preview" className="max-h-40 max-w-full rounded-lg border bg-white p-2"/>}<p className="text-xs text-slate-500">PNG or JPG, up to 2 MB. Converted to PNG before submission.</p></div>}
  <label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>I agree to use electronic records and signatures</span></label>
  {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
  <button type="button" disabled={!consent||busy||disabled} onClick={()=>void submit()} className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?"Signing…":"Agree & Sign"}</button>
 </section>;
}
