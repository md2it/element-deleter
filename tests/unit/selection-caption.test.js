"use strict";

import {
  formatTagIdClassCaption,
  formatSelectionCaption,
  shouldShowSelectionCaption,
  resolveElementDescriptor,
} from "../../extension/app/selection-caption.js";

const { assertEqual, test } = TestHarness;

test("selection caption prefers tag and id over classes", () => {
  const element = document.createElement("div");
  element.id = "hero";
  element.className = "banner primary";
  assertEqual(formatTagIdClassCaption(element), "div#hero");
});

test("selection caption lists up to three classes when id is absent", () => {
  const element = document.createElement("button");
  element.className = "cta wide primary extra";
  assertEqual(formatTagIdClassCaption(element), "button.cta.wide.primary");
});

test("selection caption falls back to tag name only", () => {
  const element = document.createElement("main");
  assertEqual(formatTagIdClassCaption(element), "main");
});

test("selection caption style none hides labels per settings", () => {
  const element = document.createElement("p");
  assertEqual(shouldShowSelectionCaption("none"), false);
  assertEqual(shouldShowSelectionCaption("tag-id-class"), true);
  assertEqual(formatSelectionCaption(element, "none", "Click to delete"), "");
  assertEqual(
    resolveElementDescriptor(element, {
      selectionCaptionStyle: "click-to-delete",
      clickToDeleteLabel: "Click to delete",
    }),
    "Click to delete",
  );
});
