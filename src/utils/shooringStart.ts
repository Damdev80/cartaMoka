interface CometConfig {
  containerId: string;
  frequency: number; // cada cuantos ms aparece un cometa
  delay: number; // ms antes de que aparezca el primer cometa
}

const DEFAULT_CONFIG: CometConfig = {
  containerId: 'stars-container',
  frequency: 10000,
  delay: 200
};

function createComet(container: HTMLElement): void {
  const durationS = Math.random() * 0.8 + 0.8; // Más rápido: 0.8-1.6s
  const isMobile = window.innerWidth < 768;
  
  // En móviles empieza más arriba
  const startY = isMobile 
    ? Math.random() * 25 + 5  // 5-30% en móviles (más arriba)
    : Math.random() * 30 + 8; // 8-38% en desktop (más arriba)

  const comet = document.createElement('div');
  comet.classList.add('comet');
  comet.classList.toggle('comet-mobile', isMobile);
  comet.style.top = `${startY}%`;
  comet.style.setProperty('--duration', `${durationS}s`);

  // Crear estela
  const trail = document.createElement('div');
  trail.classList.add('comet-trail');
  comet.appendChild(trail);

  // Crear destello central
  const core = document.createElement('div');
  core.classList.add('comet-core');
  comet.appendChild(core);

  container.appendChild(comet);

  // Eliminar el cometa después de la animación
  const duration = durationS * 1000;
  setTimeout(() => {
    comet.remove();
  }, duration + 100);
}

export function initShooting(config: Partial<CometConfig> = {}): void {
  const { containerId, frequency, delay } = { ...DEFAULT_CONFIG, ...config };
  const container = document.getElementById(containerId);

  if (!container) return;

  // Primer cometa después del delay
  setTimeout(() => {
    createComet(container);

    // Luego crear cometas periódicamente
    setInterval(() => {
      createComet(container);
    }, frequency);
  }, delay);
}