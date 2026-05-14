"use client";

import { useEffect, useRef, useState } from "react";

type FormData = { name:string; email:string; phone:string; company:string; interest:string; teamSize:string; message:string; };
const interests = ["Hot Desk (Day Pass)","Dedicated Desk","Private Cabin","Meeting Room","Virtual Office","Event Space","Just exploring"];

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function Contact() {
  const { ref, inView } = useInView();
  const [form, setForm] = useState<FormData>({ name:"",email:"",phone:"",company:"",interest:"",teamSize:"",message:"" });
  const [status, setStatus] = useState<"idle"|"submitting"|"success"|"error">("idle");

  const update = (f: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setForm({ name:"",email:"",phone:"",company:"",interest:"",teamSize:"",message:"" });
    } catch { setStatus("error"); }
  };

  const inp: React.CSSProperties = {
    width:"100%", padding:"0.8rem 0.875rem",
    background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.1)",
    borderRadius:"2px", color:"white",
    fontFamily:"-apple-system,sans-serif", fontSize:"0.875rem",
    outline:"none", transition:"border-color 0.2s ease",
  };
  const lbl: React.CSSProperties = {
    display:"block", fontFamily:"-apple-system,sans-serif",
    fontSize:"0.68rem", letterSpacing:"0.1em", textTransform:"uppercase",
    color:"rgba(255,255,255,0.4)", marginBottom:"0.45rem", fontWeight:500,
  };
  const focus = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    (e.target.style.borderColor = "rgba(201,168,76,0.5)");
  const blur  = (e: React.FocusEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) =>
    (e.target.style.borderColor = "rgba(255,255,255,0.1)");

  return (
    <section id="contact" className="section-pad" style={{ background:"#0a0a0a", color:"white" }}>
      <div className="container">
        <div className="contact-grid" ref={ref}>

          {/* Left */}
          <div style={{ opacity:inView?1:0, transform:inView?"none":"translateX(-24px)", transition:"opacity 0.7s ease, transform 0.7s ease" }}>
            <div className="divider-gold" style={{ marginBottom:"1.25rem" }} />
            <p className="label" style={{ marginBottom:"0.875rem" }}>Get in Touch</p>
            <h2 className="h-section" style={{ color:"white", marginBottom:"1.25rem" }}>
              Book a free tour{" "}
              <span className="text-gold-gradient">today</span>
            </h2>
            <p style={{ fontFamily:"-apple-system,sans-serif", fontSize:"clamp(0.875rem,1.5vw,0.95rem)", lineHeight:1.85, color:"rgba(255,255,255,0.45)", fontWeight:300, marginBottom:"2.5rem" }}>
              Come experience Nest Vault in person. Our team will walk you through the space, help you choose the right plan, and answer every question. No commitment required.
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem" }}>
              {[
                { icon:"📞", label:"Call / WhatsApp", value:"+91 91426 96666", href:"tel:+919142696666" },
                { icon:"✉️", label:"Email",           value:"hello@nestvault.in", href:"mailto:hello@nestvault.in" },
                { icon:"📍", label:"Address",         value:"Road No. 36, Jubilee Hills, Hyderabad", href:"#location" },
              ].map(({ icon, label, value, href }) => (
                <a key={label} href={href} style={{ display:"flex", alignItems:"center", gap:"0.875rem", textDecoration:"none", color:"inherit" }}>
                  <div style={{ width:38, height:38, borderRadius:"2px", border:"1px solid rgba(201,168,76,0.18)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1rem", flexShrink:0 }}>
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.65rem", letterSpacing:"0.1em", textTransform:"uppercase", color:"rgba(255,255,255,0.3)", marginBottom:"0.15rem" }}>{label}</div>
                    <div style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.85rem", color:"#c9a84c", fontWeight:500 }}>{value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right — form */}
          <div style={{ opacity:inView?1:0, transform:inView?"none":"translateX(24px)", transition:"opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s" }}>
            {status === "success" ? (
              <div style={{ padding:"3rem 2rem", background:"rgba(45,158,126,0.08)", border:"1px solid rgba(45,158,126,0.3)", borderRadius:"4px", textAlign:"center" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"1rem" }}>✓</div>
                <h3 className="font-display" style={{ fontSize:"1.4rem", fontWeight:700, color:"#2d9e7e", marginBottom:"0.875rem" }}>We&apos;ll be in touch!</h3>
                <p style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.875rem", color:"rgba(255,255,255,0.45)", lineHeight:1.7 }}>
                  Thank you for reaching out. Our team will contact you within 2 hours to schedule your tour.
                </p>
                <button onClick={() => setStatus("idle")} style={{ marginTop:"1.75rem", background:"none", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.45)", padding:"0.6rem 1.5rem", borderRadius:"2px", cursor:"pointer", fontFamily:"-apple-system,sans-serif", fontSize:"0.75rem" }}>
                  Submit another
                </button>
              </div>
            ) : (
              <form onSubmit={submit} style={{ padding:"clamp(1.5rem,4vw,2.5rem)", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"4px" }}>
                <div className="contact-form-row">
                  <div>
                    <label style={lbl}>Full Name *</label>
                    <input required value={form.name} onChange={update("name")} placeholder="Arjun Reddy" style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}>Email *</label>
                    <input required type="email" value={form.email} onChange={update("email")} placeholder="arjun@company.com" style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                <div className="contact-form-row" style={{ marginTop:"1.125rem" }}>
                  <div>
                    <label style={lbl}>Phone</label>
                    <input type="tel" value={form.phone} onChange={update("phone")} placeholder="+91 91426 96666" style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                  <div>
                    <label style={lbl}>Company</label>
                    <input value={form.company} onChange={update("company")} placeholder="Your company" style={inp} onFocus={focus} onBlur={blur} />
                  </div>
                </div>
                <div className="contact-form-row" style={{ marginTop:"1.125rem" }}>
                  <div>
                    <label style={lbl}>Interested In</label>
                    <select value={form.interest} onChange={update("interest")} style={{ ...inp, cursor:"pointer" }}>
                      <option value="" style={{ background:"#1a1a1a" }}>Select workspace</option>
                      {interests.map(o => <option key={o} value={o} style={{ background:"#1a1a1a" }}>{o}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Team Size</label>
                    <select value={form.teamSize} onChange={update("teamSize")} style={{ ...inp, cursor:"pointer" }}>
                      <option value="" style={{ background:"#1a1a1a" }}>Select size</option>
                      {["Just me","2–5","6–10","11–20","20+"].map(o => <option key={o} value={o} style={{ background:"#1a1a1a" }}>{o}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ marginTop:"1.125rem 0 1.75rem" }}>
                  <label style={{ ...lbl, marginTop:"1.125rem" }}>Message (optional)</label>
                  <textarea value={form.message} onChange={update("message")} rows={3} placeholder="Any specific requirements…" style={{ ...inp, resize:"vertical", minHeight:"88px" }} onFocus={focus} onBlur={blur} />
                </div>
                {status === "error" && (
                  <p style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.78rem", color:"#e74c3c", marginBottom:"0.875rem" }}>
                    Something went wrong. Please try again or call us directly.
                  </p>
                )}
                <button type="submit" disabled={status==="submitting"} className="btn-gold" style={{ width:"100%", justifyContent:"center", marginTop:"1.25rem", opacity:status==="submitting"?0.7:1 }}>
                  {status==="submitting" ? "Sending…" : "Book My Free Tour"}
                  {status!=="submitting" && (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
                <p style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.68rem", color:"rgba(255,255,255,0.18)", textAlign:"center", marginTop:"0.875rem" }}>
                  We respect your privacy. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.55fr;
          gap: clamp(2.5rem,6vw,6rem);
          align-items: start;
        }
        .contact-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        @media (max-width: 900px) {
          .contact-grid { grid-template-columns: 1fr; gap: 3rem; }
        }
        @media (max-width: 540px) {
          .contact-form-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </section>
  );
}
