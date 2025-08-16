document.addEventListener('DOMContentLoaded', () => {
  AOS.init({ duration: 800, once: true, easing: 'ease-out-cubic' });

  // GSAP entrance animations
  gsap.from('.hero-headline', { y: 24, opacity: 0, duration: 0.9 });
  gsap.from('.hero-sub', { y: 24, opacity: 0, delay: 0.2, duration: 0.9 });
  gsap.from('.hero-cta', { y: 24, opacity: 0, delay: 0.35, duration: 0.9 });

  // Mobile nav toggle
  const btn = document.querySelector('#menuBtn');
  const menu = document.querySelector('#mobileMenu');
  if (btn && menu) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
});
