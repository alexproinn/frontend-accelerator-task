import { sessionTypes, type CoachSummary, type CreateSessionRequest } from '../../api/contracts';
import { localStart } from './date-time';
export const emptyDraft = { title: '', type: '', date: '', time: '', duration: '', coachId: '', locationName: '', locationAddress: '', capacity: '', visibility: 'public', description: '', trainerNotes: '' };
export type Draft = typeof emptyDraft;
export type FieldErrors = Partial<Record<keyof Draft, string>>;
export function validate(d: Draft, coaches: CoachSummary[], now = Date.now()): {
    errors: FieldErrors;
    input?: CreateSessionRequest;
} {
    const errors: FieldErrors = {};
    for (const [key, min, max] of [['title', 3, 80], ['locationName', 2, 80], ['locationAddress', 3, 120]] as const) {
        if (d[key].trim().length < min || d[key].trim().length > max)
            errors[key] = `Enter ${min}–${max} characters.`;
    }
    const start = localStart(d.date, d.time);
    if (!start || Date.parse(start.iso) <= now) {
        errors.date = 'Choose a valid future date and time.';
        errors.time = errors.date;
    }
    if (!sessionTypes.some(t => t === d.type))
        errors.type = 'Choose a session type.';
    if (!coaches.some(c => c.id === d.coachId))
        errors.coachId = 'Choose an available coach.';
    for (const [key, min, max] of [['duration', 30, 240], ['capacity', 1, 100]] as const)
        if (!d[key].trim() || !Number.isInteger(Number(d[key])) || Number(d[key]) < min || Number(d[key]) > max)
            errors[key] = `Enter a whole number from ${min} to ${max}.`;
    if (d.visibility !== 'public' && d.visibility !== 'invite-only')
        errors.visibility = 'Choose a visibility.';
    if (d.trainerNotes.length > 500)
        errors.trainerNotes = 'Use no more than 500 characters.';
    if (Object.keys(errors).length || !start)
        return { errors };
    return { errors, input: { title: d.title.trim(), type: d.type as CreateSessionRequest['type'], startsAt: start.iso, durationMinutes: Number(d.duration), coachId: d.coachId, locationName: d.locationName.trim(), locationAddress: d.locationAddress.trim(), capacity: Number(d.capacity), visibility: d.visibility as CreateSessionRequest['visibility'], description: d.description.trim() || null, trainerNotes: d.trainerNotes.trim() || null } };
}
