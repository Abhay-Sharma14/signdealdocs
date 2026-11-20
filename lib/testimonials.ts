export type Testimonial={quote:string;name:string;role:string;initials:string;color:"indigo"|"green"|"rose"|"amber"};

/** Product benefit cards for the early-access preview, not customer testimonials.
 * Replace with verified, permissioned customer testimonials when available.
 */
export const testimonials:Testimonial[]=[
 {quote:"Bring proposals, agreements, and onboarding documents into one organized client Deal Room.",name:"One Client Workspace",role:"Early access feature",initials:"01",color:"indigo"},
 {quote:"Give clients a straightforward path from reviewing an agreement to signing electronically.",name:"Simpler Signing",role:"Early access feature",initials:"02",color:"green"},
 {quote:"Share agency payment instructions and track client payment notifications without claiming automatic verification.",name:"Payment Coordination",role:"Early access feature",initials:"03",color:"rose"},
 {quote:"Present a more consistent client experience with agency branding and organized deal details.",name:"Agency Branding",role:"Early access feature",initials:"04",color:"amber"},
];
