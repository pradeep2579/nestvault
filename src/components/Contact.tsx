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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Build WhatsApp message with all form details
    const lines = [
      "🏢 *New Tour Booking Request — Nest Vault*",
      "",
      `👤 *Name:* ${form.name}`,
      `📧 *Email:* ${form.email}`,
      form.phone    ? `📱 *Phone:* ${form.phone}`           : null,
      form.company  ? `🏢 *Company:* ${form.company}`       : null,
      form.interest ? `💼 *Interested In:* ${form.interest}` : null,
      form.teamSize ? `👥 *Team Size:* ${form.teamSize}`    : null,
      form.message  ? `💬 *Message:* ${form.message}`       : null,
      "",
      "_Sent from nestvault.in_",
    ].filter(Boolean).join("\n");

    const waUrl = `https://wa.me/919142696666?text=${encodeURIComponent(lines)}`;

    // Open WhatsApp in new tab
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setStatus("success");
    setForm({ name:"", email:"", phone:"", company:"", interest:"", teamSize:"", message:"" });
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
              <div style={{ padding:"3rem 2rem", background:"rgba(37,211,102,0.06)", border:"1px solid rgba(37,211,102,0.25)", borderRadius:"4px", textAlign:"center" }}>
                <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>
                  <svg width="52" height="52" viewBox="0 0 24 24" fill="#25d366" style={{ margin:"0 auto", display:"block" }}>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <h3 className="font-display" style={{ fontSize:"1.4rem", fontWeight:700, color:"#25d366", marginBottom:"0.875rem" }}>Opening WhatsApp!</h3>
                <p style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.9rem", color:"rgba(255,255,255,0.5)", lineHeight:1.7 }}>
                  Your details have been sent to WhatsApp. Our team will respond within minutes.
                </p>
                <button onClick={() => setStatus("idle")} style={{ marginTop:"1.75rem", background:"none", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.45)", padding:"0.6rem 1.5rem", borderRadius:"2px", cursor:"pointer", fontFamily:"-apple-system,sans-serif", fontSize:"0.75rem" }}>
                  Submit another enquiry
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
                <button
                  type="submit"
                  className="btn-gold"
                  style={{
                    width:"100%", justifyContent:"center",
                    marginTop:"1.25rem",
                    background: "linear-gradient(135deg,#1a8a3e,#25d366)",
                  }}
                >
                  {/* WhatsApp icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Send via WhatsApp
                </button>
                <p style={{ fontFamily:"-apple-system,sans-serif", fontSize:"0.68rem", color:"rgba(255,255,255,0.22)", textAlign:"center", marginTop:"0.75rem" }}>
                  Your details will open directly in WhatsApp — no app install needed on desktop.
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
