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

document.querySelectorAll('a[href="#top"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  });
});

const contactForm = document.querySelector('[data-contact-form]');
contactForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const status = contactForm.querySelector('.form-status');
  const payload = Object.fromEntries(new FormData(contactForm).entries());
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12000);

  submitButton.disabled = true;
  contactForm.setAttribute('aria-busy', 'true');
  status.className = 'form-status';
  status.textContent = contactForm.dataset.sending;

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const result = await response.json().catch(() => ({}));
    const succeeded = result.success === true || result.success === 'true';

    if (!response.ok || !succeeded) throw new Error('Submission failed');

    contactForm.reset();
    status.classList.add('success');
    status.textContent = contactForm.dataset.success;
  } catch (error) {
    status.classList.add('error');
    status.textContent = contactForm.dataset.error;
  } finally {
    window.clearTimeout(timeout);
    submitButton.disabled = false;
    contactForm.removeAttribute('aria-busy');
  }
});

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
