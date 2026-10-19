(() => {
  const cards = [...document.querySelectorAll('[data-gallery]')];
  if (!cards.length) return;
  let galleries = window.UNIKA_GALERIAS || {};
  const dialog = document.createElement('dialog');
  dialog.className = 'service-gallery';
  dialog.setAttribute('aria-labelledby', 'gallery-title');
  dialog.innerHTML = '<div class="gallery-top"><div><h2 id="gallery-title"></h2><p class="gallery-position" aria-live="polite"></p></div><button class="gallery-close" aria-label="Fechar galeria">×</button></div><div class="gallery-stage"><button class="gallery-prev" aria-label="Foto anterior">‹</button><img class="gallery-image" alt=""><button class="gallery-next" aria-label="Próxima foto">›</button></div><p class="gallery-help">Use as setas para ver mais fotos · Esc para fechar</p>';
  document.body.append(dialog);
  const image = dialog.querySelector('.gallery-image');
  const position = dialog.querySelector('.gallery-position');
  const prev = dialog.querySelector('.gallery-prev');
  const next = dialog.querySelector('.gallery-next');
  let photos = [], index = 0, title = '', opener = null, previousOverflow = '';
  const imageURL = path => path.split('/').map(encodeURIComponent).join('/');

  function show(offset = 0) {
    index = (index + offset + photos.length) % photos.length;
    image.src = imageURL(photos[index]);
    image.alt = title + ' — foto ' + (index + 1);
    position.textContent = (index + 1) + ' de ' + photos.length + (photos.length === 1 ? ' foto' : ' fotos');
    prev.hidden = next.hidden = photos.length < 2;
    dialog.querySelector('.gallery-help').textContent = photos.length > 1 ? 'Use as setas ou deslize para ver mais fotos · Esc para fechar' : 'Esc para fechar';
  }
  function close() { dialog.close(); }
  dialog.querySelector('.gallery-close').addEventListener('click', close);
  dialog.addEventListener('close', () => {
    document.body.style.overflow = previousOverflow;
    image.removeAttribute('src');
    opener?.focus();
  });
  dialog.addEventListener('click', event => { if (event.target === dialog) close(); });
  prev.addEventListener('click', () => show(-1));
  next.addEventListener('click', () => show(1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  let startX = null;
  image.addEventListener('touchstart', event => { startX = event.changedTouches[0].clientX; }, { passive: true });
  image.addEventListener('touchend', event => {
    if (startX !== null) {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 45 && photos.length > 1) show(delta < 0 ? 1 : -1);
      startX = null;
    }
  }, { passive: true });
  image.addEventListener('error', () => { position.textContent = 'Não foi possível abrir esta foto. Tente outra imagem.'; });

  function hydrate() {
    cards.forEach(card => {
      const list = galleries[card.dataset.gallery] || [];
      const button = card.querySelector('.gallery-cover');
      const name = card.querySelector('h2').textContent;
      if (!list.length) {
        button.disabled = true;
        button.querySelector('img')?.remove();
        if (!button.querySelector('.product-placeholder')) {
          const placeholder = document.createElement('span');
          placeholder.className = 'product-placeholder';
          const label = document.createElement('span');
          label.textContent = name;
          const note = document.createElement('small');
          note.textContent = 'Produção personalizada · Consulte possibilidades';
          placeholder.append(label, note);
          button.prepend(placeholder);
        }
        button.querySelector('.gallery-hint').textContent = 'Fotos em breve';
        return;
      }
      button.disabled = false;
      let cover = button.querySelector('img');
      if (!cover) {
        cover = document.createElement('img');
        cover.loading = 'lazy';
        button.querySelector('.product-placeholder')?.remove();
        button.prepend(cover);
      }
      cover.src = imageURL(list[0]);
      cover.alt = name + ' — projeto Unika Print';
      button.querySelector('.gallery-hint').textContent = '⤢ Ampliar · ' + list.length + (list.length === 1 ? ' foto' : ' fotos') + ' ↗';
      button.setAttribute('aria-label', 'Abrir galeria de ' + name + ', ' + list.length + ' fotos');
    });
  }
  cards.forEach(card => {
    card.querySelector('.gallery-cover').addEventListener('click', event => {
      photos = galleries[card.dataset.gallery] || [];
      if (!photos.length) return;
      opener = event.currentTarget;
      title = card.querySelector('h2').textContent;
      dialog.querySelector('h2').textContent = title;
      index = 0;
      show();
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      dialog.showModal();
    });
  });
  hydrate();
  // Static hosting uses the generated index. PHP/local preview reads the folders.
  if (location.protocol !== 'file:') {
    fetch('galerias.php', { cache: 'no-store' })
      .then(response => { if (!response.ok) throw new Error('Static hosting'); return response.json(); })
      .then(data => {
        if (data && !Array.isArray(data) && typeof data === 'object') {
          galleries = data;
          hydrate();
        }
      })
      .catch(() => { /* The static index remains available. */ });
  }
})();
