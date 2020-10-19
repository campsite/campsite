import '../styles/globals.css'

import {AppProps} from 'next/app';
import { appWithTranslation } from '../i18n'

global.XMLHttpRequest = require('xhr2');

function App({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />
}

export default appWithTranslation(App);
