const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

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

    form.reset();

    const popupMessage = 'Sua MSG foi enviada, agora envie imagens direto ao Contato de WhatsApp da loja.';
    window.alert(popupMessage);

    window.open(
      'https://wa.me/5541999760382?text=' + encodeURIComponent(message),
      '_blank',
      'noopener'
    );
  });
}
