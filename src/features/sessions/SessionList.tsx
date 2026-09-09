import type { SessionSummary } from '../../api/contracts';
import { sessionLink } from '../../app/navigation';
import { displayTime } from './date-time';
import { StatusLabel } from './StatusLabel';
export function SessionList({ sessions, selected, onOpen }: {
    sessions: SessionSummary[];
    selected: string;
    onOpen: (id: string) => void;
}) {
    const link = (s: SessionSummary) => <a data-session-id={s.id} aria-current={selected === s.id ? 'location' : undefined} href={sessionLink(s.id)} onClick={() => onOpen(s.id)}>{s.title}</a>;
    return <><table className="session-table"><caption className="sr-only">Training sessions</caption><thead><tr>{['Session', 'Start', 'Coach', 'Capacity', 'Status'].map(h => <th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{sessions.map(s => <tr key={s.id} className={s.id === selected ? 'selected' : ''}><th scope="row">{link(s)}<small>{s.type} · {s.location.name}</small></th><td>{displayTime(s.startsAt)}<small>{s.durationMinutes} minutes</small></td><td>{s.coach.name}</td><td className="capacity">{s.bookedCount} of {s.capacity} booked</td><td><StatusLabel status={s.status}/></td></tr>)}</tbody></table>
  <ul className="session-cards">{sessions.map(s => <li key={s.id}><div className="card-title">{link(s)}<StatusLabel status={s.status}/></div><p className="muted">{s.type} · {s.location.name}</p><dl><div><dt>Start</dt><dd>{displayTime(s.startsAt)} · {s.durationMinutes} minutes</dd></div><div><dt>Coach</dt><dd>{s.coach.name}</dd></div><div><dt>Capacity</dt><dd>{s.bookedCount} of {s.capacity} booked</dd></div></dl></li>)}</ul></>;
}
