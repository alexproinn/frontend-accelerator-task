import scenarios from '../../frontend-accelerator-assessment/fixtures/mock-scenarios.json';
import { createStore } from './store';
export const scenarioNames = ['normal', 'empty', 'list-error', 'details-error', 'coaches-error', 'create-error'] as const;
export type Scenario = typeof scenarioNames[number];
export const mockState = { scenario: 'normal' as Scenario, records: createStore(), latency: scenarios.normal.defaultLatencyMs };
export function resetMocks(name: string = 'normal', now = Date.now()) {
    if (!scenarioNames.some(s => s === name))
        throw new Error(`Unknown mock scenario: ${name}`);
    mockState.scenario = name as Scenario;
    mockState.records = createStore(name === 'empty', now);
    mockState.latency = scenarios.normal.defaultLatencyMs;
}
export function setScenario(name: string) {
    if (name === 'empty' || !scenarioNames.some(s => s === name))
        throw new Error('Choose a supported error scenario or normal. Empty is startup-only.');
    mockState.scenario = name as Scenario;
}
export const scenarioErrors = scenarios;
