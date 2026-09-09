import { sessionTypes, statuses, type SessionDetails, type SessionSummary, type CoachSummary } from './contracts';
import { ClientFailure } from './errors';
export const record = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
export const iso = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0, 19) === v.slice(0, 19);
const string = (v: unknown): v is string => typeof v === 'string';
const nullable = (v: unknown) => v === null || string(v);
const count = (v: unknown) => typeof v === 'number' && Number.isInteger(v) && v >= 0;
export function coach(v: unknown): v is CoachSummary { return record(v) && string(v.id) && string(v.name) && string(v.email); }
export function summary(v: unknown): v is SessionSummary {
    return record(v) && string(v.id) && string(v.title) && sessionTypes.some(t => t === v.type) && statuses.some(t => t === v.status)
        && iso(v.startsAt) && iso(v.updatedAt) && count(v.durationMinutes) && count(v.capacity) && count(v.bookedCount)
        && (v.visibility === 'public' || v.visibility === 'invite-only') && coach(v.coach)
        && record(v.location) && string(v.location.name) && string(v.location.address);
}
export function details(v: unknown): v is SessionDetails {
    return summary(v) && record(v) && iso(v.createdAt) && nullable(v.description) && nullable(v.trainerNotes)
        && (v.cancellation === null || (record(v.cancellation) && nullable(v.cancellation.reason) && iso(v.cancellation.cancelledAt)));
}
export function parseResponse(kind: 'list' | 'details' | 'coaches', v: unknown) {
    const valid = kind === 'details' ? details(v) : record(v) && Array.isArray(v.data) &&
        (kind === 'coaches' ? v.data.every(coach) : v.data.every(summary) && record(v.meta) && count(v.meta.page) && count(v.meta.pageSize) && count(v.meta.total));
    if (!valid)
        throw new ClientFailure('invalid-response', 'The server returned an unreadable response. Please try again.');
}
