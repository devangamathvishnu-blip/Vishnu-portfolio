const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const header = $('.header');
const progress = $('.page-progress i');
const menuButton = $('.menu-toggle');
const menu = $('.nav-menu');
const navLinks = $$('.nav-menu a');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer:fine)').matches;

function onScroll() {
  header.classList.toggle('scrolled', scrollY > 18);
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.height = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  if (!reduceMotion) {
    document.documentElement.style.setProperty('--scroll-y', `${scrollY}px`);
  }
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

menuButton.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
navLinks.forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -40px' });
$$('.reveal').forEach(el => revealObserver.observe(el));

const sections = $$('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%' });
sections.forEach(section => sectionObserver.observe(section));

if (!reduceMotion && finePointer) {
  $$('.tilt-card').forEach(card => {
    const strength = Number(card.dataset.tiltStrength || 5);
    let raf;
    card.addEventListener('pointermove', event => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - .5;
      const y = (event.clientY - rect.top) / rect.height - .5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        card.style.transform = `perspective(1200px) rotateX(${-y * strength}deg) rotateY(${x * strength}deg) translateZ(0)`;
        const reflection = $('.card-reflection', card);
        if (reflection) reflection.style.transform = `translateX(${x * 80 - 30}%) rotate(3deg)`;
        $$('[data-depth]', card).forEach(layer => {
          const d = Number(layer.dataset.depth);
          layer.style.transform = `translate3d(${x * d * 8}px, ${y * d * 8}px, ${d * 17}px)`;
        });
      });
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      const reflection = $('.card-reflection', card);
      if (reflection) reflection.style.transform = '';
      $$('[data-depth]', card).forEach(layer => layer.style.transform = '');
    });
  });

  const stage = $('.identity-stage');
  stage.addEventListener('pointermove', event => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5;
    const y = (event.clientY - rect.top) / rect.height - .5;
    $('.circuit-map').style.transform = `translate(${x * 7}px, ${y * 7}px)`;
    $$('.node', stage).forEach((node, i) => node.style.transform = `translate(${x * (i % 2 ? 5 : -5)}px, ${y * 5}px)`);
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) {
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.focus();
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
