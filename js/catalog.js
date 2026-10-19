const productNav = document.querySelector('.product-nav');
const productMenus = [...document.querySelectorAll('.product-menu')];
const categoryToggle = document.querySelector('.catalog-header .mobile-toggle');
productMenus.forEach(menu => {
  if (location.pathname.endsWith('/' + menu.dataset.group + '.html')) menu.classList.add('current');
});
function closeProductMenus() { productMenus.forEach(menu => menu.open = false); }
productMenus.forEach(menu => {
  menu.querySelector('summary').addEventListener('click', () => {
    productMenus.forEach(other => { if (other !== menu) other.open = false; });
  });
});
categoryToggle?.addEventListener('click', () => {
  const open = productNav.classList.toggle('open');
  categoryToggle.setAttribute('aria-expanded', String(open));
  categoryToggle.setAttribute('aria-label', open ? 'Fechar categorias' : 'Abrir categorias');
  if (!open) closeProductMenus();
});
document.addEventListener('click', event => {
  if (!event.target.closest('.product-menu')) closeProductMenus();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    const active = productMenus.find(menu => menu.open);
    closeProductMenus();
    if (active) active.querySelector('summary').focus();
    else if (productNav?.classList.contains('open')) {
      productNav.classList.remove('open');
      categoryToggle.setAttribute('aria-expanded', 'false');
      categoryToggle.focus();
    }
  }
});
