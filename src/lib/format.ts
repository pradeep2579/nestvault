// The admin shows every time in India time, whatever time zone the server runs in.
const zone = "Asia/Kolkata";
export const istDate = (value: string | Date) => new Date(value).toLocaleDateString("en-IN", { timeZone: zone });
export const istDateTime = (value: string | Date) => new Date(value).toLocaleString("en-IN", { timeZone: zone });
