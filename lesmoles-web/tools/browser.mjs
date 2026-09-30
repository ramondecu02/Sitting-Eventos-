// Abre Chromium con Playwright. Si hay un Chromium ya instalado que no
// coincide con la versión de Playwright, se indica con CHROMIUM_PATH.
import { chromium } from 'playwright';

export function launch() {
  const executablePath = process.env.CHROMIUM_PATH || undefined;
  return chromium.launch({ executablePath });
}
