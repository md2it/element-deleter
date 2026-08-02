"use strict";

const { assert, assertEqual, test } = TestHarness;

async function readExtensionText(path) {
  const response = await fetch(`/extension/${path}`);
  if (!response.ok) {
    throw new Error(`Failed to load extension/${path}: ${response.status}`);
  }
  return response.text();
}

test("manifest declares module background worker without content scripts or all_urls", async () => {
  const manifest = await fetch("/extension/manifest.json").then((response) => response.json());
  assertEqual(manifest.background.service_worker, "app/background/main.js");
  assertEqual(manifest.background.type, "module");
  assertEqual(manifest.content_scripts, undefined);
  assert(!JSON.stringify(manifest).includes("<all_urls>"));
  assert(JSON.stringify(manifest.permissions) === JSON.stringify([
    "storage",
    "scripting",
    "activeTab",
    "contextMenus",
  ]));
  assert(manifest.web_accessible_resources?.length);
  assert(
    manifest.web_accessible_resources[0].matches.every((match) => match !== "<all_urls>"),
  );
});

test("manifest registers hidden hotkey commands for toggle, undo, and deactivate", async () => {
  const manifest = await fetch("/extension/manifest.json").then((response) => response.json());
  assert(manifest.commands["activate-deactivate"]);
  assert(manifest.commands["undo-delete"]);
  assert(manifest.commands["deactivate-delete-mode"]);
});

test("background logic wires support survey, undo, and content loader", async () => {
  const backgroundMain = await readExtensionText("app/background/main.js");
  assert(/import\s+"\.\/logic\.js"/.test(backgroundMain));

  const logicSource = await readExtensionText("app/background/logic.js");
  assert(/from\s+"\.\.\/support-survey\/background\.js"/.test(logicSource));
  assert(/SUPPORT_SURVEY_ACTION/.test(logicSource));
  assert(/recordSupportSurveyAction\(\)/.test(logicSource));
  assert(/handleSupportSurveyScenarioComplete\(/.test(logicSource));
  assert(/app\/content\/loader\.js/.test(logicSource));
  assert(/UNDO_LAST/.test(logicSource));
  assert(/deactivateTab/.test(logicSource));
  assert(/undoTab/.test(logicSource));
});

test("content script records deletions for support survey on scenario complete", async () => {
  const content = await readExtensionText("app/content/main.js");
  assert(/SCENARIO_COMPLETE/.test(content));
  assert(/SUPPORT_SURVEY_ACTION/.test(content));
  assert(/recordSupportSurveyAction/.test(content));
  assert(/notifyScenarioComplete\(hadDeletion\)/.test(content));
});

test("support survey and panel pages are wired as separate extension surfaces", async () => {
  const panelHtml = await readExtensionText("panel-popup-page.html");
  assert(/type="module"\s+src="app\/content\/main\.js"/.test(panelHtml));

  const surveyHtml = await readExtensionText("support-survey-page.html");
  assert(surveyHtml.includes("survey-root"));
  assert(/type="module"\s+src="app\/support-survey\/page\.js"/.test(surveyHtml));
});

test("support survey background serializes action increments", async () => {
  const surveyBackground = await readExtensionText("app/support-survey/background.js");
  assert(/recordSupportSurveyActions\(1\)/.test(surveyBackground));
  assert(/await supportSurveyActionQueue/.test(surveyBackground));
  assert(/shouldShowSupportSurvey\(state\)/.test(surveyBackground));
});
