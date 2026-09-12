import { COPY, EXTERNAL_LINK, SHARE } from "../vendor/lucide.js";
import {
  SUPPORT_SURVEY_CHROME_STORE_URL,
  SUPPORT_SURVEY_FIREFOX_STORE_URL,
} from "./support-survey/constants.js";

const STORE_URLS = {
  chrome: SUPPORT_SURVEY_CHROME_STORE_URL,
  firefox: SUPPORT_SURVEY_FIREFOX_STORE_URL,
};

function createIconButton(icon, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "dd-recommend-icon-button";
  button.innerHTML = icon;
  button.setAttribute("aria-label", label);
  button.dataset.tooltip = label;
  return button;
}

function createStoreRow(store, label, strings, status) {
  const url = STORE_URLS[store];
  const row = document.createElement("section");
  row.className = "dd-recommend-store-row";
  const name = document.createElement("span");
  name.className = "dd-recommend-store-name";
  name.textContent = label;
  const actions = document.createElement("div");
  actions.className = "dd-recommend-store-actions";

  const openButton = createIconButton(EXTERNAL_LINK, strings.recommendOpenAction);
  openButton.addEventListener("click", () => {
    window.open(url, "_blank", "noopener,noreferrer");
  });
  const copyButton = createIconButton(COPY, strings.recommendCopyButton);
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(url);
      status.textContent = strings.recommendCopied;
    } catch {
      status.textContent = strings.recommendCopyFailed;
    }
  });
  const shareButton = createIconButton(SHARE, strings.recommendShareButton);
  shareButton.addEventListener("click", async () => {
    if (typeof navigator.share !== "function") {
      try {
        await navigator.clipboard.writeText(url);
        status.textContent = strings.recommendCopied;
      } catch {
        status.textContent = strings.recommendShareFailed;
      }
      return;
    }
    try {
      await navigator.share({
        title: "Element Deleter",
        text: strings.recommendShareMessage,
        url,
      });
    } catch (error) {
      if (error?.name !== "AbortError") status.textContent = strings.recommendShareFailed;
    }
  });
  actions.append(openButton, copyButton, shareButton);
  row.append(name, actions);
  return row;
}

function buildRecommendPanelBody(body, strings, createPageTitle, createPageDivider) {
  body.replaceChildren();
  const page = document.createElement("div");
  page.className = "dd-panel-page dd-panel-page--recommend";
  const intro = document.createElement("p");
  intro.className = "dd-recommend-intro";
  intro.textContent = strings.recommendIntro;
  const stores = document.createElement("div");
  stores.className = "dd-recommend-store-list";
  const status = document.createElement("span");
  status.className = "dd-recommend-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  stores.append(
    createStoreRow("chrome", "Chrome", strings, status),
    createStoreRow("firefox", "Firefox", strings, status),
  );
  page.append(
    createPageTitle(strings.tabRecommend),
    createPageDivider(),
    intro,
    stores,
    status,
  );
  body.append(page);
}

export { STORE_URLS, createIconButton, createStoreRow, buildRecommendPanelBody };
