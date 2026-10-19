const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Um único botão de WhatsApp, compartilhado por todas as páginas.
const whatsappIcon = '<svg class="whatsapp-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.85 11.85 0 0 0 12.06 0C5.48 0 .12 5.35.12 11.93c0 2.1.55 4.15 1.6 5.95L.02 24l6.26-1.64a11.94 11.94 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.18-3.48-8.42ZM12.06 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.38a9.88 9.88 0 0 1-1.51-5.25c0-5.47 4.44-9.91 9.91-9.91a9.84 9.84 0 0 1 7.01 2.91 9.85 9.85 0 0 1 2.9 7.01c0 5.47-4.45 9.91-9.94 9.91Zm5.44-7.42c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.8-1.49-1.78-1.66-2.08-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49 0 1.47 1.07 2.89 1.22 3.09.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.11.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.29.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg>';
$$('.wa-float, .quote-float').forEach(button => button.remove());
const whatsappFloat = document.createElement('a');
whatsappFloat.className = 'whatsapp-float';
whatsappFloat.href = 'https://wa.me/5541999760382?text=' + encodeURIComponent('Olá, Unika Print! Gostaria de solicitar um orçamento.');
whatsappFloat.target = '_blank';
whatsappFloat.rel = 'noopener';
whatsappFloat.setAttribute('aria-label', 'Falar com a Unika Print pelo WhatsApp (abre em nova aba)');
whatsappFloat.innerHTML = whatsappIcon + '<span>Fale pelo WhatsApp</span>';
document.body.append(whatsappFloat);
$$('a.btn[href*="wa.me"], a.mobile-quote-btn[href*="wa.me"]').forEach(button => {
  button.classList.add('whatsapp-button');
  button.insertAdjacentHTML('afterbegin', whatsappIcon);
});

// Header ao rolar
const header = $('.site-header');
const nav = $('.nav');
const toggle = $('.mobile-toggle');

function syncHeader() {
  if (header) header.classList.toggle('scrolled', window.scrollY > 18);
}

syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

// Menu mobile
if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  $$('.nav a').forEach(link => {
    link.addEventListener('click', () => nav.classList.remove('open'));
  });
}

// Animações leves de entrada
let revealObserver = null;
if ('IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
}

$$('.reveal').forEach(element => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add('visible');
});

// Imagens locais da Unika Print.
// Tenta automaticamente JPG, JPEG, PNG e WEBP, inclusive se o Windows estiver ocultando a extensão.
function loadLocalImage(img) {
  const base = img.dataset.localBase;
  if (!base) return;

  const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.JPG', '.JPEG', '.PNG', '.WEBP'];
  let index = 0;

  function tryNext() {
    if (index >= extensions.length) {
      img.removeAttribute('src');
      img.classList.add('image-not-found');
      console.warn('Imagem não localizada:', base);
      return;
    }

    img.src = base + extensions[index];
    index += 1;
  }

  img.addEventListener('error', tryNext);

  // Se o primeiro .jpg já falhou antes do JS terminar de carregar,
  // inicia novamente a sequência de tentativas.
  if (img.complete && img.naturalWidth === 0) {
    index = 1;
    tryNext();
  }
}

$$('img[data-local-base]').forEach(loadLocalImage);

// Modal do portfólio
const modal = $('#portfolioModal');
if (modal) {
  const modalImg = $('img', modal);
  const closeButton = $('.modal-close', modal);

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  $$('.portfolio-item').forEach(item => {
    item.addEventListener('click', () => {
      const image = $('img', item);
      if (!image || !image.src) return;

      modalImg.src = image.currentSrc || image.src;
      modalImg.alt = image.alt || 'Projeto Unika Print';
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (closeButton) closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });
}

// Formulário -> WhatsApp
const form = $('#contactForm');
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();

    const data = new FormData(form);
    const message = [
      'Olá, Unika Print! Gostaria de solicitar um orçamento.',
      '',
      'Nome: ' + (data.get('nome') || ''),
      'Empresa: ' + (data.get('empresa') || ''),
      'Telefone: ' + (data.get('telefone') || ''),
      'E-mail: ' + (data.get('email') || ''),
      'Serviço: ' + (data.get('servico') || ''),
      '',
      'Mensagem: ' + (data.get('mensagem') || '')
    ].join('\n');

    window.open(
      'https://wa.me/5541999760382?text=' + encodeURIComponent(message),
      '_blank',
      'noopener'
    );
  });
}
