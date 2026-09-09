import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';
import { resetMocks, setScenario } from './scenarios';
declare global {
    interface Window {
        __assessmentMocks?: {
            setScenario: typeof setScenario;
        };
    }
}
export async function startMocks() {
    resetMocks(new URLSearchParams(window.location.search).get('mockScenario') || 'normal');
    const worker = setupWorker(...handlers);
    await worker.start({ quiet: true, onUnhandledRequest(request, print) { if (new URL(request.url).pathname.startsWith('/api/'))
            print.error(); } });
    window.__assessmentMocks = { setScenario };
}
