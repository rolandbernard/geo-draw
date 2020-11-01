
import { html } from 'lit-element';
import 'typeface-roboto';

import { Router } from './router';
import './index.css';

window.addEventListener('load', () => {
    const main = document.querySelector('main');
    const router = new Router(main);
    router.add('#/(edit(/(.*))?)?', html`<editing-view></editing-view>`, () => {
        import(/* webpackChunkName: "editing" */ './editing-view');
    });
    router.add('#/view/(.+)', html`<display-view></display-view>`, () => {
        import(/* webpackChunkName: "display" */ './display-view');
    });
    router.add('#/demo/(.+)', html`<demo-view></demo-view>`, () => {
        import(/* webpackChunkName: "demo" */ './demo-view');
    });
    router.default(html`<not-found-view></not-found-view>`, () => {
        import(/* webpackChunkName: "not-found" */ './not-found-view');
    });
    router.init();
});
