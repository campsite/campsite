import '../styles/globals.css'

import {AppProps} from 'next/app';

import SiteHeader from '../components/SiteHeader';
import { appWithTranslation } from '../i18n'

global.XMLHttpRequest = require('xhr2');

function App({ Component, pageProps }: AppProps) {
    return <div>
        <SiteHeader />
        <main>
            <Component {...pageProps} />
        </main>
    </div>;
}

export default appWithTranslation(App);
