export const sessionTypes = ['training', 'camp', 'private'] as const;
export const statuses = ['scheduled', 'full', 'cancelled', 'completed'] as const;
export type SessionType = typeof sessionTypes[number];
export type SessionStatus = typeof statuses[number];
export type Visibility = 'public' | 'invite-only';
export interface CoachSummary {
    id: string;
    name: string;
    email: string;
}
export interface SessionSummary {
    id: string;
    title: string;
    type: SessionType;
    status: SessionStatus;
    startsAt: string;
    durationMinutes: number;
    capacity: number;
    bookedCount: number;
    visibility: Visibility;
    coach: CoachSummary;
    location: {
        name: string;
        address: string;
    };
    updatedAt: string;
}
export interface SessionDetails extends SessionSummary {
    description: string | null;
    trainerNotes: string | null;
    createdAt: string;
    cancellation: null | {
        reason: string | null;
        cancelledAt: string;
    };
}
export interface SessionsResponse {
    data: SessionSummary[];
    meta: {
        page: number;
        pageSize: number;
        total: number;
    };
}
export interface CoachesResponse {
    data: CoachSummary[];
}
export interface CreateSessionRequest {
    title: string;
    type: SessionType;
    startsAt: string;
    durationMinutes: number;
    coachId: string;
    locationName: string;
    locationAddress: string;
    capacity: number;
    visibility: Visibility;
    description?: string | null;
    trainerNotes?: string | null;
}
