"use client";

import { createContext, useContext } from "react";
import { CONFIG_PADRAO, type SiteConfig } from "@/lib/config-defaults";

/**
 * Contexto com as configurações do site, para componentes de cliente
 * (Header, Logo, ContactForm…). É hidratado pelo ConfigProvider no layout raiz,
 * que recebe o objeto vindo do servidor (getConfig).
 */
const ConfigContext = createContext<SiteConfig>(CONFIG_PADRAO);

export function ConfigProvider({
  config,
  children,
}: {
  config: SiteConfig;
  children: React.ReactNode;
}) {
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
}

export function useConfig(): SiteConfig {
  return useContext(ConfigContext);
}
