import type { SessionStatus } from '../../api/contracts';
export const statusNames = { scheduled: 'Scheduled', full: 'Full', cancelled: 'Cancelled', completed: 'Completed' };
export function StatusLabel({ status }: {
    status: SessionStatus;
}) { return <span className={`status status-${status}`}>{statusNames[status]}</span>; }
