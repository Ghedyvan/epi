"use client";

import { Icon } from "@iconify/react";
import { memo } from "react";

/**
 * Wrapper seguro para o Icon do Iconify
 * Previne erros de "Cannot read properties of undefined"
 */
const SafeIcon = memo(({ icon, className, ...props }) => {
  if (!icon) return null;
  
  try {
    return <Icon icon={icon} className={className} {...props} />;
  } catch (error) {
    console.warn(`Erro ao carregar ícone: ${icon}`, error);
    return null;
  }
});

SafeIcon.displayName = "SafeIcon";

export default SafeIcon;
