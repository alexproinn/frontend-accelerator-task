import { it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, delay } from 'msw';
import { App } from '../../app/App';
import { server } from '../../mocks/server';
import { mockState, resetMocks, setScenario } from '../../mocks/scenarios';
import { coaches } from '../../mocks/store';
const user = () => userEvent.setup();
async function openCreate() {
    await user().click(screen.getAllByRole('link', { name: 'Create session' })[0]);
    await screen.findByRole('heading', { name: 'Create session' });
    await screen.findByRole('option', { name: 'Maya Brooks' });
}
async function fill() {
    const u = user();
    await u.type(screen.getByLabelText('Title'), 'Evening skills clinic');
    await u.selectOptions(screen.getByLabelText('Session type'), 'training');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-10-01' } });
    fireEvent.change(screen.getByLabelText('Start time'), { target: { value: '17:30' } });
    await u.type(screen.getByLabelText('Duration (minutes)'), '90');
    await u.selectOptions(screen.getByLabelText('Coach'), 'coach_01');
    await u.type(screen.getByLabelText('Location name'), 'North Court');
    await u.type(screen.getByLabelText('Location address'), '18 Harbor Street');
    await u.type(screen.getByLabelText('Capacity'), '18');
}
it('loads, searches server fields, combines status, distinguishes no matches and clears filters', async () => {
    mockState.latency = 60;
    render(<App />);
    expect(screen.getByText('Loading sessions…')).toBeDefined();
    await screen.findByRole('heading', { name: '5 sessions' });
    const u = user();
    for (const [term, count] of [['Shooting', 1], ['Maya', 2], ['North Court', 1]] as const) {
        await u.clear(screen.getByLabelText('Search sessions'));
        await u.type(screen.getByLabelText('Search sessions'), term);
        await screen.findByRole('heading', { name: count === 1 ? '1 session' : '2 sessions' });
    }
    await u.selectOptions(screen.getByLabelText('Status'), 'cancelled');
    await screen.findByRole('heading', { name: 'No sessions match your filters.' });
    await u.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    await screen.findByRole('heading', { name: '5 sessions' });
});
it('shows the distinct empty workspace and allows creation entry', async () => {
    resetMocks('empty');
    mockState.latency = 0;
    render(<App />);
    await screen.findByRole('heading', { name: 'No sessions yet.' });
    await openCreate();
    expect(screen.getByLabelText('Title')).toBeDefined();
});
it('preserves filters through details and recovers list and details requests', async () => {
    setScenario('list-error');
    render(<App />);
    await screen.findByText('Sessions cannot be loaded right now.');
    setScenario('normal');
    await user().click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByRole('heading', { name: '5 sessions' });
    await user().type(screen.getByLabelText('Search sessions'), 'Shooting');
    await screen.findByRole('heading', { name: '1 session' });
    setScenario('details-error');
    await user().click(screen.getAllByRole('link', { name: 'U14 Shooting Lab' })[0]);
    await screen.findByText('Session details cannot be loaded right now.');
    setScenario('normal');
    await user().click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByText('maya@example.test');
    await user().click(screen.getByRole('link', { name: /Back to sessions/ }));
    expect((screen.getByLabelText('Search sessions') as HTMLInputElement).value).toBe('Shooting');
});
it('validates, prevents duplicate pending creation and opens success hidden by a filter', async () => {
    let posts = 0;
    const listener = ({ request }: {
        request: Request;
    }) => { if (request.method === 'POST')
        posts++; };
    server.events.on('request:start', listener);
    render(<App />);
    await screen.findByRole('heading', { name: '5 sessions' });
    await user().selectOptions(screen.getByLabelText('Status'), 'cancelled');
    await openCreate();
    await user().click(screen.getByRole('button', { name: 'Create session' }));
    expect(screen.getByLabelText('Title').getAttribute('aria-invalid')).toBe('true');
    expect(posts).toBe(0);
    await fill();
    mockState.latency = 120;
    const submit = screen.getByRole('button', { name: 'Create session' });
    fireEvent.click(submit);
    fireEvent.click(submit);
    await screen.findByRole('button', { name: 'Creating session…' });
    await screen.findByRole('heading', { name: 'Session created: Evening skills clinic' });
    expect(posts).toBe(1);
    await user().click(screen.getByRole('link', { name: 'Open created session' }));
    await screen.findByText('0 booked of 18 places');
    server.events.removeListener('request:start', listener);
});
it('retains all form input after create failure and recovers without reload', async () => {
    setScenario('create-error');
    render(<App />);
    await openCreate();
    await fill();
    await user().type(screen.getByLabelText('Trainer notes (optional)'), 'Bring cones');
    await user().click(screen.getByRole('button', { name: 'Create session' }));
    await screen.findByText(/Your entries are still here/);
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Evening skills clinic');
    expect((screen.getByLabelText('Trainer notes (optional)') as HTMLTextAreaElement).value).toBe('Bring cones');
    setScenario('normal');
    await user().click(screen.getByRole('button', { name: 'Create session' }));
    await screen.findByRole('heading', { name: 'Session created: Evening skills clinic' });
});
it('recovers coaches, retains a draft and resolves a pending mutation after navigation', async () => {
    setScenario('coaches-error');
    render(<App />);
    await user().click(screen.getByRole('link', { name: 'Create session' }));
    await screen.findByText(/Coaches couldn’t load/);
    expect((screen.getByRole('button', { name: 'Create session' }) as HTMLButtonElement).disabled).toBe(true);
    setScenario('normal');
    await user().click(screen.getByRole('button', { name: 'Retry coaches' }));
    await screen.findByRole('option', { name: coaches[0].name });
    await fill();
    await user().click(screen.getAllByRole('link', { name: /Back to sessions/ })[0]);
    await user().click(screen.getByRole('link', { name: 'Resume session draft' }));
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Evening skills clinic');
    mockState.latency = 300;
    await user().click(screen.getByRole('button', { name: 'Create session' }));
    await user().click(screen.getAllByRole('link', { name: /Back to sessions/ })[0]);
    await screen.findByRole('heading', { name: 'Session created: Evening skills clinic' });
});
it('ignores a slow superseded list response', async () => {
    const response = vi.fn();
    server.use(http.get('http://localhost/api/sessions', async ({ request }) => { const old = new URL(request.url).searchParams.get('query') === 'old'; await delay(old ? 300 : 10); response(old); return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 10, total: old ? 9 : 0 } }); }));
    render(<App />);
    const input = screen.getByLabelText('Search sessions');
    fireEvent.change(input, { target: { value: 'old' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await new Promise(resolve => setTimeout(resolve, 30));
    fireEvent.change(input, { target: { value: 'new' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    await waitFor(() => expect(within(screen.getByRole('region', { name: 'Sessions workspace' })).getByRole('heading', { name: '0 sessions' })).toBeDefined());
    await waitFor(() => expect(response).toHaveBeenCalledWith(true));
    expect(screen.queryByRole('heading', { name: '9 sessions' })).toBeNull();
});

it('shows unmapped API validation messages and associates visibility errors with the radios', async () => {
    server.use(http.post('http://localhost/api/sessions', () => HttpResponse.json({error: {
        code: 'VALIDATION_FAILED', message: 'Correct the highlighted fields.',
        fieldErrors: {schedulePolicy: 'Choose a session within operating hours.', visibility: 'Choose invite-only for this session.'},
    }}, {status: 400})));
    render(<App />);
    await openCreate();
    await fill();
    await user().click(screen.getByRole('button', {name: 'Create session'}));
    const summary = await screen.findByRole('alert');
    expect(summary.textContent).toContain('Choose a session within operating hours.');
    const error = screen.getByText('Choose invite-only for this session.');
    for (const name of ['Public', 'Invite-only']) {
        const radio = screen.getByRole('radio', {name});
        expect(radio.getAttribute('aria-invalid')).toBe('true');
        expect(radio.getAttribute('aria-describedby')).toBe(error.id);
    }
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('radio', {name: 'Public'})));
    expect((screen.getByLabelText('Title') as HTMLInputElement).value).toBe('Evening skills clinic');
});

it.each(['details', 'create'] as const)('restores workspace focus when returning from direct %s navigation', async (view) => {
    history.replaceState(null, '', view === 'details' ? '/#/sessions/ses_101' : '/#/sessions/new');
    render(<App />);
    if (view === 'details') await screen.findByText('maya@example.test');
    else await screen.findByRole('heading', {name: 'Create session'});
    await waitFor(() => expect(document.activeElement?.id).toBe(view === 'details' ? 'details-heading' : 'create-heading'));
    const back = screen.getAllByRole('link', {name: /Back to sessions/})[0];
    back.focus();
    await user().keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('heading', {name: 'Training sessions'})));
});

it('restores workspace focus after entering and leaving creation without opening a row', async () => {
    render(<App />);
    await openCreate();
    const back = screen.getAllByRole('link', {name: /Back to sessions/})[0];
    back.focus();
    await user().keyboard('{Enter}');
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('heading', {name: 'Training sessions'})));
});
