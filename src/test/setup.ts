import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { server } from '../mocks/server';
import { resetMocks, mockState } from '../mocks/scenarios';
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-08T12:00:00Z'));
    resetMocks();
    mockState.latency = 5;
    history.replaceState(null, '', '/#/sessions');
    window.scrollTo = vi.fn();
});
afterEach(() => { cleanup(); server.resetHandlers(); vi.useRealTimers(); });
afterAll(() => server.close());
