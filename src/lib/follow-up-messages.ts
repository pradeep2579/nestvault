export type FollowUpLead = { name: string; phone: string | null; email: string | null; interest: string | null };

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "there";
const what = (interest: string | null) => interest && interest !== "Just exploring" ? interest : "a workspace";

export function followUpMessage(step: 1 | 2, lead: FollowUpLead) {
  const hi = `Hi ${firstName(lead.name)}`;
  const body = step === 1
    ? `${hi}, thanks for your interest in ${what(lead.interest)} at Nest Vault, Hyderabad. Just checking in - would you like to book a tour of the space? Happy to answer any questions.`
    : `${hi}, following up on my earlier message about ${what(lead.interest)} at Nest Vault. We'd love to show you around - which day this week suits you for a quick tour? If now isn't the right time, just let me know.`;
  return `${body}\n\nTeam Nest Vault`;
}

// WhatsApp needs the full number with country code; bare 10-digit numbers are treated as Indian.
export function whatsappUrl(phone: string | null, text: string) {
  const digits = (phone || "").replace(/\D/g, "");
  const number = digits.length === 10 ? `91${digits}` : digits;
  return number.length >= 11 ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

export function emailUrl(email: string | null, step: 1 | 2, text: string) {
  return email ? `mailto:${email}?subject=${encodeURIComponent(step === 1 ? "Your Nest Vault enquiry" : "Following up on your Nest Vault enquiry")}&body=${encodeURIComponent(text)}` : null;
}
