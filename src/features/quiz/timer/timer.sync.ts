export interface ClockOffset {
  readonly offsetMs: number;
  readonly sampledAt: number;
}

export function calculateClockOffset(serverNow: number, clientNow = Date.now()): ClockOffset {
  return { offsetMs: serverNow - clientNow, sampledAt: clientNow };
}

export function getSynchronizedNow(offset: ClockOffset, clientNow = Date.now()): number {
  return clientNow + offset.offsetMs;
}
