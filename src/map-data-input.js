
import { css, html, LitElement } from 'lit-element'
import { until } from 'lit-html/directives/until';

import './ui/spinner';

const data_location = './static/data/';

class MapDataInput extends LitElement {

    static get properties() {
        return {
            data: {
                type: Object,
                hasChanged: (old_value, new_value) => (
                    old_value?.id !== new_value?.id
                )
            },
        };
    }

    static get styles() {
        return css`
            table, tr, td {
                border-collapse: collapse;
                text-align: center;
                font-family: Roboto, sans-serif;
                font-size: 0.9rem;
                color: black;
                padding: 0.25rem;
            }
            td.cell {
                border-bottom: 1px solid var(--background-dark);
            }
            td.header {
                font-weight: 500;
                border-bottom: 1px solid var(--background-dark);
            }
            input {
                box-sizing: border-box;
                margin: 0;
                font-family: inherit;
                font-size: inherit;
                font-weight: inherit;
                color: inherit;
                width: 100%;
                min-width: 10rem;
            }
            div.map-input-root {
                overflow: auto;
                width: 100%;
                height: 100%;
                background: var(--background-light);
            }
            div.loading {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
        `;
    }

    async loadIndex() {
        try {
            const fragments = await fetch(`${data_location}/index_fragments.json`);
            this.index_fragments = await fragments.json();
            const names = await fetch(`${data_location}/index_names.json`);
            this.index_names = await names.json();
            return {
                fragments: this.index_fragments,
                names: this.index_names,
            };
        } catch(e) {
            console.error(e);
        } 
    }

    constructor() {
        super();
        this.index = this.loadIndex();
    }

    dispatchOnChange(data) {
        if(this.data !== data && JSON.stringify(this.data) !== JSON.stringify(data)) {
            const event = new Event('change');
            event.data = data;
            this.dispatchEvent(event);
        }
    }

    updateData(loc_index, col_index, value) {
        const val = parseFloat(value) || 0;
        this.dispatchOnChange({
            ...this.data,
            data: this.data.data.map((row, i) => row.map((el, j) => loc_index === i && col_index === j ? val : el)),
        });
    }
    
    render() {
        return html`
            <div class="map-input-root">
                ${until((async () => {
                    const { names } = await this.index;
                    return html`
                        <table>
                            <tr><td class="header">Locations</td>${this.data.columns.map(col => (html`
                                <td class="header">
                                    <input value="${col}" type="text"/>
                                </td>
                            `))}<td>
                                <button>Add</button>
                            </td></tr>
                            ${this.data.locations.map((loc, i) => (html`
                                <tr>
                                    <td class="cell"><input value="${names[loc]}" type="text"/></td>
                                    ${this.data.data[i]?.map((data, j) => (html`
                                        <td class="cell">
                                            <input
                                                value="${data}"
                                                type="number"
                                                @change="${e => this.updateData(i, j, e.target.value)}"
                                            />
                                        </td>
                                    `))}
                                </tr>
                            `))}
                            <tr><td>
                                <button>Add</button>
                            </td></tr>
                        </table>
                    `;
                })(), html`<div class="loading"><ui-spinner></ui-spinner></div>`)}
            </div>
        `;
    }

}

customElements.define('map-data-input', MapDataInput);
