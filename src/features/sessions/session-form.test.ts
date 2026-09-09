import { describe, it, expect } from 'vitest';
import { validate, emptyDraft } from './session-form';
import { localStart } from './date-time';
import { coaches } from '../../mocks/store';
const validDraft = { ...emptyDraft, title: 'New training', type: 'training', date: '2026-09-10', time: '15:30', duration: '90', coachId: coaches[0].id, locationName: 'North', locationAddress: '18 Harbor Street', capacity: '18' };
describe('submission boundary', () => {
    it.each([
        { title: 3, locationName: 2, locationAddress: 3, duration: '30', capacity: '1', trainerNotes: '' },
        { title: 80, locationName: 80, locationAddress: 120, duration: '240', capacity: '100', trainerNotes: 'x'.repeat(500) },
    ])('accepts inclusive limits with duration $duration and capacity $capacity', (limits) => {
        const result = validate({ ...validDraft, ...limits, title: `  ${'x'.repeat(limits.title)}  `, locationName: `  ${'x'.repeat(limits.locationName)}  `, locationAddress: `  ${'x'.repeat(limits.locationAddress)}  ` }, coaches);
        expect(result.errors).toEqual({});
        expect(result.input).toMatchObject({ title: 'x'.repeat(limits.title), locationName: 'x'.repeat(limits.locationName), locationAddress: 'x'.repeat(limits.locationAddress), durationMinutes: Number(limits.duration), capacity: Number(limits.capacity), trainerNotes: limits.trainerNotes || null });
    });
    it.each([
        ['title', ' x '], ['title', 'x'.repeat(81)],
        ['locationName', ' x '], ['locationName', 'x'.repeat(81)],
        ['locationAddress', ' xx '], ['locationAddress', 'x'.repeat(121)],
        ['duration', '29'], ['duration', '241'],
        ['capacity', '0'], ['capacity', '1.5'],
        ['coachId', 'unknown-coach'], ['type', 'unsupported'], ['visibility', 'unsupported'],
    ] as const)('blocks submission for invalid %s: %s', (field, value) => {
        const result = validate({ ...validDraft, [field]: value }, coaches);
        expect(result.errors).toEqual({ [field]: expect.any(String) });
        expect(result.input).toBeUndefined();
    });
    it('requires the start instant to be strictly in the future', () => {
        const start = Date.parse(localStart(validDraft.date, validDraft.time)!.iso);
        expect(validate(validDraft, coaches, start - 1).input).toBeDefined();
        const result = validate(validDraft, coaches, start);
        expect(result.errors).toEqual({ date: expect.any(String), time: expect.any(String) });
        expect(result.input).toBeUndefined();
    });
    it('validates all required fields and normalizes only valid requests', () => {
        expect(Object.keys(validate(emptyDraft, coaches).errors)).toEqual(expect.arrayContaining(['title', 'type', 'date', 'time', 'duration', 'coachId', 'locationName', 'locationAddress', 'capacity']));
        const valid = { ...emptyDraft, title: '  New training  ', type: 'training', date: '2026-09-10', time: '15:30', duration: '90', coachId: coaches[0].id, locationName: ' North ', locationAddress: ' 18 Harbor Street ', capacity: '18' };
        expect(validate(valid, coaches).input).toMatchObject({ title: 'New training', durationMinutes: 90, capacity: 18, description: null, trainerNotes: null, locationName: 'North' });
        expect(validate({ ...valid, duration: '30.5', capacity: '101', trainerNotes: 'x'.repeat(501) }, coaches).errors).toMatchObject({ duration: expect.any(String), capacity: expect.any(String), trainerNotes: expect.any(String) });
        expect(validate(valid, coaches, Date.parse('2027-01-01')).errors.date).toBeDefined();
    });
    it('rejects invalid local calendar values', () => {
        expect(localStart('2026-02-30', '10:00')).toBeNull();
        expect(localStart('2026-09-10', '25:00')).toBeNull();
        expect(localStart('2026-09-10', '15:30')?.iso).toMatch(/Z$/);
    });
});
