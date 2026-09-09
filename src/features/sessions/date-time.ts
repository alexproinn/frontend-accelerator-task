export const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const displayTime = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
export function localStart(date: string, time: string): {
    iso: string;
    ambiguous: boolean;
} | null {
    if (!/^\d{4}-\d\d-\d\d$/.test(date) || !/^\d\d:\d\d$/.test(time))
        return null;
    const [y, m, d] = date.split('-').map(Number), [h, min] = time.split(':').map(Number);
    const value = new Date(y, m - 1, d, h, min);
    if (value.getFullYear() !== y || value.getMonth() !== m - 1 || value.getDate() !== d || value.getHours() !== h || value.getMinutes() !== min)
        return null;
    let ambiguous = false;
    for (let offset = 15; offset <= 180; offset += 15) {
        const later = new Date(value.getTime() + offset * 60000);
        if (later.getDate() === d && later.getHours() === h && later.getMinutes() === min)
            ambiguous = true;
    }
    return { iso: value.toISOString(), ambiguous };
}
