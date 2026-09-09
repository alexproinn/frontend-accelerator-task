import { useEffect, useState } from 'react';
import { ClientFailure, failureMessage } from '../../api/errors';
export type Remote<T> = {
    kind: 'loading';
} | {
    kind: 'success';
    data: T;
} | {
    kind: 'error';
    message: string;
    status?: number;
};
export function useRequest<T>(load: (signal: AbortSignal) => Promise<T>, enabled = true): Remote<T> {
    const [result, setResult] = useState<{
        load: typeof load;
        state: Remote<T>;
    } | null>(null);
    useEffect(() => {
        if (!enabled)
            return;
        const controller = new AbortController();
        void load(controller.signal).then(data => { if (!controller.signal.aborted)
            setResult({ load, state: { kind: 'success', data } }); }, error => { if (!controller.signal.aborted)
            setResult({ load, state: { kind: 'error', message: failureMessage(error), status: error instanceof ClientFailure ? error.status : undefined } }); });
        return () => controller.abort();
    }, [load, enabled]);
    return result?.load === load ? result.state : { kind: 'loading' };
}
