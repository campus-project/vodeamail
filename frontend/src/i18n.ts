import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import Backend from "i18next-http-backend";
import intervalPlural from "i18next-intervalplural-postprocessor";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(intervalPlural)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ns: ["common", "datatable", "pages", "sidebar"],
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
