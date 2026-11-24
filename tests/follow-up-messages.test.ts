import { describe, expect, it } from "vitest";
import { emailUrl, followUpMessage, whatsappUrl } from "../src/lib/follow-up-messages";

const lead = { name: "Asha Rao", phone: "+91 98765 43210", email: "asha@example.com", interest: "Private Cabin" };

describe("follow-up messages", () => {
  it("personalises by first name and interest, differently for each step", () => {
    expect(followUpMessage(1, lead)).toContain("Hi Asha");
    expect(followUpMessage(1, lead)).toContain("Private Cabin");
    expect(followUpMessage(2, lead)).toContain("following up on my earlier message");
    expect(followUpMessage(1, { ...lead, interest: "Just exploring" })).toContain("a workspace");
  });

  it("builds WhatsApp links, assuming India for bare 10-digit numbers", () => {
    expect(whatsappUrl("+91 98765 43210", "hi")).toBe("https://wa.me/919876543210?text=hi");
    expect(whatsappUrl("9876543210", "hi")).toBe("https://wa.me/919876543210?text=hi");
    expect(whatsappUrl("12345", "hi")).toBeNull();
    expect(whatsappUrl(null, "hi")).toBeNull();
  });

  it("builds mailto links only when there is an email", () => {
    expect(emailUrl("a@b.co", 1, "x y")).toContain("mailto:a@b.co?subject=");
    expect(emailUrl(null, 1, "x")).toBeNull();
  });
});
