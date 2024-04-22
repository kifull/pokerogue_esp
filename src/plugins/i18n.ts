import i18next from 'i18next';
import { menu as enMenu } from '../locales/en/menu';
import { menu as itMenu } from '../locales/it/menu';
import { menu as frMenu } from '../locales/fr/menu';
import { menu as esMenu } from '../locales/es/menu';

import { move as enMove } from '../locales/en/move';
import { move as frMove } from '../locales/fr/move';
import { move as esMove } from '../locales/es/move';

export interface MoveTranslationEntry {
  name: string,
  effect: string
}

export interface MoveTranslations {
  [key: string]: MoveTranslationEntry
}

export interface Localizable {
  localize(): void;
}

const DEFAULT_LANGUAGE_OVERRIDE = '';

export function initI18n(): void {
  let lang = 'en';

  if (localStorage.getItem('prLang'))
    lang = localStorage.getItem('prLang');

  /**
   * i18next is a localization library for maintaining and using translation resources.
   * 
   * Q: How do I add a new language?
   * A: To add a new language, create a new folder in the locales directory with the language code.
   *    Each language folder should contain a file for each namespace (ex. menu.ts) with the translations.
   * 
   * Q: How do I add a new namespace?
   * A: To add a new namespace, create a new file in each language folder with the translations.
   *    Then update the `resources` field in the init() call and the CustomTypeOptions interface.
   */

  i18next.init({
    lng: DEFAULT_LANGUAGE_OVERRIDE ? DEFAULT_LANGUAGE_OVERRIDE : lang,
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        menu: enMenu,
        move: enMove,
      },
      it: {
        menu: itMenu,
      },
      fr: {
        menu: frMenu,
        move: frMove,
      },
      es: {
        menu: esMenu,
        move: esMove,
      }
    },
  });
}

// Module declared to make referencing keys in the localization files type-safe.
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      menu: typeof enMenu;
      move: typeof enMove;
    };
  }
}

export default i18next;
