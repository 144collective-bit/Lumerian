// Shared display preferences for dates and times.
export const ui = { h24: false };
/** Spread into toLocale* options so every clock follows the 24-hour setting. */
export const hc = (): Intl.DateTimeFormatOptions => (ui.h24 ? { hourCycle: 'h23' } : {});
