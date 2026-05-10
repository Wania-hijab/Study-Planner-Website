
console.log("Portfolio Loaded Successfully");
// Reveal on scroll
const toReveal = document.querySelectorAll('.section, .hero-card-wrap, .hero-content');
toReveal.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
toReveal.forEach(el => io.observe(el));

// Subtle parallax on hero card
const heroCard = document.querySelector('.hero-card-wrap');
if (heroCard && window.matchMedia('(min-width: 880px)').matches) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 12;
    const y = (e.clientY / window.innerHeight - 0.5) * 12;
    heroCard.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// Active nav highlight
const links = document.querySelectorAll('.nav-links a');
const sections = [...links].map(a => document.querySelector(a.getAttribute('href')));
window.addEventListener('scroll', () => {
  const y = window.scrollY + 120;
  let active = 0;
  sections.forEach((s, i) => { if (s && s.offsetTop <= y) active = i; });
  links.forEach((l, i) => l.style.color = i === active ? 'var(--fg)' : '');
});
