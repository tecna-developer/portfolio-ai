(() => {
  const frame = document.getElementById('maksims-case');
  if (!frame) return;
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.source !== frame.contentWindow) return;
    if (event.data?.type !== 'maksims-case-height') return;
    const height = event.data.height;
    if (Number.isFinite(height) && height >= 200 && height <= 4000) {
      frame.style.height = `${Math.ceil(height)}px`;
    }
  });
})();
