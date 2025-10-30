// UI utils (no-op placeholders)
export function showSimulatorBadge(){ /* simulator mode removed — no-op */ }

// keep a safe global no-op for any legacy callers
window.showSimulatorBadge = window.showSimulatorBadge || function(){};
