import { ext } from "../api.js";
import { PROBE_DOCUMENT_OPERABILITY } from "./content-probe.js";
import { probeDocumentOperability } from "./probe.js";

export function scriptingTarget(tabId, frameId) {
  return frameId !== void 0 && frameId !== 0
    ? { tabId, frameIds: [frameId] }
    : { tabId };
}
export function messageOptions(frameId) {
  return frameId !== void 0 && frameId !== 0 ? { frameId } : void 0;
}
export async function canOperateOnTab(tabId, frameId) {
  try {
    const response = await ext.tabs.sendMessage(
      tabId,
      { type: PROBE_DOCUMENT_OPERABILITY },
      messageOptions(frameId),
    );
    if (response === true) return true;
    if (response === false) return false;
  } catch {}
  try {
    const [result] = await ext.scripting.executeScript({
      target: scriptingTarget(tabId, frameId),
      func: probeDocumentOperability,
    });
    return result?.result === true;
  } catch {
    return false;
  }
}
