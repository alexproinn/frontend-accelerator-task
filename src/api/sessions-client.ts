import type { SessionsResponse, SessionDetails, CoachesResponse, CreateSessionRequest, SessionStatus } from './contracts';
import { ClientFailure } from './errors';
import { parseResponse, record } from './parse';
async function request<T>(path: string, kind: 'list' | 'details' | 'coaches', init?: RequestInit): Promise<T> {
    let response: Response;
    try {
        response = await fetch(new URL(`/api${path}`, window.location.origin), init);
    }
    catch (error) {
        if (init?.signal?.aborted)
            throw error;
        throw new ClientFailure('network', 'We couldn’t confirm the result. Check your connection and try again.');
    }
    let body: unknown;
    try {
        body = await response.json();
    }
    catch {
        body = null;
    }
    if (!response.ok) {
        const error = record(body) && record(body.error) ? body.error : {};
        const fields = record(error.fieldErrors) ? Object.fromEntries(Object.entries(error.fieldErrors).filter((pair): pair is [
            string,
            string
        ] => typeof pair[1] === 'string')) : undefined;
        throw new ClientFailure('http', typeof error.message === 'string' ? error.message : 'The request failed. Please try again.', response.status, typeof error.code === 'string' ? error.code : undefined, fields);
    }
    if (response.status !== (init?.method === 'POST' ? 201 : 200))
        throw new ClientFailure('invalid-response', 'The server returned an unexpected result.');
    parseResponse(kind, body);
    return body as T;
}
export const sessionsClient = {
    list: (filters: {
        query: string;
        status: SessionStatus | '';
    }, signal?: AbortSignal) => request<SessionsResponse>(`/sessions?${new URLSearchParams(filters)}`, 'list', { signal }),
    details: (id: string, signal?: AbortSignal) => request<SessionDetails>(`/sessions/${encodeURIComponent(id)}`, 'details', { signal }),
    coaches: (signal?: AbortSignal) => request<CoachesResponse>('/coaches', 'coaches', { signal }),
    create: (input: CreateSessionRequest) => request<SessionDetails>('/sessions', 'details', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
};
