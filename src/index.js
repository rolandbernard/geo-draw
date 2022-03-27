
import { html } from 'lit';
import 'typeface-roboto';

import { Router } from './router';
import './index.css';

if (isProduction && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js');
    });
}

window.addEventListener('load', () => {
    const main = document.querySelector('main');
    const router = new Router(main);
    router.add('#/?(edit(/(.*))?)?', html`<editing-view></editing-view>`, () => {
        import(/* webpackChunkName: "editing" */ './view/editing-view');
    });
    router.add('#/?view/(.+)', html`<display-view></display-view>`, () => {
        import(/* webpackChunkName: "display" */ './view/display-view');
    });
    router.add('#/?demo/(.+)', html`<demo-view></demo-view>`, () => {
        import(/* webpackChunkName: "demo" */ './view/demo-view');
    });
    router.default(html`<not-found-view></not-found-view>`, () => {
        window.location.hash = '#/404';
        import(/* webpackChunkName: "not-found" */ './view/not-found-view');
    });
    router.init();
});
