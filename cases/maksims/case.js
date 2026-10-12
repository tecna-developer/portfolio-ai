(() => {
  const embedded = new URLSearchParams(location.search).has('embed');
  document.documentElement.classList.toggle('embedded', embedded);
  const slides = [...document.querySelectorAll('.case-slide')];
  const track = document.querySelector('.case-track');
  const prev = document.querySelector('.case-prev');
  const next = document.querySelector('.case-next');
  const status = document.querySelector('.case-status');
  const dots = document.querySelector('.case-dots');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const requested = Number(new URLSearchParams(location.search).get('slide'));
  let current = Number.isInteger(requested) && requested >= 1 && requested <= slides.length ? requested - 1 : 0;
  const languages = [...document.querySelectorAll('.case-language a')];
  if (embedded) {
    const english = document.documentElement.lang === 'en';
    document.querySelectorAll('.case-slide img').forEach(img => {
      let link = img.closest('a');
      if (!link) {
        link = document.createElement('a');
        img.before(link);
        link.append(img);
      }
      link.href = img.src;
      link.target = '_blank';
      link.rel = 'noopener';
      link.classList.add('case-image-link');
      link.setAttribute('aria-label', (english ? 'Open full-size screenshot: ' : 'Открыть скриншот в полном размере: ') + img.alt);
    });
    const hint = document.createElement('p');
    hint.className = 'preview-hint';
    hint.textContent = english ? 'Select a screenshot to view it full size ↗' : 'Нажмите на скриншот, чтобы открыть полный размер ↗';
    document.querySelector('.case-carousel').append(hint);
  }
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', slide.getAttribute('aria-label'));
    button.addEventListener('click', () => go(index));
    dots.append(button);
    return button;
  });
  function resize() {
    track.style.height = `${Math.ceil(slides[current].getBoundingClientRect().height)}px`;
    if (embedded) parent.postMessage({type: 'maksims-case-height', height: document.body.scrollHeight}, location.origin);
  }
  function update() {
    current = Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
    prev.disabled = current === 0;
    next.disabled = current === slides.length - 1;
    status.textContent = `${current + 1} / ${slides.length}`;
    buttons.forEach((button, i) => button.setAttribute('aria-current', String(i === current)));
    slides.forEach((slide, i) => { slide.inert = i !== current; });
    languages.forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('slide', current + 1);
      if (embedded) url.searchParams.set('embed', '1');
      link.href = url.href;
    });
    resize();
  }
  function go(index) {
    track.scrollTo({left: Math.max(0, Math.min(slides.length - 1, index)) * track.clientWidth, behavior: reduce.matches ? 'instant' : 'smooth'});
  }
  prev.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  track.addEventListener('scroll', update, {passive: true});
  track.addEventListener('scrollend', () => {
    if (Math.abs(track.scrollLeft - current * track.clientWidth) > 1) go(current);
  });
  track.addEventListener('keydown', (event) => {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      go(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : current + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  let width = track.clientWidth;
  new ResizeObserver(() => {
    if (width !== track.clientWidth) {
      width = track.clientWidth;
      track.scrollTo({left: current * width, behavior: 'instant'});
    }
    resize();
  }).observe(document.querySelector('.case-carousel'));
  const observer = new ResizeObserver(resize);
  slides.forEach(slide => observer.observe(slide));
  update();
  async function restoreSlide() {
    await document.fonts.ready;
    const index = Number.isInteger(requested) && requested >= 1 && requested <= slides.length ? requested - 1 : 0;
    track.style.scrollSnapType = 'none';
    current = index;
    resize();
    await new Promise(requestAnimationFrame);
    track.scrollTo({left: index * track.clientWidth, behavior: 'instant'});
    update();
    await new Promise(requestAnimationFrame);
    track.style.scrollSnapType = 'none';
  }
  if (document.readyState === 'complete') restoreSlide();
  else window.addEventListener('load', restoreSlide, {once: true});
})();

