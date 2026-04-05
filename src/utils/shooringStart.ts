interface CometConfig {
  containerId: string;
  frequency: number; // cada cuantos ms aparece un cometa
  delay: number; // ms antes de que aparezca el primer cometa
  maxActive: number;
}

const DEFAULT_CONFIG: CometConfig = {
  containerId: 'stars-container',
  frequency: 9000,
  delay: 900,
  maxActive: 2
};

const MIN_INTERVAL_MS = 1800;
const JITTER_MS = 1800;

const activeComets = new Set<HTMLDivElement>();

let cometStartTimeoutId: number | undefined;
let cometLoopTimeoutId: number | undefined;
let activeConfig: CometConfig = DEFAULT_CONFIG;
let isRunning = false;
let visibilityHandlerAttached = false;

function clearCometTimers(): void {
  if (cometStartTimeoutId !== undefined) {
    window.clearTimeout(cometStartTimeoutId);
    cometStartTimeoutId = undefined;
  }

  if (cometLoopTimeoutId !== undefined) {
    window.clearTimeout(cometLoopTimeoutId);
    cometLoopTimeoutId = undefined;
  }
}

function getContainer(): HTMLElement | null {
  return document.getElementById(activeConfig.containerId);
}

function removeComet(comet: HTMLDivElement): void {
  activeComets.delete(comet);
  comet.remove();
}

function removeAllComets(): void {
  activeComets.forEach((comet) => {
    comet.remove();
  });
  activeComets.clear();

  // Limpieza defensiva por si quedaron elementos fuera del Set.
  const container = getContainer();
  container?.querySelectorAll('.comet').forEach((comet) => comet.remove());
}

function getAdaptiveFrequency(baseFrequency: number): number {
  const cpuThreads = navigator.hardwareConcurrency ?? 8;
  const isLowEnd = cpuThreads <= 4;

  return isLowEnd ? Math.round(baseFrequency * 1.25) : baseFrequency;
}

function createComet(container: HTMLElement): void {
  if (activeComets.size >= activeConfig.maxActive) {
    return;
  }

  const durationS = Math.random() * 1 + 1.6;
  const isMobile = window.innerWidth < 768;

  const startY = isMobile
    ? Math.random() * 18 + 6
    : Math.random() * 22 + 8;
  const travelX = isMobile ? 95 + Math.random() * 20 : 110 + Math.random() * 25;
  const travelY = isMobile ? 25 + Math.random() * 16 : 35 + Math.random() * 18;
  const size = isMobile ? Math.random() * 1.8 + 3.4 : Math.random() * 2.2 + 4.2;
  const trailLength = isMobile ? Math.random() * 22 + 34 : Math.random() * 30 + 45;
  const angle = Math.atan2(travelY, travelX) * (180 / Math.PI);

  const comet = document.createElement('div');
  comet.classList.add('comet');
  comet.style.top = `${startY}%`;
  comet.style.setProperty('--duration', `${durationS}s`);
  comet.style.setProperty('--travel-x', `${travelX}vw`);
  comet.style.setProperty('--travel-y', `${travelY}vh`);
  comet.style.setProperty('--comet-size', `${size}px`);
  comet.style.setProperty('--trail-length', `${trailLength}px`);
  comet.style.setProperty('--angle', `${angle}deg`);

  comet.addEventListener('animationend', () => {
    removeComet(comet);
  }, { once: true });

  container.appendChild(comet);
  activeComets.add(comet);
}

function scheduleNextComet(): void {
  if (!isRunning) {
    return;
  }

  const adaptiveFrequency = getAdaptiveFrequency(activeConfig.frequency);
  const variance = Math.random() * JITTER_MS;
  const timeoutMs = Math.max(MIN_INTERVAL_MS, adaptiveFrequency + variance);

  cometLoopTimeoutId = window.setTimeout(() => {
    if (!isRunning) {
      return;
    }

    if (document.visibilityState !== 'hidden') {
      const container = getContainer();
      if (container) {
        createComet(container);
      }
    }

    scheduleNextComet();
  }, timeoutMs);
}

function onVisibilityChange(): void {
  if (!isRunning) {
    return;
  }

  if (document.visibilityState === 'hidden') {
    clearCometTimers();
    return;
  }

  clearCometTimers();

  const container = getContainer();
  if (!container) {
    return;
  }

  createComet(container);
  scheduleNextComet();
}

function ensureVisibilityHandler(): void {
  if (visibilityHandlerAttached) {
    return;
  }

  document.addEventListener('visibilitychange', onVisibilityChange);
  visibilityHandlerAttached = true;
}

function removeVisibilityHandler(): void {
  if (!visibilityHandlerAttached) {
    return;
  }

  document.removeEventListener('visibilitychange', onVisibilityChange);
  visibilityHandlerAttached = false;
}

export function destroyShooting(): void {
  isRunning = false;
  clearCometTimers();
  removeVisibilityHandler();
  removeAllComets();
}

export function initShooting(config: Partial<CometConfig> = {}): void {
  const nextConfig = { ...DEFAULT_CONFIG, ...config };
  const container = document.getElementById(nextConfig.containerId);

  if (!container) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    destroyShooting();
    return;
  }

  destroyShooting();

  activeConfig = nextConfig;
  isRunning = true;
  ensureVisibilityHandler();

  // Primer cometa después del delay
  cometStartTimeoutId = window.setTimeout(() => {
    if (!isRunning || document.visibilityState === 'hidden') {
      return;
    }

    createComet(container);
    scheduleNextComet();
  }, activeConfig.delay);
}