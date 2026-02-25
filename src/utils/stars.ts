interface StarConfig {
  count: number;
  shootingInterval: number;
  containerId: string;
}

const DEFAULT_CONFIG: StarConfig = {
  count: 150,
  shootingInterval: 4000,
  containerId: 'stars-container'
};

function createStar(container: HTMLElement): void {
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

  if (Math.random() > 0.7) star.classList.add('bright');

  container.appendChild(star);
}



export function initStarField(config: Partial<StarConfig> = {}): void {
  const { count, containerId } = { ...DEFAULT_CONFIG, ...config };
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = '';

  for (let i = 0; i < count; i++) {
    createStar(container);
  }

}