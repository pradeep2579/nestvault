// Plain option lists with no dependencies, safe to import from browser components.
export const interests = ["Hot Desk (Day Pass)", "Dedicated Desk", "Private Cabin", "Meeting Room", "Virtual Office", "Event Space", "Just exploring"] as const;
export const plans = interests.filter(item => item !== "Just exploring");
export const moveInOptions = ["Immediately", "Within 1 month", "1-3 months", "Just exploring"] as const;
export const budgetOptions = ["Under ₹5,000 / month", "₹5,000 - ₹15,000 / month", "₹15,000 - ₹30,000 / month", "₹30,000+ / month", "Not sure yet"] as const;
export const lostReasons = ["Price too high", "Location", "Chose a competitor", "No response", "Not the right fit", "Needs a different space", "Timing - not ready", "Other"] as const;
export const offlineChannels = ["Walk-in", "Phone call", "WhatsApp", "Referral", "Broker", "Event", "Other"] as const;
export const channels = ["Google search", "Google Ads", "Instagram", "Facebook", "WhatsApp", "LinkedIn", "YouTube", "Other website", "Direct / unknown", "Walk-in", "Phone call", "Referral", "Broker", "Event", "Other"] as const;
