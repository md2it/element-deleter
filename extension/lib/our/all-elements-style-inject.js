function setAllElementsStyleAtEnd(styleId, css) {
  const existing = document.getElementById(styleId);
  if (existing instanceof HTMLStyleElement) {
    existing.textContent = css;
    return;
  }
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = css;
  const anchor = document.body ?? document.documentElement;
  anchor.appendChild(style);
}
function removeAllElementsStyle(styleId) {
  document.getElementById(styleId)?.remove();
}

export { setAllElementsStyleAtEnd, removeAllElementsStyle };
