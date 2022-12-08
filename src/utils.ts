export const swapKV = (obj: Record<string | symbol, string | symbol>) => Object.fromEntries(Object.entries(obj).map(e => e.reverse()))