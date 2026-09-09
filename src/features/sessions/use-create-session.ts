import { useCallback, useEffect, useRef, useState } from 'react';
import { sessionsClient } from '../../api/sessions-client';
import { ClientFailure, failureMessage } from '../../api/errors';
import { emptyDraft, validate, type Draft, type FieldErrors } from './session-form';
import { useRequest } from './use-request';
export function useCreateSession(active: boolean, onCreated: (id: string, title: string) => void) {
    const [draft, setDraft] = useState<Draft>({ ...emptyDraft });
    const [errors, setErrors] = useState<FieldErrors>({});
    const [message, setMessage] = useState('');
    const [pending, setPending] = useState(false);
    const lock = useRef(false);
    const [attempt, setAttempt] = useState(0);
    const loadCoaches = useCallback((signal: AbortSignal) => { void attempt; return sessionsClient.coaches(signal); }, [attempt]);
    const coaches = useRequest(loadCoaches, active);
    const dirty = Object.keys(draft).some(key => draft[key as keyof Draft] !== emptyDraft[key as keyof Draft]);
    useEffect(() => {
        if (!dirty && !pending)
            return;
        const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', warn);
        return () => window.removeEventListener('beforeunload', warn);
    }, [dirty, pending]);
    const focusErrors = () => requestAnimationFrame(() => { (document.querySelector('[aria-invalid="true"]') as HTMLElement | null)?.focus(); });
    function change(key: keyof Draft, value: string) {
        if (lock.current)
            return;
        const next = { ...draft, [key]: value };
        setDraft(next);
        if (Object.keys(errors).length && coaches.kind === 'success')
            setErrors(validate(next, coaches.data.data).errors);
    }
    async function submit() {
        if (lock.current || coaches.kind !== 'success' || !coaches.data.data.length)
            return;
        const checked = validate(draft, coaches.data.data);
        setErrors(checked.errors);
        setMessage('');
        if (!checked.input) {
            focusErrors();
            return;
        }
        lock.current = true;
        setPending(true);
        try {
            const created = await sessionsClient.create(checked.input);
            setDraft({ ...emptyDraft });
            setErrors({});
            onCreated(created.id, created.title);
        }
        catch (error) {
            const fields: FieldErrors = {};
            const unmappedMessages: string[] = [];
            if (error instanceof ClientFailure && error.fieldErrors)
                for (const [key, value] of Object.entries(error.fieldErrors)) {
                    if (key === 'startsAt') {
                        fields.date = value;
                        fields.time = value;
                    }
                    else if (key === 'durationMinutes')
                        fields.duration = value;
                    else if (Object.hasOwn(emptyDraft, key))
                        fields[key as keyof Draft] = value;
                    else
                        unmappedMessages.push(value);
                }
            setErrors(fields);
            setMessage(error instanceof ClientFailure && error.kind !== 'http' ? 'We couldn’t confirm whether this session was created. Check sessions before trying again.' : [failureMessage(error), ...unmappedMessages, 'Your entries are still here.'].join(' '));
            requestAnimationFrame(() => { const first = document.querySelector('[aria-invalid="true"]') || document.getElementById('form-error'); (first as HTMLElement | null)?.focus(); });
        }
        finally {
            lock.current = false;
            setPending(false);
        }
    }
    return { draft, errors, message, pending, dirty, coaches, change, submit, retryCoaches: () => setAttempt(n => n + 1) };
}
export type CreateController = ReturnType<typeof useCreateSession>;
