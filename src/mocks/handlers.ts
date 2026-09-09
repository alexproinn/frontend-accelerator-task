import { http, HttpResponse, delay } from 'msw';
import { statuses, sessionTypes, type CreateSessionRequest, type SessionDetails } from '../api/contracts';
import { iso, record } from '../api/parse';
import { coaches, toSummary } from './store';
import { mockState, scenarioErrors } from './scenarios';
const headers = { 'Cache-Control': 'no-store' };
const error = (status: number, code: string, message: string, fieldErrors?: Record<string, string>) => HttpResponse.json({ error: { code, message, ...(fieldErrors ? { fieldErrors } : {}) } }, { status, headers });
const scenarioError = (name: 'list-error' | 'details-error' | 'coaches-error' | 'create-error') => HttpResponse.json(scenarioErrors[name].body, { status: 500, headers });
function validatePost(v: unknown): Record<string, string> {
    if (!record(v))
        return { title: 'Enter session information.' };
    const errors: Record<string, string> = {};
    for (const [key, min, max] of [['title', 3, 80], ['locationName', 2, 80], ['locationAddress', 3, 120]] as const)
        if (typeof v[key] !== 'string' || v[key].trim().length < min || v[key].trim().length > max)
            errors[key] = `Enter ${min}–${max} characters.`;
    for (const [key, min, max] of [['durationMinutes', 30, 240], ['capacity', 1, 100]] as const)
        if (typeof v[key] !== 'number' || !Number.isInteger(v[key]) || v[key] < min || v[key] > max)
            errors[key] = `Enter a whole number from ${min} to ${max}.`;
    if (!sessionTypes.some(t => t === v.type))
        errors.type = 'Choose a session type.';
    if (!coaches.some(c => c.id === v.coachId))
        errors.coachId = 'Choose an available coach.';
    if (v.visibility !== 'public' && v.visibility !== 'invite-only')
        errors.visibility = 'Choose a visibility.';
    if (!iso(v.startsAt) || Date.parse(v.startsAt) <= Date.now())
        errors.startsAt = 'Choose a future date and time.';
    if (v.trainerNotes != null && (typeof v.trainerNotes !== 'string' || v.trainerNotes.length > 500))
        errors.trainerNotes = 'Use no more than 500 characters.';
    if (v.description != null && typeof v.description !== 'string')
        errors.description = 'Enter text.';
    return errors;
}
const path = (suffix: string) => new URL(`/api${suffix}`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin).href;
export const handlers = [
    http.get(path('/sessions'), async ({ request }) => {
        const scenario = mockState.scenario;
        const url = new URL(request.url);
        const query = (url.searchParams.get('query') || '').trim().toLowerCase();
        const status = url.searchParams.get('status') || '';
        const invalid = url.searchParams.getAll('query').length > 1 || url.searchParams.getAll('status').length > 1 || (status !== '' && !statuses.some(s => s === status));
        const data = [...mockState.records.values()].filter(s => (!status || s.status === status) && [s.title, s.coach.name, s.location.name, s.location.address].some(v => v.toLowerCase().includes(query))).map(toSummary);
        await delay(mockState.latency);
        if (invalid)
            return error(400, 'INVALID_FILTER', 'This filter couldn’t be applied. Clear your filters and try again.');
        if (scenario === 'list-error')
            return scenarioError('list-error');
        return HttpResponse.json({ data, meta: { page: 1, pageSize: 10, total: data.length } }, { headers });
    }),
    http.get(path('/sessions/:id'), async ({ params }) => {
        const scenario = mockState.scenario;
        const value = mockState.records.get(String(params.id));
        await delay(mockState.latency);
        if (scenario === 'details-error' && params.id === 'ses_101')
            return scenarioError('details-error');
        return value ? HttpResponse.json(value, { headers }) : error(404, 'SESSION_NOT_FOUND', 'The requested session no longer exists.');
    }),
    http.get(path('/coaches'), async () => {
        const scenario = mockState.scenario;
        await delay(mockState.latency);
        return scenario === 'coaches-error' ? scenarioError('coaches-error') : HttpResponse.json({ data: coaches }, { headers });
    }),
    http.post(path('/sessions'), async ({ request }) => {
        const scenario = mockState.scenario;
        let raw: unknown;
        try {
            raw = await request.json();
        }
        catch {
            raw = null;
        }
        const fields = validatePost(raw);
        await delay(mockState.latency);
        if (Object.keys(fields).length)
            return error(400, 'VALIDATION_FAILED', 'Correct the highlighted fields.', fields);
        if (scenario === 'create-error')
            return scenarioError('create-error');
        const input = raw as CreateSessionRequest;
        const coach = coaches.find(c => c.id === input.coachId)!;
        const timestamp = new Date().toISOString();
        const session: SessionDetails = { id: `ses_${crypto.randomUUID()}`, title: input.title.trim(), type: input.type, status: 'scheduled', startsAt: input.startsAt, durationMinutes: input.durationMinutes, capacity: input.capacity, bookedCount: 0, visibility: input.visibility, coach, location: { name: input.locationName.trim(), address: input.locationAddress.trim() }, description: input.description?.trim() || null, trainerNotes: input.trainerNotes?.trim() || null, createdAt: timestamp, updatedAt: timestamp, cancellation: null };
        mockState.records = new Map([[session.id, session], ...mockState.records]);
        return HttpResponse.json(session, { status: 201, headers });
    }),
];
