import { ext } from "../api";
import { probeDocumentOperability } from "./probe";

function scriptingTarget(tabId: number, frameId?: number): chrome.scripting.InjectionTarget {
  return frameId !== undefined && frameId !== 0
    ? { tabId, frameIds: [frameId] }
    : { tabId };
}

/** True when the browser allows programmatic scripting on the tab (or frame). */
export async function canOperateOnTab(tabId: number, frameId?: number): Promise<boolean> {
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
