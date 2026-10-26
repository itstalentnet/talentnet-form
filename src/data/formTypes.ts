import type { Section } from "./questions";

export interface FormIntroSection {
  id: string;
  title: string;
  paragraphs: string[];
  directions?: string[];
}

export interface FormIntroConfig {
  headerBadge: string;
  greeting: string;
  introParagraphs: string[];
  sections: FormIntroSection[];
  /** Short label shown in the third intro stat pill. */
  highlight?: string;
}

export interface FormMeta {
  title: string;
  subtitle: string;
  brandName: string;
  confirmationMessage: string;
}

export interface FormConfig {
  /** Public route slug, e.g. "form1" or a client-specific path. */
  slug: string;
  /** Admin results route for this form. */
  resultPath: string;
  /** Prefix used for localStorage keys. */
  storageKey: string;
  /** Prefix used when generating a new form id. */
  idPrefix: string;
  intro: FormIntroConfig;
  meta: FormMeta;
  sections: Section[];
  requiredIds: number[];
}
