
import { css, html, LitElement } from 'lit'

import '../map/map-renderer';

class DisplayView extends LitElement {

    static get properties() {
        return {
            data: {type: Object},
        }
    }

    static get styles() {
        return css`
            div.display-view-root {
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

    fetchData() {
        const path = window.location.hash || '#/';
        const data_match = path.match(new RegExp('#/?view/(.+)'));
        if(data_match) {
            const data = data_match?.[1];
            if(!data) {
                window.location.hash = '#/404';
            } else {
                try {
                    this.data = JSON.parse(atob(data));
                } catch(e) {
                    window.location.hash = '#/404';
                }
            }
        }
    }

    constructor() {
        super();
        this.fetchData();
        window.addEventListener('hashchange', this.fetchData.bind(this));
    }

    render() {
        return html`
            <div class="display-view-root">
                <map-renderer .data="${this.data}"></map-renderer>
            </div>
        `;
    }

}

customElements.define('display-view', DisplayView);
