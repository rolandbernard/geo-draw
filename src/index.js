
import { html } from 'lit-element';
import { render } from 'lit-html';
import 'typeface-roboto';

import './map-renderer';
import { Router } from './router';
import './index.css';

window.addEventListener('load', () => {
    const main = document.querySelector('main');
    const router = new Router();
    router.add('#/(edit(/(.*))?)?', () => {
        render(html`<editing-view></editing-view>`, main);
        import(/* webpackChunkName: "editing" */ './editing-view');
    });
    router.add('#/view(/(.*))?', () => {
        render(html`<display-view></display-view>`, main);
        import(/* webpackChunkName: "display" */ './display-view');
    });
    router.default(() => {
        render(html`<not-found-view></not-found-view>`, main);
        import(/* webpackChunkName: "not-found" */ './not-found-view');
    });
    router.execute();
});
