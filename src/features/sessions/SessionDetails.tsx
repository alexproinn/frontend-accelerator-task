import { useCallback, useState, useSyncExternalStore } from 'react';
import { sessionsClient } from '../../api/sessions-client';
import { useRequest } from './use-request';
import { displayTime, timezone } from './date-time';
import { StatusLabel } from './StatusLabel';
import { RequestFeedback } from './RequestFeedback';
const subscribeWidth = (notify: () => void) => {
    if (!window.matchMedia) return () => {};
    const media = window.matchMedia('(min-width: 1280px)');
    media.addEventListener('change', notify);
    return () => media.removeEventListener('change', notify);
};
const isWide = () => window.matchMedia ? window.matchMedia('(min-width: 1280px)').matches : true;
export function SessionDetails({ id }: {
    id: string;
}) {
    const wide = useSyncExternalStore(subscribeWidth, isWide);
    const [attempt, setAttempt] = useState(0);
    const load = useCallback((signal: AbortSignal) => { void attempt; return sessionsClient.details(id, signal); }, [id, attempt]);
    const result = useRequest(load);
    const s = result.kind === 'success' ? result.data : null;
    return <section className="details surface" aria-labelledby="details-heading"><a className="back-link" href="#/sessions">← Back to sessions</a><h2 aria-level={wide ? 2 : 1} id="details-heading" tabIndex={-1}>{s ? s.title : 'Session details'}</h2>
  {s ? <><StatusLabel status={s.status}/><p className="muted">{s.type} · {s.visibility === 'public' ? 'Public' : 'Invite-only'}</p><dl className="details-data"><div><dt>Schedule</dt><dd>{displayTime(s.startsAt)}<small>{timezone()} · {s.durationMinutes} minutes</small></dd></div><div><dt>Capacity</dt><dd>{s.bookedCount} booked of {s.capacity} places<small>{Math.max(0, s.capacity - s.bookedCount)} places remaining</small></dd></div><div><dt>Coach</dt><dd>{s.coach.name}<small><a href={`mailto:${s.coach.email}`}>{s.coach.email}</a></small></dd></div><div><dt>Location</dt><dd>{s.location.name}<small>{s.location.address}</small></dd></div><div><dt>Description</dt><dd className="prose">{s.description || 'No description provided.'}</dd></div><div><dt>Trainer notes</dt><dd className="prose">{s.trainerNotes || 'No trainer notes.'}</dd></div><div><dt>Created</dt><dd>{displayTime(s.createdAt)}</dd></div><div><dt>Last updated</dt><dd>{displayTime(s.updatedAt)}</dd></div>{s.cancellation ? <div><dt>Cancelled</dt><dd>{displayTime(s.cancellation.cancelledAt)}<small>{s.cancellation.reason || 'No cancellation reason provided.'}</small></dd></div> : null}</dl></> : result.kind === 'error' ? <RequestFeedback message={result.status === 404 ? 'Session not found.' : result.message} retry={result.status === 404 ? undefined : () => setAttempt(n => n + 1)}/> : <p role="status">Loading session details…</p>}
  </section>;
}
