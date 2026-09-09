export function RequestFeedback({ message, retry }: {
    message: string;
    retry?: () => void;
}) { return <div className="empty-state"><p role="status">{message}</p>{retry ? <button onClick={retry}>Retry</button> : null}</div>; }
