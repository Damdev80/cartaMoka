interface StarConfig {
  count: number;
  containerId: string;
}

const DEFAULT_CONFIG: Omit<StarConfig, 'count'> = {
  containerId: 'stars-container'
};

const MIN_STARS = 24;
const RENDERED_STARS_PER_CONTAINER = new Map<string, number>();

function getDefaultStarCount(): number {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 40;
  }

  return window.innerWidth < 768 ? 70 : 120;
}

function getAdaptiveStarCount(baseCount: number): number {
  const cpuThreads = navigator.hardwareConcurrency ?? 8;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const isLowEnd = cpuThreads <= 4 || memory <= 4;

  const adjusted = isLowEnd ? Math.round(baseCount * 0.7) : baseCount;
  return Math.max(MIN_STARS, adjusted);
}

function createStar(): HTMLDivElement {
  const star = document.createElement('div');
  star.classList.add('star');

  const size = Math.random() * 2.5 + 0.5;

  star.style.cssText = `
    left: ${Math.random() * 100}%;
    top: ${Math.random() * 100}%;
    width: ${size}px;
    height: ${size}px;
    --duration: ${Math.random() * 3 + 1}s;
    --min-opacity: ${Math.random() * 0.3 + 0.1};
    animation-delay: ${Math.random() * 3}s;
  `;

  if (Math.random() > 0.7) {
    star.classList.add('bright');
  }

  return star;
}

export function destroyStarField(containerId = DEFAULT_CONFIG.containerId): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.replaceChildren();
  RENDERED_STARS_PER_CONTAINER.delete(containerId);
}

export function initStarField(config: Partial<StarConfig> = {}): void {
  const containerId = config.containerId ?? DEFAULT_CONFIG.containerId;
  const count = getAdaptiveStarCount(config.count ?? getDefaultStarCount());
  const container = document.getElementById(containerId);

  if (!container) return;

  if (RENDERED_STARS_PER_CONTAINER.get(containerId) === count) {
    return;
  }

  const starsFragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    starsFragment.appendChild(createStar());
  }

  container.replaceChildren(starsFragment);
  RENDERED_STARS_PER_CONTAINER.set(containerId, count);
}