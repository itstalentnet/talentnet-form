import {
  FORM_META,
  PROJECT_INTRO,
  REQUIRED_QUESTION_IDS,
  SECTIONS,
} from "./questions";
import type { FormConfig } from "./formTypes";

export const FORM1_CONFIG: FormConfig = {
  slug: "form1",
  resultPath: "/form1/result",
  storageKey: "tnf",
  idPrefix: "tnf_",
  intro: {
    ...PROJECT_INTRO,
    highlight: "ذخیره خودکار مرحله‌به‌مرحله",
  },
  meta: FORM_META,
  sections: SECTIONS,
  requiredIds: REQUIRED_QUESTION_IDS,
};
