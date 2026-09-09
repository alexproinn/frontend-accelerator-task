import { it, expect } from 'vitest';
import { http, HttpResponse, delay } from 'msw';
import { sessionsClient } from './sessions-client';
import { server } from '../mocks/server';
import { resetMocks, mockState, setScenario } from '../mocks/scenarios';
import { createStore } from '../mocks/store';
import { localStart } from '../features/sessions/date-time';
import type { CreateSessionRequest } from './contracts';
const input: CreateSessionRequest = { title: 'New session', type: 'training', startsAt: '2026-10-01T12:00:00Z', durationMinutes: 90, coachId: 'coach_01', locationName: 'North court', locationAddress: '18 Harbor Street', capacity: 18, visibility: 'public' };
it('rebases all timestamps once and persists creation from empty through list and details', async () => {
    const now = Date.now();
    const original = createStore(false, Date.parse('2026-07-27T12:00:00Z'));
    const shifted = createStore(false, now);
    for (const [id, s] of original) {
        const next = shifted.get(id)!;
        for (const key of ['startsAt', 'createdAt', 'updatedAt'] as const)
            expect(Date.parse(next[key]) - Date.parse(s[key])).toBe(now - Date.parse('2026-07-27T12:00:00Z'));
        if (s.cancellation)
            expect(Date.parse(next.cancellation!.cancelledAt) - Date.parse(s.cancellation.cancelledAt)).toBe(now - Date.parse('2026-07-27T12:00:00Z'));
    }
    resetMocks('empty');
    mockState.latency = 0;
    expect((await sessionsClient.list({ query: '', status: '' })).data).toHaveLength(0);
    const created = await sessionsClient.create(input);
    expect(created).toMatchObject({ title: input.title, startsAt: input.startsAt, durationMinutes: 90, capacity: 18, location: { name: input.locationName, address: input.locationAddress }, coach: expect.objectContaining({ id: 'coach_01' }), status: 'scheduled', bookedCount: 0, createdAt: new Date(now).toISOString(), description: null });
    expect((await sessionsClient.details(created.id)).id).toBe(created.id);
    expect((await sessionsClient.list({ query: 'Harbor', status: 'scheduled' })).meta).toEqual({ page: 1, pageSize: 10, total: 1 });
});
it('preserves contract errors and rejects malformed successful responses', async () => {
    setScenario('details-error');
    await expect(sessionsClient.details('ses_101')).rejects.toMatchObject({ status: 500, code: 'SESSION_DETAILS_UNAVAILABLE' });
    expect((await sessionsClient.details('ses_102')).id).toBe('ses_102');
    await expect(sessionsClient.details('unknown')).rejects.toMatchObject({ status: 404 });
    const response = await fetch('http://localhost/api/sessions?status=invalid');
    expect(response.status).toBe(400);
    await expect(sessionsClient.create({ ...input, capacity: 0 })).rejects.toMatchObject({ status: 400, fieldErrors: { capacity: expect.any(String) } });
    server.use(http.get('http://localhost/api/coaches', () => HttpResponse.json({ data: [{ id: 'broken' }] })));
    await expect(sessionsClient.coaches()).rejects.toMatchObject({ kind: 'invalid-response' });
});
it('aborts obsolete reads rather than publishing their response', async () => {
    server.use(http.get('http://localhost/api/coaches', async () => { await delay(100); return HttpResponse.json({ data: [] }); }));
    const controller = new AbortController();
    const promise = sessionsClient.coaches(controller.signal);
    controller.abort();
    await expect(promise).rejects.toBeDefined();
});
it('uses the earlier repeated local time and rejects daylight-saving gaps in New York', () => {
    const prior = process.env.TZ;
    process.env.TZ = 'America/New_York';
    try {
        expect(localStart('2026-03-08', '02:30')).toBeNull();
        expect(localStart('2026-11-01', '01:30')).toEqual({ iso: '2026-11-01T05:30:00.000Z', ambiguous: true });
    }
    finally {
        if (prior === undefined)
            delete process.env.TZ;
        else
            process.env.TZ = prior;
    }
});
