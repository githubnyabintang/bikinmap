import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import PageLoadingScreen from './Components/PageLoadingScreen';

const rawAppName = import.meta.env.VITE_APP_NAME || 'SIGAPPA';
const appName = rawAppName.includes('${') ? 'SIGAPPA' : rawAppName;

createInertiaApp({
    title: (title) => title ? `${title} - ${appName}` : appName,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.{jsx,tsx}');
        let path = `./Pages/${name}.tsx`;
        if (!pages[path]) {
            path = `./Pages/${name}.jsx`;
        }
        return resolvePageComponent(path, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(
            <>
                <PageLoadingScreen />
                <App {...props} />
            </>
        );
    },
    progress: false,
});
