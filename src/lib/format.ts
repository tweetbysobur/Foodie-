export const naira = (n: number) => "₦" + Math.round(n).toLocaleString("en-NG");

export const minutes = ([lo, hi]: [number, number]) => `${lo}-${hi} min`;

export const shortDate = (t: number) =>
  new Date(t).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export const clockTime = (t: number) => new Date(t).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
