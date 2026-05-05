declare module '@livekit/components-react' {
  import type { ComponentType } from 'react';

  export const LiveKitRoom: ComponentType<Record<string, unknown>>;
  export const GridLayout: ComponentType<Record<string, unknown>>;
  export const ParticipantTile: ComponentType<Record<string, unknown>>;
  export const ConnectionStateToast: ComponentType<Record<string, unknown>>;
  export const RoomAudioRenderer: ComponentType<Record<string, unknown>>;
  export function useTracks(...args: unknown[]): Array<{ participant?: { name?: string; identity?: string } }>;
}
