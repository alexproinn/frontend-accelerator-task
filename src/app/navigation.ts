import { useSyncExternalStore } from 'react';
const subscribe = (notify: () => void) => { window.addEventListener('hashchange', notify); return () => window.removeEventListener('hashchange', notify); };
export const sessionLink = (id: string) => `#/sessions/${encodeURIComponent(id)}`;
export function useNavigation() {
    const hash = useSyncExternalStore(subscribe, () => window.location.hash || '#/sessions');
    if (hash === '#/sessions' || hash === '#/' || hash === '#')
        return { kind: 'list' as const, id: '' };
    if (hash === '#/sessions/new')
        return { kind: 'create' as const, id: '' };
    try {
        if (/^#\/sessions\/[^/]+$/.test(hash))
            return { kind: 'details' as const, id: decodeURIComponent(hash.slice(11)) };
    }
    catch { /* Recover through the not-found view. */ }
    return { kind: 'unknown' as const, id: '' };
}
