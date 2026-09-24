const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
document.querySelector('#current-year').textContent = new Date().getFullYear();

const canvas = document.querySelector('#signal-canvas');
const context = canvas?.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let animationFrame;

function resizeCanvas() {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function signalAt(x, offset) {
  const phase = (x + offset) % 360;
  if (phase < 150) return Math.sin(phase / 18) * 3;
  if (phase < 166) return -(phase - 150) * 1.2;
  if (phase < 181) return -19 + (phase - 166) * 7.4;
  if (phase < 192) return 92 - (phase - 181) * 12;
  if (phase < 205) return -40 + (phase - 192) * 3;
  if (phase < 250) return Math.sin((phase - 205) / 16) * 8;
  return 0;
}

function drawSignal(time = 0) {
  if (!canvas || !context) return;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  context.clearRect(0, 0, width, height);
  context.beginPath();
  const offset = reduceMotion ? 0 : time * .065;
  for (let x = 0; x <= width; x += 2) {
    const y = height * .47 - signalAt(x, offset) * Math.min(1.45, width / 950);
    if (x === 0) context.moveTo(x, y);
    else context.lineTo(x, y);
  }
  context.strokeStyle = 'rgba(217,137,161,.78)';
  context.lineWidth = 2;
  context.shadowBlur = 14;
  context.shadowColor = 'rgba(217,137,161,.42)';
  context.stroke();
  context.shadowBlur = 0;
  if (!reduceMotion) animationFrame = requestAnimationFrame(drawSignal);
}

resizeCanvas();
drawSignal();
window.addEventListener('resize', () => {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();
  drawSignal();
});
