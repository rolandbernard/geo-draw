
import { css, html, LitElement } from 'lit-element'
import { until } from 'lit-html/directives/until';

import './ui/spinner';
import './location-input';

const data_location = './static/data/';

class MapDataInput extends LitElement {

    static get properties() {
        return {
            data: {
                type: Object,
                hasChanged: (old_value, new_value) => old_value?.id !== new_value?.id,
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
        const event = new Event('change');
        event.data = data;
        this.dispatchEvent(event);
    }

    updateData(loc_index, col_index, value) {
        const val = parseFloat(value) || 0;
        this.data.data[loc_index][col_index] = val;
        this.dispatchOnChange({
            ...this.data,
        });
    }

    updateLocation(loc_index, value) {
        this.data.locations[loc_index] = value;
        this.dispatchOnChange({
            ...this.data,
        });
    }

    updateColumn(col_index, value) {
        this.data.columns[col_index] = value;
        this.dispatchOnChange({
            ...this.data,
        });
    }

    updateColor(col_index, value) {
        const color_with = this.data.color_using;
        if(value) {
            const entry = color_with.findIndex(el => el === col_index);
            if(entry === -1) {
                this.data.color_using.push(col_index);
                this.data.colors.push(value);
            } else {
                this.data.color_using[entry] = col_index;
                this.data.colors[entry] = value;
            }
        } else {
            color_with.forEach((index, i) => {
                if(index == col_index) {
                    this.data.color_using.splice(i, 0);
                    this.data.colors.splice(i, 0);
                }
            });
        }
        this.dispatchOnChange({
            ...this.data,
        });
    }
   
    addColumn() {
        this.data.columns.push('');
        this.data.data.forEach(row => {
            row.push(0);
        });
        this.dispatchOnChange({
            ...this.data,
            id: this.data.id + 1,
        });
    }
    
    removeColumn(index) {
        const color_with = this.data.color_using;
        color_with.forEach((el, i) => {
            if(el === index) {
                this.data.color_using.splice(i, 1);
                this.data.colors.splice(i, 1);
            }
        });
        this.data.color_using = this.data.color_using.map(el => el > index ? el - 1 : el);
        this.data.columns.splice(index, 1);
        this.data.data.forEach(row => {
            row.splice(index, 1);
        });
        this.dispatchOnChange({
            ...this.data,
            id: this.data.id + 1,
        });
    }

    addRow() {
        this.data.locations.push('');
        this.data.data.push(this.data.columns.map(() => 0));
        this.dispatchOnChange({
            ...this.data,
            id: this.data.id + 1,
        });
    }

    removeRow(index) {
        this.data.locations.splice(index, 1);
        this.data.data.splice(index, 1);
        this.dispatchOnChange({
            ...this.data,
            id: this.data.id + 1,
        });
    }

    render() {
        return html`
            <div class="map-input-root">
                ${until((async () => {
                    const index = await this.index;
                    const { names } = index;
                    return html`
                        <table>
                            <tr><td class="header">Locations</td>${this.data.columns.map((col, i) => (html`
                                <td class="header">
                                    <button
                                        @click="${() => this.removeColumn(i)}"
                                    >Remove</button>
                                    <input
                                        value="${col}"
                                        @change="${e => this.updateColumn(i, e.target.value)}"
                                    />
                                    <input
                                        type="color"
                                        value="${this.data.colors?.[this.data.color_using?.map((u, i) => [u, i])?.find(([u]) => u === i)?.[1]]}"
                                        @change="${e => this.updateColor(i, e.target.value)}"
                                    />  
                                </td>
                            `))}<td>
                                <button
                                    @click="${this.addColumn}"
                                >Add</button>
                            </td></tr>
                            ${this.data.locations.map((loc, i) => (html`
                                <tr>
                                    <td class="cell">
                                        <button
                                            @click="${() => this.removeRow(i)}"
                                        >Remove</button>
                                        <location-input
                                            value="${loc}"
                                            .index="${index}"
                                            @change="${e => this.updateLocation(i, e.location_id)}"
                                        ></location-input>
                                    </td>
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
                                <button
                                    @click="${this.addRow}"
                                >Add</button>
                            </td></tr>
                        </table>
                    `;
                })(), html`<div class="loading"><ui-spinner></ui-spinner></div>`)}
            </div>
        `;
    }

}

customElements.define('map-data-input', MapDataInput);
