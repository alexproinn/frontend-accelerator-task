import list from '../../frontend-accelerator-assessment/fixtures/sessions.json';
import coachesFixture from '../../frontend-accelerator-assessment/fixtures/coaches.json';
import clock from '../../frontend-accelerator-assessment/fixtures/fixture-clock.json';
import a from '../../frontend-accelerator-assessment/fixtures/session-details/ses_101.json';
import b from '../../frontend-accelerator-assessment/fixtures/session-details/ses_102.json';
import c from '../../frontend-accelerator-assessment/fixtures/session-details/ses_103.json';
import d from '../../frontend-accelerator-assessment/fixtures/session-details/ses_104.json';
import e from '../../frontend-accelerator-assessment/fixtures/session-details/ses_105.json';
import { details } from '../api/parse';
import type { SessionDetails, SessionSummary } from '../api/contracts';
export const coaches = coachesFixture.data;
export function createStore(empty = false, now = Date.now()) {
    const offset = now - Date.parse(clock.referenceNow);
    const shift = (s: string) => new Date(Date.parse(s) + offset).toISOString();
    const seeds = [a, b, c, d, e];
    const records = new Map<string, SessionDetails>();
    if (!empty)
        for (const item of list.data) {
            const raw = seeds.find(s => s.id === item.id);
            if (!details(raw))
                throw new Error('Invalid assessment fixture.');
            const value = structuredClone(raw);
            value.startsAt = shift(value.startsAt);
            value.updatedAt = shift(value.updatedAt);
            value.createdAt = shift(value.createdAt);
            if (value.cancellation)
                value.cancellation.cancelledAt = shift(value.cancellation.cancelledAt);
            records.set(value.id, value);
        }
    return records;
}
export function toSummary(s: SessionDetails): SessionSummary {
    return { id: s.id, title: s.title, type: s.type, status: s.status, startsAt: s.startsAt, durationMinutes: s.durationMinutes, capacity: s.capacity, bookedCount: s.bookedCount, visibility: s.visibility, coach: s.coach, location: s.location, updatedAt: s.updatedAt };
}
