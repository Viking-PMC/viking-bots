export type TicketStatus = 'opened' | 'closed' | 'failed' | 'created';
export type ApplicationStatus =
  | 'opened'
  | 'submitted'
  | 'accepted'
  | 'denied'
  | 'closed';

export type updateRolesType = 'promote' | 'demote';

export interface RolesCache {
  [key: string]: {
    promote: string | null;
    demote: string | null;
  };
}
