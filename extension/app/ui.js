"use strict";
var ROOT_ID = "element-deleter-root";
var HOST_ATTR = "data-element-deleter-ui";
var DeleterUI = class {
  host;
  shadow;
  notificationSeconds = 4;
  locale = "en";
  selectionCaptionStyle = "click-to-delete";
  elementActionInFlight = false;
  onDeactivate;
  toast;
  highlight;
  restore;
  onElementDeleted;
  onElementRestored;
  boundClick;
  constructor(onDeactivate, options) {
    this.onDeactivate = onDeactivate;
    this.onElementDeleted = options.onElementDeleted;
    this.onElementRestored = options.onElementRestored;
    this.boundClick = (e) => this.handleClick(e);
    const existing = document.getElementById(ROOT_ID);
    if (existing) {
      this.host = existing;
      this.shadow =
        existing.shadowRoot ?? existing.attachShadow({ mode: "open" });
    } else {
      this.host = document.createElement("div");
      this.host.id = ROOT_ID;
      this.host.setAttribute(HOST_ATTR, "true");
      this.host.style.cssText =
        "position:fixed;inset:0;z-index:2147483645;pointer-events:none;";
      document.documentElement.appendChild(this.host);
      this.shadow = this.host.attachShadow({ mode: "open" });
    }
    let style = this.shadow.querySelector("style");
    if (!style) {
      style = document.createElement("style");
      this.shadow.appendChild(style);
    }
    style.textContent = `.dd-panel-header {
  flex: 0 0 auto;
  padding: 1.125rem 1.125rem 0;
}

.dd-panel-divider {
  flex: 0 0 auto;
  width: 90%;
  height: 1px;
  margin-inline: auto;
  background: #b91c1c;
}

.dd-panel-title-row {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-areas: "stack";
  align-items: center;
}

.dd-panel-logo,
.dd-panel-heading {
  grid-area: stack;
}

.dd-panel-logo {
  display: flex;
  align-items: stretch;
  align-self: stretch;
  justify-self: start;
  line-height: 0;
  z-index: 1;
}

.dd-panel-logo svg {
  display: block;
  height: 100%;
  width: auto;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.dd-panel-heading {
  justify-self: center;
  align-self: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.12rem;
  min-width: 0;
  max-width: 100%;
  font-size: 0.82rem;
}

.dd-panel-title {
  margin: 0;
  font-size: inherit;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-align: center;
  text-transform: uppercase;
  color: #012292;
}

.dd-panel-subtitle {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  line-height: 1.2;
  white-space: nowrap;
  text-align: center;
  color: #666666;
}

:host(.dd-panel-popup) {
  display: flex;
  flex-direction: column;
  position: relative;
  inset: auto;
  width: 100%;
  min-height: 500px;
  height: auto;
  pointer-events: auto;
  z-index: 1;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  color: #1f2937;
}

:host(.dd-panel-popup) *,
:host(.dd-panel-popup) *::before,
:host(.dd-panel-popup) *::after {
  box-sizing: border-box;
}

:host(.dd-panel-popup) button:focus:not(:focus-visible),
:host(.dd-panel-popup) a:focus:not(:focus-visible) {
  outline: none;
}

:host(.dd-panel-popup) button:focus-visible,
:host(.dd-panel-popup) a:focus-visible,
:host(.dd-panel-popup) input:focus-visible {
  outline: 2px solid #b91c1c;
}

.dd-panel {
  display: flex;
  flex-direction: column;
  width: min(21rem, calc(100vw - 2rem));
  max-height: calc(100dvh - 2rem);
  overflow: hidden;
  color: #1f2937;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px) saturate(1.35);
  -webkit-backdrop-filter: blur(20px) saturate(1.35);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 18px 48px rgba(185, 28, 28, 0.16),
    0 8px 24px rgba(0, 0, 0, 0.22);
}

.dd-panel--surface-popup {
  flex: 1 1 auto;
  width: 100%;
  min-height: 500px;
  max-height: none;
  border-radius: 0;
  border: none;
  box-shadow: none;
}

.dd-panel-main {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.dd-panel--surface-popup > .dd-panel-main {
  align-items: stretch;
  direction: ltr;
}

.dd-panel-menu {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin: 0.75rem 0 0.75rem 0.75rem;
  padding: 0.35rem;
  border-radius: 0.5rem;
  background: rgba(185, 28, 28, 0.06);
}

.dd-panel--surface-popup .dd-panel-menu {
  --dd-menu-gap: 0.3rem;
  flex: 0 0 2.85rem;
  width: 2.85rem;
  align-self: stretch;
  justify-content: flex-start;
  gap: var(--dd-menu-gap);
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  margin-inline-start: 0.5rem;
  margin-inline-end: 0.3rem;
  padding-block-start: var(--dd-menu-gap);
  padding-inline-end: var(--dd-menu-gap);
  padding-block-end: var(--dd-menu-gap);
  padding-inline-start: var(--dd-menu-gap);
}

.dd-panel-content {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dd-panel--surface-popup .dd-panel-content {
  flex: 1 1 0;
  min-width: 0;
}

.dd-panel[dir="rtl"] .dd-panel-content {
  direction: rtl;
}

.dd-panel-menu-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: 0.4rem;
  background: transparent;
  color: #4b5563;
  cursor: pointer;
}

.dd-panel-menu-btn svg {
  display: block;
  width: 1.15rem;
  height: 1.15rem;
}

.dd-panel-menu-btn:hover,
.dd-panel-menu-btn:focus-visible {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.08);
}

.dd-panel-menu-btn--active {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.14);
}

.dd-panel-menu-btn::after {
  content: attr(data-tooltip);
  position: absolute;
  left: calc(100% + 0.45rem);
  top: 50%;
  z-index: 2;
  transform: translateY(-50%);
  padding: 0.28rem 0.5rem;
  border-radius: 0.35rem;
  background: #111827;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0s ease,
    visibility 0s linear 0s;
}

.dd-panel-menu-btn:hover::after,
.dd-panel-menu-btn:focus-visible::after {
  opacity: 1;
  visibility: visible;
}

.dd-panel-page {
  margin: 0;
}

.dd-panel-page-title {
  margin: 0 0 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #111827;
}

.dd-panel--surface-popup .dd-panel-page-title {
  text-align: center;
}

.dd-panel-page-divider {
  width: 100%;
  margin: 0 0 0.5rem;
}

.dd-panel--surface-popup .dd-panel-body {
  flex: 1 1 auto;
  overflow: visible;
  padding: 1rem 0.95rem;
}

.dd-panel--surface-popup .dd-panel-page--settings {
  text-align: center;
}

.dd-panel--surface-popup > .dd-panel-main > .dd-panel-content > .dd-panel-body:has(.dd-panel-page--about) {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.dd-panel-page--about {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  flex: 1 1 auto;
  min-height: 560px;
  width: 100%;
}

.dd-panel-page--about .dd-panel-page-title {
  width: 100%;
  text-align: center;
}

.dd-about-credit {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding-top: 0.75rem;
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.dd-about-credit-divider {
  width: 100%;
  margin: 0 0 0.5rem;
}

.dd-about-credit-line {
  margin: 0;
  line-height: 1.35;
}

.dd-panel-page--shortcuts {
  width: 100%;
}

.dd-shortcuts-heading {
  margin: 0.5rem 0 0;
  font-size: 0.84rem;
  line-height: 1.45;
  font-weight: 700;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-undo-block {
  margin: 0;
}

.dd-shortcuts-undo-row {
  margin: 0.12rem 0 0;
  padding-left: 1.15rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-safety {
  display: flex;
  flex-direction: column;
  gap: 0.05rem;
  margin-top: 0.85rem;
}

.dd-shortcuts-note {
  margin: 0;
  font-size: 0.84rem;
  line-height: 1.2;
  color: #6b7280;
  text-align: left;
}

.dd-shortcuts-step-release-bold {
  font-weight: 600;
}

.dd-shortcuts-divider {
  margin: 0.55rem 0 0.35rem;
}

.dd-shortcuts-steps {
  margin: 0.2rem 0 0.35rem;
  padding-left: 1.15rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-shortcuts-steps li {
  margin-bottom: 0.2rem;
}

.dd-shortcuts-steps li:last-child {
  margin-bottom: 0;
}

.dd-shortcuts-step-press-grid {
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: 0.35em;
  align-items: start;
}

.dd-shortcuts-step-press-label {
  grid-column: 1;
  grid-row: 1;
}

.dd-shortcuts-step-press-chords {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
}

.dd-shortcuts-step-press-mac-label {
  grid-column: 1;
  grid-row: 2;
}

.dd-shortcuts-step-press-mac-chords {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
}

.dd-about-icon {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  line-height: 0;
  color: #6b7280;
}

.dd-about-icon svg {
  display: block;
  width: 1rem;
  height: 1rem;
}

.dd-about-kbd {
  display: inline-block;
  padding: 0.08rem 0.35rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: #f9fafb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.8em;
  font-weight: 600;
  line-height: 1.3;
  color: #111827;
}

.dd-panel--surface-popup .dd-about-list {
  width: 100%;
  max-width: 100%;
  margin: 0 0 0.85rem;
}

.dd-panel-tabs {
  flex: 0 0 auto;
  padding: 1.125rem 1.125rem 0;
}

.dd-tab-group {
  display: flex;
  gap: 0.35rem;
  min-width: 0;
}

.dd-chip {
  border: 1px solid rgba(0, 0, 0, 0.07);
  background: #fff;
  color: #1f2937;
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.dd-chip.is-active {
  background: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
  box-shadow: none;
}

.dd-chip.is-active:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
}

.dd-chip:not(.is-active):hover,
.dd-chip:not(.is-active):focus-visible {
  color: #b91c1c;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.06), 0 0 14px rgba(0, 0, 0, 0.09);
}

.dd-lang-btn.is-active:hover,
.dd-lang-btn.is-active:focus-visible {
  color: #fff;
}

.dd-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.5rem;
  border-radius: 0.45rem 0.45rem 0 0;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1;
  letter-spacing: 0.04em;
  white-space: nowrap;
  text-align: center;
}

.dd-panel:lang(zh-CN) .dd-tab {
  letter-spacing: normal;
}

.dd-tab:not(.is-active) {
  border: 1px solid transparent;
  background: transparent;
  box-shadow: none;
  color: #b91c1c;
}

.dd-tab:not(.is-active):focus-visible {
  outline: 2px solid #b91c1c;
  outline-offset: 2px;
}

.dd-panel-body {
  display: grid;
  flex: 1 1 auto;
  min-height: var(--dd-panel-body-min, 0);
  overflow-y: auto;
  padding: 0 1.125rem;
}

.dd-panel:not(.dd-panel--surface-popup) .dd-panel-body {
  display: grid;
}

.dd-panel--surface-popup > .dd-panel-main > .dd-panel-content > .dd-panel-body {
  display: block;
  min-height: var(--dd-panel-body-min, 0);
}

.dd-tab-panel {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  visibility: hidden;
  pointer-events: none;
  min-width: 0;
  min-height: 100%;
  padding-block: 1.125rem;
}

.dd-tab-panel.is-active {
  visibility: visible;
  pointer-events: auto;
}

.dd-tab-panel.is-settings {
  text-align: center;
  align-items: stretch;
}

.dd-tab-panel.is-about {
  align-items: center;
}

.dd-panel-body p {
  margin: 0 0 0.55rem;
  font-size: 0.84rem;
  line-height: 1.45;
  color: #374151;
  text-align: left;
}

.dd-about-list {
  list-style: none;
  width: fit-content;
  max-width: 100%;
  margin: 0;
  padding: 0;
}

.dd-about-section {
  width: 100%;
  margin: 0 0 0.35rem;
}

.dd-about-section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.1rem;
  font-size: 0.8rem;
  line-height: 1.25;
  color: #111827;
}

.dd-about-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 0.12rem;
  font-size: 0.8rem;
  line-height: 1.25;
  color: #111827;
  text-align: left;
}

.dd-about-item:last-child {
  margin-bottom: 0;
}

.dd-panel-page--about .dd-about-section-title,
.dd-panel-page--about .dd-about-item,
.dd-panel-page--about .dd-about-icon,
.dd-panel-page--about .dd-about-text,
.dd-panel-page--about .dd-about-text:any-link,
.dd-panel-page--about .dd-panel-page-title,
.dd-panel-page--about .dd-about-credit,
.dd-panel-page--about .dd-about-credit a:any-link {
  color: #111827;
}

.dd-panel-page--about .dd-about-text:any-link {
  text-decoration: underline;
}

.dd-about-item .dd-about-icon,
.dd-about-item .dd-about-icon svg {
  width: 0.75rem;
  height: 0.75rem;
}

.dd-about-item .dd-about-icon {
  align-self: flex-start;
  margin-top: 0.12rem;
}

.dd-about-bool {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  line-height: 0;
  color: #6b7280;
}

.dd-about-bool svg {
  display: block;
  width: 1rem;
  height: 1rem;
}

.dd-panel-body a {
  color: #b91c1c;
  text-decoration: none;
}

.dd-panel-body a:hover,
.dd-panel-body a:focus-visible {
  text-decoration: underline;
}

.dd-panel-body a:focus-visible {
  outline: none;
}

/* ABOUT credit: beats .dd-panel-body p / a on <p> and <a> inside credit */
.dd-panel-body .dd-about-credit {
  margin-top: auto;
  margin-inline: 0;
  margin-bottom: 0;
  font-size: 0.75rem;
  line-height: 1.35;
  color: #9ca3af;
  text-align: center;
}

.dd-panel-body .dd-about-credit .dd-about-credit-line {
  margin: 0;
  font-size: inherit;
  line-height: 1.35;
  color: inherit;
  text-align: center;
}

.dd-panel-body .dd-about-credit a:any-link {
  color: #9ca3af;
  text-decoration: underline;
}

.dd-panel-body .dd-about-credit a:hover,
.dd-panel-body .dd-about-credit a:focus-visible {
  color: #9ca3af;
  text-decoration: underline;
}

.dd-field {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.55rem;
  margin-top: 1.5rem;
}

.dd-field:first-of-type {
  margin-top: 0;
}

.dd-caption-style-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  column-gap: 0.75rem;
  width: 100%;
  min-width: 0;
  margin-top: 1.5rem;
}

.dd-panel-page--settings .dd-caption-style-row {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 0.75rem;
}

.dd-caption-style-label {
  flex: 1 1 50%;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #1f2937;
  text-align: start;
}

.dd-panel-page--settings .dd-caption-style-label {
  display: flex;
  align-items: center;
}

.dd-caption-style-select {
  flex: 0 0 50%;
  width: 50%;
  min-width: 0;
  padding: 0.45rem 0.55rem;
  padding-inline-end: 1.45rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 0.45rem;
  background: #fff;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.45rem center;
  background-size: 10px 6px;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  color: #1f2937;
}

.dd-caption-style-select:focus-visible {
  outline: 2px solid #012292;
  outline-offset: 1px;
}

.dd-toggle-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.5rem;
}

.dd-toggle-label {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 0.8rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #1f2937;
  text-align: start;
}

.dd-toggle-label kbd {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 0.1rem 0.35rem;
  border-radius: 0.25rem;
  background: rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(0, 0, 0, 0.07);
}

.dd-toggle {
  position: relative;
  flex: 0 0 auto;
  width: 2.5rem;
  height: 1.4rem;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
  cursor: pointer;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
}

.dd-toggle.is-on {
  background: #b91c1c;
  border-color: #b91c1c;
}

.dd-toggle::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 0.15rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #fff;
  transform: translateY(-50%);
  transition: left 0.15s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dd-toggle.is-on::after {
  left: calc(100% - 1rem - 0.15rem);
}

.dd-toggle:focus-visible {
  outline: 2px solid #b91c1c;
}

.dd-lang-row {
  display: flex;
  width: 100%;
  gap: 0.3rem;
  /* README: EN | ES | … order is fixed; panel RTL must not mirror this row. */
  direction: ltr;
}

.dd-lang-btn {
  flex: 1 1 0;
  min-width: 0;
  padding: 0.35rem 0.25rem;
  border-radius: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
}

.dd-toggle-row--notification {
  position: relative;
  justify-content: stretch;
  gap: 0;
}

.dd-toggle-row--notification .dd-number {
  flex: 1 1 auto;
  width: 100%;
}

.dd-toggle-row--notification .dd-tooltip {
  position: absolute;
  left: 50%;
  bottom: calc(100% + 0.35rem);
  z-index: 1;
  max-width: min(16rem, 100%);
  padding: 0.35rem 0.5rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.35;
  color: #fff;
  text-align: center;
  white-space: normal;
  background: rgba(0, 0, 0, 0.82);
  transform: translateX(-50%);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transition:
    opacity 0.12s ease,
    visibility 0.12s ease;
}

.dd-toggle-row--notification:hover .dd-tooltip,
.dd-toggle-row--notification:focus-within .dd-tooltip {
  opacity: 1;
  visibility: visible;
}

.dd-number {
  display: flex;
  align-items: stretch;
  gap: 0;
  padding: 0;
  overflow: hidden;
  width: 100%;
  border-radius: 0.55rem;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.07);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 10px rgba(0, 0, 0, 0.06);
}

.dd-number-value {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.dd-number-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  min-width: 0;
  max-width: 100%;
  cursor: text;
  font-size: 0.85rem;
  font-weight: 500;
  line-height: 1.2;
  color: #1f2937;
}

.dd-number-prefix,
.dd-number-suffix {
  flex: 0 0 auto;
  white-space: nowrap;
}

.dd-number-value input {
  box-sizing: content-box;
  flex: 0 0 auto;
  width: 2.5ch;
  min-width: 2.5ch;
  max-width: 2.5ch;
  margin: 0;
  padding: 0.35rem 0.1rem;
  border: none;
  border-radius: 0;
  background: transparent;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: #b91c1c;
  -moz-appearance: textfield;
  appearance: textfield;
}

.dd-number-value:focus-within {
  box-shadow: inset 0 0 0 2px #b91c1c;
}

.dd-number-value input:focus,
.dd-number-value input:focus-visible {
  outline: none;
}

.dd-number-value input::-webkit-outer-spin-button,
.dd-number-value input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.dd-chevron {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  min-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: #1f2937;
  border-radius: 0;
  cursor: pointer;
}

:where(.dd-chevron) svg {
  display: block;
  flex-shrink: 0;
}

.dd-chevron svg {
  width: 0.95rem;
  height: 0.95rem;
}

.dd-chevron:hover,
.dd-chevron:focus-visible {
  color: #b91c1c;
}

.dd-toast-stack {
  position: fixed;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: min(380px, calc(100vw - 2rem));
  pointer-events: none;
}

@media (min-width: 701px) {
  .dd-toast-stack {
    right: 1rem;
    bottom: 1rem;
    left: auto;
    align-items: flex-end;
  }
}

@media (max-width: 700px) {
  .dd-toast-stack {
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    align-items: center;
  }
}

.dd-toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.35rem;
  flex-wrap: nowrap;
  width: 100%;
  min-height: 1cm;
  padding: 0.06rem 0.5rem;
  color: #fff;
  border-radius: 0.5rem;
  background: rgba(185, 28, 28, 0.66);
  backdrop-filter: blur(14px) saturate(1.25);
  -webkit-backdrop-filter: blur(14px) saturate(1.25);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.38);
  pointer-events: auto;
}

.dd-toast.is-restored {
  background: rgba(1, 34, 146, 0.66);
}

.dd-toast-leading,
.dd-toast-actions {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.dd-toast-leading {
  flex: 1 1 auto;
  min-width: 0;
}

.dd-toast-actions {
  flex: 0 0 auto;
}

.dd-toast-mark {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.dd-toast-label {
  display: flex;
  align-items: center;
  gap: 0.25em;
  flex: 1 1 auto;
  min-width: 0;
  font-weight: 700;
  font-size: 0.72rem;
  line-height: 1.2;
  overflow: hidden;
}

.dd-toast-status {
  flex: 0 0 auto;
  white-space: nowrap;
}

.dd-toast-target {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dd-toast .dd-icon-btn {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1;
  min-height: 1.36rem;
  padding: 0.28rem;
  border: none;
  background: rgba(0, 0, 0, 0.22);
  color: #fff;
  border-radius: 0.35rem;
  cursor: pointer;
  box-shadow: none;
}

.dd-toast .dd-icon-btn:hover,
.dd-toast .dd-icon-btn:focus-visible {
  background: rgba(0, 0, 0, 0.3);
  color: #fef9c3;
}

.dd-toast .dd-icon-btn:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
}

.dd-toast-mark svg {
  display: block;
  width: 1.1rem;
  height: 1.1rem;
  flex-shrink: 0;
}

.dd-toast .dd-icon-btn svg {
  width: 0.8rem;
  height: 0.8rem;
}

:host:not(.dd-panel-popup) {
  all: initial;
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2147483645;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
  font-size: 14px;
  line-height: 1.3;
  color: #fff;
}


*,
*::before,
*::after {
  box-sizing: border-box;
}

button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}

button:focus-visible,
a:focus-visible,
input:focus-visible {
  outline: 2px solid #b91c1c;
}

@keyframes dd-highlight-pulse {
  0%,
  100% {
    outline-color: rgba(245, 197, 24, 0.95);
    box-shadow:
      0 0 10px 2px rgba(245, 197, 24, 0.45),
      0 0 20px 6px rgba(185, 28, 28, 0.22);
  }
  50% {
    outline-color: rgba(185, 28, 28, 0.9);
    box-shadow:
      0 0 14px 4px rgba(185, 28, 28, 0.55),
      0 0 28px 10px rgba(185, 28, 28, 0.38);
  }
}

.dd-highlight-frame {
  position: absolute;
  z-index: 0;
  display: none;
  pointer-events: none;
  box-sizing: border-box;
  background: rgba(185, 28, 28, 0.22);
  outline-width: 1px;
  outline-style: solid;
  outline-offset: 2px;
  box-shadow:
    0 0 10px 2px rgba(245, 197, 24, 0.45),
    0 0 20px 6px rgba(185, 28, 28, 0.22);
  animation: dd-highlight-pulse 2s ease-in-out infinite;
  transition:
    top 0.15s ease,
    left 0.15s ease,
    width 0.15s ease,
    height 0.15s ease,
    border-radius 0.15s ease;
}

.dd-highlight-frame.is-instant {
  transition: none;
}

.dd-element-label {
  position: absolute;
  z-index: 1;
  display: none;
  pointer-events: none;
  margin: 0;
  padding: 0.15rem 0.35rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.68rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  color: #fff;
  border-radius: 0.25rem;
  background: rgba(185, 28, 28, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.18);
  transform: translateY(-100%);
}
`;
    const existingLabel = this.shadow.querySelector(".dd-element-label");
    const existingFrame = this.shadow.querySelector(".dd-highlight-frame");
    this.toast = new ToastSystem({
      shadow: this.shadow,
      getNotificationSeconds: () => this.notificationSeconds,
      getStrings: () => this.strings(),
      isRtl: () => this.isRtl(),
      openPanel: options.openPanel,
      undoById: (id) => this.undoById(id),
    });
    this.restore = new RestoreSystem(
      {
        onRestored: (restoredElement) => {
          this.toast.showRestoredToast(
            this.formatRestoredToastDescriptorText(restoredElement),
          );
          this.onElementRestored?.();
        },
      },
      options.undo,
    );
    this.highlight = new HighlightSystem({
      host: {
        shadow: this.shadow,
        isOurNode: (node) => this.isOurNode(node),
        getElementLabelEnabled: () =>
          shouldShowSelectionCaption(this.selectionCaptionStyle),
        formatElementLabel: (target) => this.formatSelectionCaptionText(target),
        hostAttr: HOST_ATTR,
        classes: HIGHLIGHT_UI,
      },
      pageStyles: DELETER_HIGHLIGHT_PAGE_STYLE,
    });
    this.highlight.bindExistingElements(
      existingLabel instanceof HTMLElement ? existingLabel : null,
      existingFrame instanceof HTMLElement ? existingFrame : null,
    );
  }
  isOurNode(node) {
    if (!node) return true;
    if (node === this.host || this.host.contains(node)) return true;
    return !!node.closest?.(`[${HOST_ATTR}]`);
  }
  async loadSettings() {
    const [seconds, locale, selectionCaptionStyle] = await Promise.all([
      getNotificationSeconds(),
      getLocale(),
      getSelectionCaptionStyle(),
    ]);
    this.notificationSeconds = seconds;
    this.locale = locale;
    this.selectionCaptionStyle = selectionCaptionStyle;
  }
  setSelectionCaptionStyle(style) {
    this.selectionCaptionStyle = style;
    this.highlight.syncElementLabel();
  }
  formatSelectionCaptionText(target) {
    return resolveElementDescriptor(target, {
      selectionCaptionStyle: this.selectionCaptionStyle,
      clickToDeleteLabel: this.strings().selectionCaptionClickToDelete,
    });
  }
  formatDeletedToastDescriptor(target) {
    const s = this.strings();
    return formatToastDescriptor(target, {
      variant: "deleted",
      selectionCaptionStyle: this.selectionCaptionStyle,
      deletedCanBeRestored: s.toastDeletedCanBeRestored,
    });
  }
  formatRestoredToastDescriptorText(target) {
    const s = this.strings();
    return formatToastDescriptor(target, {
      variant: "restored",
      selectionCaptionStyle: this.selectionCaptionStyle,
      deletedCanBeRestored: s.toastDeletedCanBeRestored,
    });
  }
  setNotificationSeconds(seconds) {
    this.notificationSeconds = seconds;
  }
  setLocale(locale) {
    this.locale = locale;
    this.highlight.syncElementLabel();
  }
  strings() {
    return t(this.locale);
  }
  isRtl() {
    return isRtlLocale(this.locale);
  }
  activate() {
    this.highlight.activate();
    document.addEventListener("click", this.boundClick, true);
  }
  deactivate() {
    document.removeEventListener("click", this.boundClick, true);
    this.highlight.deactivate();
    this.toast.hide();
  }
  canUndo() {
    if (this.elementActionInFlight) return false;
    return this.restore.canUndo();
  }
  async undoLast() {
    if (this.elementActionInFlight) return false;
    this.elementActionInFlight = true;
    try {
      return await this.restore.undoLast();
    } finally {
      this.elementActionInFlight = false;
    }
  }
  async undoById(id) {
    if (this.elementActionInFlight) return false;
    this.elementActionInFlight = true;
    try {
      return await this.restore.undoById(id);
    } finally {
      this.elementActionInFlight = false;
    }
  }
  async deleteContextElement(element) {
    return this.deleteElement(element);
  }
  async handleClick(e) {
    const pickOptions = { isOurNode: (node) => this.isOurNode(node) };
    const iframeAtPoint = findIframeAtPoint(e.clientX, e.clientY, pickOptions);
    const toRemove = iframeAtPoint ?? this.highlight.getHighlighted();
    if (!toRemove) return;
    const hit = e.target;
    if (hit instanceof Element && this.isOurNode(hit)) return;
    const onTarget =
      hit === toRemove ||
      (hit instanceof Element && toRemove.contains(hit)) ||
      isPointInElement(toRemove, e.clientX, e.clientY);
    if (!onTarget) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    const deleted = await this.deleteElement(toRemove);
    if (deleted) {
      this.highlight.updateHighlightAt(e.clientX, e.clientY);
    }
  }
  async deleteElement(toRemove) {
    if (this.elementActionInFlight) return false;
    const parent = toRemove.parentElement;
    if (!parent) return false;
    const nextSibling = toRemove.nextSibling;
    const childIndex = Array.prototype.indexOf.call(parent.children, toRemove);
    const outerHTML = toRemove.outerHTML;
    const toastDescriptor = this.formatDeletedToastDescriptor(toRemove);
    this.elementActionInFlight = true;
    this.highlight.clearIfTarget(toRemove);
    try {
      await runElementTransition(toRemove, true);
      if (!toRemove.isConnected) return false;
      toRemove.remove();
      const undoId = this.restore.recordDeletion({
        parent,
        parentPath: buildDocumentChildPath(parent),
        parentTagName: parent.tagName,
        parentNs: parent.namespaceURI,
        nextSibling,
        childIndex,
        removedElement: toRemove,
        outerHTML,
        elementLabel: toastDescriptor,
      });
      this.toast.showDeletedToast(toastDescriptor, undoId);
      this.onElementDeleted?.();
      return true;
    } finally {
      this.elementActionInFlight = false;
    }
  }
};
