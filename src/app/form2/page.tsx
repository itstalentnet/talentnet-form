import type { Metadata } from "next";
import FormRunner from "@/components/FormRunner";
import { FORM2_CONFIG } from "@/data/form2";

export const metadata: Metadata = {
  title: "شناخت پروژه: وب‌سایت و پلتفرم ابتکارآفرینان اندیشه فردا",
  description: FORM2_CONFIG.meta.subtitle,
};

export default function Form2Page() {
  return <FormRunner config={FORM2_CONFIG} />;
}
