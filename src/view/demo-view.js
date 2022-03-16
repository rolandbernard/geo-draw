
import { css, html, LitElement } from 'lit'
import { until } from 'lit/directives/until.js';

import '../map/map-renderer';
import '../ui/spinner';

const demo_location = './static/demo';

class DemoView extends LitElement {

    static get properties() {
        return {
            data: {type: Object},
        }
    }

    static get styles() {
        return css`
            div.demo-view-root {
                width: 100%;
                height: 100%;
                background: var(--background-dark);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
        `;
    }

    async fetchData() {
        const path = window.location.hash || '#/';
        const demo_match = path.match(new RegExp('#/?demo/(.+)'));
        if(demo_match) {
            const demo = demo_match?.[1];
            if(!demo) {
                window.location.hash = '#/404';
            } else {
                try {
                    const response = await fetch(`${demo_location}/${demo}.json`);
                    const data = await response.json();
                    this.data = data;
                    return this.data;
                } catch(e) {
                    window.location.hash = '#/404';
                }
            }
        }
    }

    constructor() {
        super();
        this.data = this.fetchData();
        window.addEventListener('hashchange', this.fetchData.bind(this));
    }

    async renderAfterFetch() {
        return html`
            <map-renderer .data="${await this.data}"></map-renderer>
        `;
    }

    render() {
        return html`
            <div class="demo-view-root">
                ${until(this.renderAfterFetch(), html`<ui-spinner></ui-spinner>`)}
            </div>
        `;
    }

}

customElements.define('demo-view', DemoView);
