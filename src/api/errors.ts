export class ClientFailure extends Error {
    constructor(public kind: 'http' | 'network' | 'invalid-response', message: string, public status?: number, public code?: string, public fieldErrors?: Record<string, string>) { super(message); }
}
export const failureMessage = (error: unknown) => error instanceof Error ? error.message : 'The request could not complete. Please try again.';
