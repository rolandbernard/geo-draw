
import 'typeface-roboto';

import { Router } from './router';
import './index.css';

window.addEventListener('load', () => {
    const main = document.querySelector('main');
    const router = new Router();
    router.add('#/(edit(/.*)?)?', () => {
        main.appendChild(document.createElement('editing-view'));
        import(/* webpackChunkName: "editing" */ './editing-view');
    });
    router.add('#/view(/.*)?', () => {
        main.appendChild(document.createElement('display-view'));
        import(/* webpackChunkName: "display" */ './display-view');
    });
    router.default(() => {
        main.appendChild(document.createElement('not-found-view'));
        import(/* webpackChunkName: "not-found" */ './not-found-view');
    });
    router.execute();
});
