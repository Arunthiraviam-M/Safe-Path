import React, { createContext, useContext } from "react";
import { useAuth } from "./AuthContext";
import { translations } from "../translations";

const LanguageContext = createContext(null);

// The language preference itself already lives in MongoDB (User.preferences.language,
// set from the Settings page), not in localStorage. This just reads that value
// and exposes a t() translate function driven by it.
export const LanguageProvider = ({ children }) => {
  const { user } = useAuth();
  const lang = user?.preferences?.language || "en";

  const t = (key) => translations[lang]?.[key] || translations.en[key] || key;

  return <LanguageContext.Provider value={{ lang, t }}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => useContext(LanguageContext);
