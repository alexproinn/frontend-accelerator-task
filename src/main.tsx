import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { ErrorBoundary } from './app/ErrorBoundary';
import './styles.css';
async function start() {
    if (import.meta.env.MODE === 'assessment')
        await (await import('./mocks/browser')).startMocks();
    createRoot(document.getElementById('root')!).render(<StrictMode><ErrorBoundary><App /></ErrorBoundary></StrictMode>);
}
void start().catch(() => {
    const root = document.getElementById('root')!;
    root.textContent = 'Workspace couldn’t start. Reload to try again.';
    const button = document.createElement('button');
    button.textContent = 'Reload workspace';
    button.onclick = () => location.reload();
    root.append(button);
});
