import { describe, it, expect } from 'vitest';
import { validate, emptyDraft } from './session-form';
import { localStart } from './date-time';
import { coaches } from '../../mocks/store';
describe('submission boundary', () => {
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
