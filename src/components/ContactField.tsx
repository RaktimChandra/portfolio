"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { profile } from "@/content/profile";

export default function ContactField() {
  const t = useTranslations("home");
  const [msg, setMsg] = useState("");
  return (
    <form
      className="contact-field"
      onSubmit={(e) => {
        e.preventDefault();
        const body = encodeURIComponent(msg.trim());
        const subject = encodeURIComponent("From your portfolio");
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      }}
    >
      <label htmlFor="contact-msg" className="sr-only">{t("contactTitle")}</label>
      <textarea id="contact-msg" rows={3} className="contact-field__input" placeholder={t("contactPlaceholder")} value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={4000} />
      <button type="submit" className="btn" disabled={!msg.trim()}>{t("send")} →</button>
    </form>
  );
}
