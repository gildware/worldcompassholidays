"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@/components/i18n/I18nProvider";
import type { Locale } from "@/i18n/locales";
import { buildPhraseMap, compilePhrases, speak } from "@/i18n/apply-phrases";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE", "SVG"]);
const ATTRS = ["placeholder", "aria-label", "title", "alt"] as const;


type Applied = { source: string; applied: string };

const textMemory = new WeakMap<Text, Applied>();
const attrMemory = new WeakMap<Element, Partial<Record<(typeof ATTRS)[number], Applied>>>();

function skipped(element: Element | null) {
  let node = element;
  while (node) {
    if (SKIP_TAGS.has(node.tagName)) return true;
    if (node.getAttribute("translate") === "no" || node.hasAttribute("data-skip-i18n")) return true;
    node = node.parentElement;
  }
  return false;
}

function swap(raw: string, from: string, to: string) {
  const start = raw.indexOf(from);
  if (start < 0) return raw;
  return `${raw.slice(0, start)}${to}${raw.slice(start + from.length)}`;
}


function replaceText(node: Node, map: Map<string, string>, phrases: string[], locale: Locale) {
  if (node.nodeType !== Node.TEXT_NODE) return;
  const text = node as Text;
  const parent = text.parentElement;
  if (!parent || skipped(parent)) return;
  const raw = text.nodeValue;
  if (!raw) return;
  const trimmed = raw.trim();
  if (trimmed.length < 2 && !/^\d+$/.test(trimmed)) return;

  let state = textMemory.get(text);
  if (state && trimmed !== state.applied && trimmed !== state.source) {
    textMemory.delete(text);
    state = undefined;
  }

  const source = state ? state.source : trimmed;
  const target = speak(source, map, phrases, locale);
  if (trimmed === target) {
    if (target === source) textMemory.delete(text);
    else textMemory.set(text, { source, applied: target });
    return;
  }

  text.nodeValue = swap(raw, trimmed, target);
  if (target === source) textMemory.delete(text);
  else textMemory.set(text, { source, applied: target });
}

function replaceAttrs(element: HTMLElement, map: Map<string, string>, phrases: string[], locale: Locale) {
  if (skipped(element)) return;
  const saved = attrMemory.get(element) ?? {};
  let changed = false;
  for (const attr of ATTRS) {
    const raw = element.getAttribute(attr);
    if (!raw) continue;
    const trimmed = raw.trim();
    let state = saved[attr];
    if (state && trimmed !== state.applied && trimmed !== state.source) {
      delete saved[attr];
      state = undefined;
      changed = true;
    }
    const source = state ? state.source : trimmed;
    const target = speak(source, map, phrases, locale);
    if (trimmed === target) {
      if (target === source) {
        if (saved[attr]) {
          delete saved[attr];
          changed = true;
        }
      } else if (!state || state.applied !== target) {
        saved[attr] = { source, applied: target };
        changed = true;
      }
      continue;
    }
    element.setAttribute(attr, swap(raw, trimmed, target));
    if (target === source) delete saved[attr];
    else saved[attr] = { source, applied: target };
    changed = true;
  }
  if (changed) {
    if (Object.keys(saved).length === 0) attrMemory.delete(element);
    else attrMemory.set(element, saved);
  }
}

function applyTree(root: ParentNode, map: Map<string, string>, phrases: string[], locale: Locale) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    replaceText(current, map, phrases, locale);
    current = walker.nextNode();
  }
  if (root instanceof HTMLElement) replaceAttrs(root, map, phrases, locale);
  if (root instanceof Element || root instanceof Document) {
    root.querySelectorAll<HTMLElement>("[placeholder], [aria-label], [title], [alt]").forEach((element) => {
      replaceAttrs(element, map, phrases, locale);
    });
  }
}

export function PhraseApplier() {
  const pathname = usePathname() ?? "";
  const { dictionary, locale } = useI18n();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    const map = buildPhraseMap(Object.entries(dictionary));
    const phrases = compilePhrases(map);
    let frame = 0;

    const applyTitle = () => {
      const root = document.documentElement;
      const current = document.title;
      const applied = root.getAttribute("data-i18n-title") ?? "";
      let source = root.getAttribute("data-en-title") ?? "";
      if (!source || (current !== source && current !== applied)) {
        source = current;
        root.setAttribute("data-en-title", source);
      }
      const next = speak(source, map, phrases, locale);
      root.setAttribute("data-i18n-title", next);
      if (document.title !== next) document.title = next;
    };

    const run = () => {
      applyTree(document.body, map, phrases, locale);
      applyTitle();
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        run();
      });
    };

    run();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type === "attributes" && record.target instanceof HTMLElement) {
          replaceAttrs(record.target, map, phrases, locale);
          continue;
        }
        if (record.type === "characterData" && record.target.nodeType === Node.TEXT_NODE) {
          replaceText(record.target, map, phrases, locale);
          continue;
        }
        record.addedNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) replaceText(node, map, phrases, locale);
          else if (node instanceof Element) applyTree(node, map, phrases, locale);
        });
      }
      schedule();
    });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });
    const titleEl = document.querySelector("title");
    if (titleEl) {
      observer.observe(titleEl, { subtree: true, childList: true, characterData: true });
    }
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [dictionary, locale, pathname]);

  return null;
}
