import NextI18Next from 'next-i18next';
import ICU from "i18next-icu";
import en from "i18next-icu/locale-data/en";
import * as path from 'path';

const icu = new ICU({
    formats: {
        number: {
            compact: {
                //@ts-ignore
                notation: 'compact',
            },
        },
    },
});
icu.addLocaleData(en);

const nextI18next = new NextI18Next({
    defaultLanguage: 'en',
    otherLanguages: ['de'],
    localePath: path.resolve('./public/static/locales'),
    use: [icu],
});

if (process.env.NODE_ENV !== 'production') {
    if (process.browser) {
        const { applyClientHMR } = require('i18next-hmr/client');
        applyClientHMR(nextI18next.i18n);
    } else {
        const { applyServerHMR } = require('i18next-hmr/server');
        applyServerHMR(nextI18next.i18n);
    }
}

export const { appWithTranslation, useTranslation, withTranslation, Trans, i18n } = nextI18next;
