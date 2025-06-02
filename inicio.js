// === Scroll animado a secciones con efecto suave ===
document.querySelectorAll('a[href^="#"]').forEach(enlace => {
  enlace.addEventListener('click', function(e) {
    e.preventDefault();
    const objetivo = document.querySelector(this.getAttribute('href'));
    if (objetivo) {
      objetivo.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// === Validación del formulario de contacto ===
document.querySelector('form').addEventListener('submit', function(e) {
  e.preventDefault();

  const nombre = this.querySelector('input[type="text"]').value.trim();
  const correo = this.querySelector('input[type="email"]').value.trim();
  const mensaje = this.querySelector('textarea').value.trim();

  if (!nombre || !correo || !mensaje) {
    alert('Por favor, completa todos los campos antes de enviar.');
    return;
  }

  // Simulación de envío (puedes conectar a Supabase o backend más adelante)
  alert('Gracias por tu mensaje. ¡Nos pondremos en contacto pronto!');

  // Limpiar formulario
  this.reset();
});
