const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Nav: solid background once the hero scrolls away, mobile menu toggle
const nav = document.getElementById('nav');
const toggle = nav.querySelector('.nav-toggle');
const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 40);
addEventListener('scroll', onScroll, { passive: true });
onScroll();

function setMenu(open) {
  nav.classList.toggle('menu-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  document.body.style.overflow = open ? 'hidden' : '';
}
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('menu-open')));
nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Hero carousel (home page only)
const SLIDE_MS = 8000;
const slides = [...document.querySelectorAll('.hero-slide')];
const heroImgs = [...document.querySelectorAll('.hero-img')];
const tabs = [...document.querySelectorAll('.hero-tabs button')];
const tabList = document.querySelector('.hero-tabs');
let current = 0;
let timer;
if (tabList) initCarousel();

function initCarousel() {
  tabList.style.setProperty('--slide-ms', SLIDE_MS + 'ms');
  tabs.forEach(t => t.addEventListener('click', () => { stop(); show(+t.dataset.go); }));
  if (reduceMotion) return;
  tabList.classList.add('is-playing');
  timer = setInterval(() => {
    if (document.hidden) return;
    show(current + 1);
    // restart the progress-bar animation
    tabList.classList.remove('is-playing');
    void tabList.offsetWidth;
    tabList.classList.add('is-playing');
  }, SLIDE_MS);
  document.querySelector('.hero-slides').addEventListener('focusin', stop, { once: true });
}
function show(i) {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, n) => {
    const on = n === current;
    s.classList.toggle('is-active', on);
    s.setAttribute('aria-hidden', String(!on));
    s.inert = !on;
  });
  tabs.forEach((t, n) => t.setAttribute('aria-selected', String(n === current)));
  heroImgs.forEach(img => img.classList.toggle('is-active', +img.dataset.slide === current));
}
function stop() {
  clearInterval(timer);
  tabList.classList.remove('is-playing');
}

// Scroll reveals
const reveals = document.querySelectorAll('.reveal');
if (!reduceMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion');
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(el => {
    const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 80}ms`);
    io.observe(el);
  });
}

// Interest form (preview only)
document.querySelector('.interest-form')?.addEventListener('submit', e => {
  e.preventDefault();
  const n = e.target.querySelectorAll('input:checked').length;
  e.target.querySelector('.form-feedback').textContent = n
    ? `Thank you! You chose ${n} topic${n === 1 ? '' : 's'}. (Preview only: nothing was sent.)`
    : 'Choose at least one topic first.';
});

// Preview dialog for actions that aren't wired up yet
const dialog = document.getElementById('preview-dialog');
document.querySelectorAll('[data-preview]').forEach(btn => btn.addEventListener('click', () => {
  if (!dialog) return;
  dialog.querySelector('.dialog-title').textContent = btn.dataset.preview;
  dialog.showModal();
}));
