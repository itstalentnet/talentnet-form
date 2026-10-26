import type { Metadata } from "next";
import FormRunner from "@/components/FormRunner";
import { FORM1_CONFIG } from "@/data/form1";

export const metadata: Metadata = {
  title: "شناخت پروژه: پلتفرم مشاوره روان‌شناسی",
  description: FORM1_CONFIG.meta.subtitle,
};

export default function Form1Page() {
  return <FormRunner config={FORM1_CONFIG} />;
}
