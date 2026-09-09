import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation, sessionLink } from './navigation';
import { sessionsClient } from '../api/sessions-client';
import { statuses, type SessionStatus } from '../api/contracts';
import { useRequest } from '../features/sessions/use-request';
import { useCreateSession } from '../features/sessions/use-create-session';
import { SessionList } from '../features/sessions/SessionList';
import { SessionDetails } from '../features/sessions/SessionDetails';
import { CreateSession } from '../features/sessions/CreateSession';
import { RequestFeedback } from '../features/sessions/RequestFeedback';
import { statusNames } from '../features/sessions/StatusLabel';
export function App() {
    const route = useNavigation();
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<SessionStatus | ''>('');
    const [version, setVersion] = useState(0);
    const [receipt, setReceipt] = useState<{
        id: string;
        title: string;
    } | null>(null);
    const focusSuccess = useRef(false);
    const returnTo = useRef<{
        id: string;
        scroll: number;
    } | null>(null);
    useEffect(() => { const timer = setTimeout(() => setQuery(search.trim()), 300); return () => clearTimeout(timer); }, [search]);
    const load = useCallback((signal: AbortSignal) => { void version; return sessionsClient.list({ query, status }, signal); }, [query, status, version]);
    const list = useRequest(load);
    const form = useCreateSession(route.kind === 'create', (id, title) => {
        setReceipt({ id, title });
        setVersion(n => n + 1);
        if (location.hash === '#/sessions/new') {
            focusSuccess.current = true;
            location.hash = '/sessions';
        }
    });
    const clear = () => { setSearch(''); setQuery(''); setStatus(''); };
    const filters = Boolean(search.trim() || status);
    const activeKey = `${route.kind}:${route.id}`;
    const previousView = useRef(route.kind);
    useEffect(() => {
        const returningToList = route.kind === 'list' && previousView.current !== 'list';
        previousView.current = route.kind;
        const frame = requestAnimationFrame(() => {
            if (route.kind === 'details')
                document.getElementById('details-heading')?.focus();
            else if (route.kind === 'create')
                document.getElementById('create-heading')?.focus();
            else if (focusSuccess.current) {
                focusSuccess.current = false;
                document.getElementById('creation-success')?.focus();
            }
            else if (returnTo.current) {
                const { id, scroll } = returnTo.current;
                const links = Array.from(document.querySelectorAll<HTMLElement>('[data-session-id]'));
                const target = links.find(el => el.dataset.sessionId === id && el.getClientRects().length > 0);
                (target || document.getElementById('results-heading'))?.focus({ preventScroll: true });
                window.scrollTo(0, scroll);
            }
            else if (returningToList) {
                document.getElementById('workspace-heading')?.focus();
            }
        });
        return () => cancelAnimationFrame(frame);
    }, [activeKey, route.kind]);
    return <><a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); document.getElementById('main-content')?.focus(); }}>Skip to content</a><header className="app-bar"><a className="brand" href="#/sessions">COURTSIDE<span>TRAINING OPERATIONS</span></a><nav aria-label="Main"><a href="#/sessions" aria-current="page">Sessions</a></nav></header><main id="main-content" tabIndex={-1}>
    {receipt ? <div className="success-banner"><h2 id="creation-success" tabIndex={-1}>Session created: {receipt.title}</h2><div className="inline-actions"><a href={sessionLink(receipt.id)}>Open created session</a>{filters ? <button onClick={clear}>Clear filters</button> : null}<button onClick={() => setReceipt(null)}>Dismiss confirmation</button></div></div> : null}
    <div className="sr-only" role="status">{receipt ? `Session created: ${receipt.title}` : ''}</div>
    {form.pending && route.kind !== 'create' ? <p className="notice" role="status">Creating session… <a href="#/sessions/new">Return to session form</a></p> : null}
    {form.message && route.kind !== 'create' ? <p className="error-banner" role="status">{form.message} <a href="#/sessions/new">Review session form</a></p> : null}
    {route.kind === 'create' ? <CreateSession form={form}/> : route.kind === 'unknown' ? <section><h1>Page not found</h1><a href="#/sessions">Back to sessions</a></section> : <>
      <div className={`workspace-header ${route.kind === 'details' ? 'details-open' : ''}`}><div><p className="eyebrow">YOUR WORKSPACE</p><h1 id="workspace-heading" tabIndex={-1}>Training sessions</h1><p className="muted">Find sessions, review capacity, and schedule training.</p></div><div><a className="primary button" href="#/sessions/new">{form.dirty ? 'Resume session draft' : 'Create session'}</a>{form.dirty ? <small>Draft kept for this visit.</small> : null}</div></div>
      <div className={`workspace ${route.kind === 'details' ? 'has-details' : ''}`}><section className="list-region" aria-label="Sessions workspace"><div className="filters surface"><div className="search-field"><label htmlFor="search">Search sessions</label><input id="search" type="search" value={search} placeholder="Search title, coach, or location…" onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter')
            setQuery(search.trim()); }}/></div><div><label htmlFor="status">Status</label><select id="status" value={status} onChange={e => { setStatus(e.target.value as SessionStatus | ''); setQuery(search.trim()); }}><option value="">All statuses</option>{statuses.map(s => <option key={s} value={s}>{statusNames[s]}</option>)}</select></div><button className="clear-filter" onClick={clear} disabled={!filters}>Clear filters</button></div>
      <section className="surface results"><h2 id="results-heading" tabIndex={-1}>{list.kind === 'success' && query === search.trim() ? `${list.data.meta.total} ${list.data.meta.total === 1 ? 'session' : 'sessions'}` : 'Sessions'}</h2>
      {list.kind === 'loading' || query !== search.trim() ? <RequestFeedback message="Loading sessions…"/> : list.kind === 'error' ? <RequestFeedback message={receipt ? `Session created, but the list could not refresh. ${list.message}` : list.message} retry={() => setVersion(n => n + 1)}/> : list.data.data.length ? <><p className="sr-only" role="status">{list.data.meta.total} sessions found.</p><SessionList sessions={list.data.data} selected={route.id} onOpen={id => { returnTo.current = { id, scroll: window.scrollY }; }}/></> : <div className="empty-state" aria-live="polite"><h3>{filters ? 'No sessions match your filters.' : 'No sessions yet.'}</h3><p>{filters ? 'Try another search or clear your filters.' : 'Create your first training session.'}</p>{filters ? <button onClick={clear}>Clear filters</button> : <a href="#/sessions/new" className="primary button">Create session</a>}</div>}
      </section></section>{route.kind === 'details' ? <SessionDetails id={route.id}/> : null}</div>
    </>}
  </main></>;
}
