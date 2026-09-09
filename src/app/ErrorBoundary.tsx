import { Component, type ReactNode } from 'react';
export class ErrorBoundary extends Component<{
    children: ReactNode;
}, {
    failed: boolean;
}> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    render() { return this.state.failed ? <main><h1>Something went wrong.</h1><button onClick={() => location.reload()}>Reload workspace</button></main> : this.props.children; }
}
