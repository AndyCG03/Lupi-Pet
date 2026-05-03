// ════════════════════════════════════
//  LUPI PET — main.js
// ════════════════════════════════════

// Mobile nav
function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  if (!links) return;
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  links.style.flexDirection = 'column';
  links.style.position = 'fixed';
  links.style.top = '68px';
  links.style.left = '0';
  links.style.right = '0';
  links.style.background = 'var(--cream)';
  links.style.padding = '20px 5%';
  links.style.borderBottom = '2px solid var(--border)';
  links.style.zIndex = '999';
}

// Contact form → WhatsApp
function sendContactForm(e) {
  e.preventDefault();
  const name = document.getElementById('cName')?.value || '';
  const pet  = document.getElementById('cPet')?.value  || '';
  const msg  = document.getElementById('cMsg')?.value  || '';

  const petLabel = pet === 'perro' ? '🐶 Perro' : pet === 'gato' ? '🐱 Gato' : '🐾 Perro y Gato';
  const text = `¡Hola Lupi Pet! 🐾\n\n👤 Nombre: ${name}\n🐾 Mascota: ${petLabel}\n\n📝 Mensaje:\n${msg}`;
  const url = `https://wa.me/5215512345678?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

// Scroll reveal (simple)
const observer = new IntersectionObserver((entries) => {
  entries.forEach(el => {
    if (el.isIntersecting) {
      el.target.style.opacity = '1';
      el.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.product-card, .blog-card, .category-card, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  observer.observe(el);
});
