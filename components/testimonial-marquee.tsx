import {testimonials} from "@/lib/testimonials";

const avatarColors:Record<string,string>={
 indigo:"bg-indigo-100 text-indigo-700",
 green:"bg-emerald-100 text-emerald-700",
 rose:"bg-rose-100 text-rose-700",
 amber:"bg-amber-100 text-amber-700",
};

export function TestimonialMarquee(){
 if(testimonials.length===0)return null;
 const cards=[...testimonials,...testimonials];
 return <section aria-labelledby="testimonial-heading" className="mx-auto max-w-7xl overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
  <div className="mb-7 text-center">
   <h2 id="testimonial-heading" className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">A smoother client experience</h2>
   <p className="mt-2 text-sm text-slate-500">Example feedback scenarios — not verified customer reviews.</p>
  </div>
  <div className="testimonial-marquee-mask overflow-hidden" aria-label="Example testimonial cards">
   <div className="testimonial-marquee-track flex w-max gap-4 py-2">
    {cards.map((item,index)=><blockquote key={`${item.name}-${index}`} aria-hidden={index>=testimonials.length} className="flex w-[280px] shrink-0 flex-col justify-between rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:w-[340px] sm:p-6">
     <p className="text-sm leading-7 text-slate-700">“{item.quote}”</p>
     <footer className="mt-5 flex items-center gap-3">
      <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${avatarColors[item.color]??avatarColors.indigo}`}>{item.initials}</span>
      <span className="min-w-0"><span className="block text-sm font-bold text-slate-900">{item.name}</span><span className="block text-xs text-slate-500">{item.role}</span></span>
     </footer>
    </blockquote>)}
   </div>
  </div>
 </section>;
}
