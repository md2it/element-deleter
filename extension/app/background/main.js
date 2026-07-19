"use strict";
// Single background entry point (Chrome MV3 module service worker, and the
// Firefox 121+ background.scripts fallback — see manifest.json).
//
// Every module below is written in the same "classic script" style the
// extension has always used (bare top-level `function`/`var`/`const`
// declarations, no import/export). Each one now also bridges its top-level
// bindings onto `globalThis` (see the "background-module-bridge" block each
// file ends with), so — even though ES modules each get their own private
// module scope — later-imported modules can keep referring to earlier ones'
// functions/constants as bare identifiers, exactly like they could when this
// same list of files was concatenated via a shared classic-script scope
// (previously: extension/sw.js's importScripts(...) list, mirrored in
// manifest.json's background.scripts). The import order below is preserved
// exactly from that previous list, since several modules rely on side effects
// (registering listeners, running bootstrap code) executing in this order.
//
// These files are also loaded as plain classic (non-module) content scripts
// elsewhere (see manifest.json's content_scripts); the globalThis bridge
// lines are additive-only and do not change that behavior.

import "../../lib/our/api.js";
import "../../lib/our/safe-extension-api.js";
import "../safe-extension-api-rules.js";
import "../../lib/our/hotkeys/prefix-hint-messages.js";
import "../../lib/our/hotkeys/prefix-hint-badge.js";
import "../../lib/our/hotkeys/prefix-background.js";
import "../../lib/our/page-operability/probe.js";
import "../../lib/our/hotkeys/prefix-operability.js";
import "../../lib/our/hotkeys/suppress.js";
import "../../lib/our/hotkeys/settings.js";
import "../icon-paths.js";
import "../../lib/our/icons/lucide.js";
import "../../lib/our/icons/index.js";
import "../../lib/our/icons/md2it.js";
import "../../lib/our/icons/extension-logos.js";
import "../icons.js";
import "../../lib/our/extension-icon-state/tab-active-state.js";
import "../../lib/our/extension-icon-state/icon-sync.js";
import "../../lib/our/extension-icon-state/listeners.js";
import "../../lib/our/extension-icon-state/create.js";
import "../extension-icon-state/constants.js";
import "../extension-icon-state/index.js";
import "../../lib/our/i18n/detect.js";
import "../../lib/our/i18n/locale-code.js";
import "../i18n/detect.js";
import "../../lib/our/i18n/rtl.js";
import "../i18n/strings.js";
import "../i18n/types.js";
import "../hotkeys/commands.js";
import "../messages.js";
import "../hotkeys/settings.js";
import "../hotkeys/background.js";
import "../../lib/our/badge/text-color-animation.js";
import "../settings/selection-caption-style.js";
import "../storage.js";
import "../panel-popup/constants.js";
import "../../lib/our/toast/index.js";
import "../ui-config.js";
import "../about.js";
import "../brand.js";
import "../../lib/our/panel-popup/page-path.js";
import "../../lib/our/panel-popup/open-action-popup.js";
import "../../lib/our/panel-tab/index.js";
import "../panel-tab/open.js";
import "../panel-popup/open.js";
import "../page-operability/constants.js";
import "../../lib/our/page-operability/content-probe.js";
import "../../lib/our/page-operability/can-operate.js";
import "../../lib/our/page-operability/show-notice.js";
import "../../lib/our/page-operability/messages.js";
import "../page-operability/notice.js";
import "../../lib/our/pin.js";
import "../../lib/our/welcome/background.js";
import "../../lib/our/welcome/step-icon.js";
import "../welcome/constants.js";
import "../welcome/data.js";
import "../welcome/background.js";
import "../../lib/our/support-survey/logic.js";
import "../support-survey/constants.js";
import "../support-survey/state.js";
import "../support-survey/background.js";

// The actual listener registration / bootstrap logic (context menus,
// runtime.onInstalled welcome flow, message handlers, badge + icon sync,
// hotkey wiring, etc.). Moved here from the old extension/app/background.js.
import "./logic.js";
