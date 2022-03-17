
import { css, html, LitElement } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

import '../map/map-renderer';
import '../ui/map-data-input';
import Icon from '../icons/logo.svg';
import LinkIcon from '../icons/link.svg';

class EditingView extends LitElement {

    static get properties() {
        return {
            data: {attribute: false},
        };
    }

    static get styles() {
        return css`
            header {
                font-family: Roboto, sans-serif;
                font-size: 2rem;
                background: var(--background-dark);
                color: white;
                padding: 0.5rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                height: 2.75rem;
                box-shadow: var(--shadow-large);
                flex: 0 0 auto;
                z-index: 100;
            }
            header svg {
                width: 2rem;
                height: 2rem;
                pointer-events: none;
            }
            div.editing-view-root {
                height: 100%;
                width: 100%;
                display: flex;
                flex-flow: column;
            }
            div.content-root {
                display: flex;
                flex: 1 1 100%;
                flex-flow: row nowrap;
                overflow: hidden;
            }
            @media (max-aspect-ratio: 1) {
                div.content-root {
                    flex-flow: column;
                }
            }
            div.editing {
                flex: 1 1 60%;
                min-height: 60%;
                min-width: 60%;
            }
            div.renderer {
                flex: 1 1 40%;
                min-height: 40%;
                min-width: 40%;
                box-shadow: var(--shadow-large);
                position: relative;
            }
            :host {
                height: 100%;
                width: 100%;
                display: block;
            }
            .link {
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                fill: var(--primary);
                width: 1.75rem;
                height: 1.75rem;
                padding: 6px;
                background: var(--background-light);
                border-radius: 50%;
                z-index: 100;
            }
            .link:hover {
                cursor: pointer;
                opacity: 0.75;
            }
        `;
    }

    constructor() {
        super();
        this.data_id = 0;
        this.fetchData();
        window.addEventListener('hashchange', this.fetchData.bind(this));
    }

    fetchData() {
        try {
            const path = window.location.hash || '#/';
            const data_match = path.match(new RegExp('#/?(edit(/(.*))?)?'));
            if (data_match) {
                const data = data_match?.[3];
                if (!data) {
                    this.data = {
                        id: this.data_id++,
                        title: '',
                        defcolor: '#f0ffff',
                        columns: [],
                        color_using: [],
                        colors: [],
                        locations: [],
                        data: [],
                    };
                } else {
                    const new_data = JSON.parse(atob(data));
                    if(JSON.stringify(this.data) !== JSON.stringify(new_data)) {
                        this.data = new_data;
                    }
                }
            }
        } catch (e) {
            this.data = {
                id: this.data_id++,
                title: '',
                defcolor: '#f0ffff',
                columns: [],
                color_using: [],
                colors: [],
                locations: [],
                data: [],
            };
        }
    }

    onUpdate(event) {
        this.data = event.data;
        window.location.hash = '#/edit/' + btoa(JSON.stringify(this.data));
    }

    copyLink() {
        const data = JSON.stringify(this.data);
        const url = `${window.location.origin}/${window.location.pathname}/#/view/${btoa(data)}`;
        navigator.clipboard.writeText(url);
    }

    render() {
        return html`
            <div class="editing-view-root">
                <header>${unsafeHTML(Icon)}<span>Geo-Draw</span></header>
                <div class="content-root">
                    <div class="editing">
                        <map-data-input
                            .data="${this.data}"
                            @change="${this.onUpdate}"
                        ></map-data-input>
                    </div>
                    <div class="renderer">
                        <div class="link" @click="${this.copyLink}">
                            ${unsafeHTML(LinkIcon)}
                        </div>
                        <map-renderer
                            .data="${this.data}"
                        ></map-renderer>
                    </div>
                </div>
            </div>
        `;
    }

}

customElements.define('editing-view', EditingView);
