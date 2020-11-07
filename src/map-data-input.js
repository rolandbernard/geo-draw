
import { css, html, LitElement } from 'lit-element'
import { until } from 'lit-html/directives/until';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

import './ui/spinner';
import './location-input';
import AddIcon from './icons/add.svg';
import DeleteIcon from './icons/delete.svg';
import { classMap } from 'lit-html/directives/class-map';

const data_location = './static/data/';

class MapDataInput extends LitElement {

    static get properties() {
        return {
            data: {type: Object, hasChanged: (n, o) => n?.id !== o?.id},
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
            td.cell, td.header {
                border-bottom: 1px solid var(--background-dark);
            }
            td.header span.location-header {
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 2rem;
                width: 15rem;
                margin: 4px;
            }
            input {
                flex: 1 1 auto;
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
            .add-button, .remove-button {
                flex: 0 0 auto;
                display: flex;
                justify-content: center;
                align-items: center;
                border: none;
                box-sizing: border-box;
                background: var(--secondary);
                color: white;
                padding: 3px;
                border-radius: 4px;
                appearance: none;
                user-select: none;
                box-shadow: var(--shadow-small);
                cursor: pointer;
                margin: 4px;
            }
            .add-button svg, .remove-button svg {
                width: 1.5rem;
                height: 1.5rem;
                fill: white;
            }
            .color-input {
                flex: 0 0 auto;
                display: block;
                width: 1.5rem;
                height: 1.5rem;
                border: none;
                box-sizing: content-box;
                padding: 3px 3px;
                border-radius: 4px;
                appearance: none;
                user-select: none;
                background: var(--background-light);
                box-shadow: var(--shadow-small);
                cursor: pointer;
                min-width: 0;
                min-height: 0;
                margin: 4px;
            }
            .color-input.disabled {
                filter: blur(1px);
            }
            .color-checkbox {
                flex: 0 0 auto;
                width: min-content;
                height: min-content;
                min-width: 0;
                min-height: 0;
                display: block;
                margin: 4px;
            }
            .title-input-wrap, .defcolor-input-wrap, .data-input-wrap, .location-cell {
                display: flex;
                align-items: center;
            }
            .title-input-wrap, .defcolor-input-wrap {
                margin: 0.25rem;
            }
            .title-input-wrap {
                margin-top: 0.5rem;
            }
            .title-input-wrap span.title, .defcolor-input-wrap span.defcolor {
                margin: 4px;
            }
            input.text-field, input.text-field {
                display: block;
                height: calc(1.5rem + 6px);
                appearance: none;
                border-radius: 4px;
                padding: 3px 6px;
                border: 1px solid var(--secondary);
                font-weight: 400;
                font-family: Roboto, sans-serif;
                font-size: 0.9rem;
                color: black;
            }
        `;
    }

    static multiplyIndex(frags) {
        const ret = {};
        Object.keys(frags).map(name => (
            [name.split('').reduce((a, c) => a.concat((a[a.length - 1] || '') + c),[]), frags[name]]
        )).forEach(([frags, ids]) => {
            frags.forEach(fragment => {
                if(ret[fragment]) {
                    Object.keys(ids).forEach(id => {
                        if(ret[fragment][id]) {
                            ret[fragment][id] += ids[id];
                        } else {
                            ret[fragment][id] = ids[id];
                        }
                    });
                } else {
                    ret[fragment] = {...ids};
                }
            });
        });
        return ret;
    }

    async loadIndex() {
        try {
            const fragments = await fetch(`${data_location}/index_fragments.json`);
            this.index_fragments = MapDataInput.multiplyIndex(await fragments.json());
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
                if(index === col_index) {
                    this.data.color_using.splice(i, 1);
                    this.data.colors.splice(i, 1);
                }
            });
        }
        this.dispatchOnChange({
            ...this.data,
        });
        this.requestUpdate();
    }
   
    addColumn() {
        this.data.columns.push('');
        this.data.data.forEach(row => {
            row.push(0);
        });
        this.dispatchOnChange({
            ...this.data,
        });
        this.requestUpdate();
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
        });
        this.requestUpdate();
    }

    addRow() {
        this.data.locations.push('');
        this.data.data.push(this.data.columns.map(() => 0));
        this.dispatchOnChange({
            ...this.data,
        });
        this.requestUpdate();
    }

    removeRow(index) {
        this.data.locations.splice(index, 1);
        this.data.data.splice(index, 1);
        this.dispatchOnChange({
            ...this.data,
        });
        this.requestUpdate();
    }

    updateTitle(title) {
        this.data.title = title;
        this.dispatchOnChange({
            ...this.data,
        });
    }

    updateDefaultColor(color) {
        this.data.defcolor = color;
        this.dispatchOnChange({
            ...this.data,
        });
    }

    render() {
        return html`
            <div class="map-input-root">
                ${until((async () => {
                    const index = await this.index;
                    return html`
                        <div>
                            <span class="title-input-wrap"><span class="title">Title:</span><input
                                class="text-field"
                                value="${this.data.title}"
                                @change="${e => this.updateTitle(e.target.value)}"
                            /></span>
                            <span class="defcolor-input-wrap"><span class="defcolor">Default color:</span><input
                                class="color-input"
                                type="color"
                                value="${this.data.defcolor}"
                                @change="${e => this.updateDefaultColor(e.target.value)}"
                            /></span>
                        </div>
                        <table>
                            <tr><td class="header"><span class="location-header">Locations</span></td>${this.data.columns.map((col, i) => (html`
                                <td class="header"><div class="data-input-wrap">
                                    <button
                                        class="remove-button"
                                        @click="${() => this.removeColumn(i)}"
                                    >${unsafeHTML(DeleteIcon)}</button>
                                    <input
                                        class="text-field"
                                        value="${col}"
                                        @change="${e => this.updateColumn(i, e.target.value)}"
                                    />
                                    <input
                                        class="${classMap({'color-input': true, 'disabled': this.data.color_using?.findIndex(u => u === i) !== -1 ? false : true})}"
                                        key="${i}"
                                        type="color"
                                        value="${this.data.colors?.[this.data.color_using?.map((u, i) => [u, i])?.find(([u]) => u === i)?.[1]]}"
                                        @change="${e => this.updateColor(i, e.target.value)}"
                                    />  
                                    <input
                                        class="color-checkbox"
                                        type="checkbox"
                                        ?checked="${this.data.color_using?.findIndex(u => u === i) !== -1 ? true : false}"
                                        @change="${e => {
                                            if(e.target.checked) {
                                                const color = this.shadowRoot.querySelector(`input.color-input[key="${i}"]`)?.value;
                                                if(color) {
                                                    this.updateColor(i, color)
                                                }
                                            } else {
                                                this.updateColor(i, null)
                                            }
                                        }}"
                                    />  
                                </div></td>
                            `))}<td>
                                <button
                                    class="add-button"
                                    @click="${this.addColumn}"
                                >${unsafeHTML(AddIcon)}</button>
                            </td></tr>
                            ${this.data.locations.map((loc, i) => (html`
                                <tr>
                                    <td class="cell">
                                        <div class="location-cell">
                                            <button
                                                class="remove-button"
                                                @click="${() => this.removeRow(i)}"
                                            >${unsafeHTML(DeleteIcon)}</button>
                                            <location-input
                                                value="${loc}"
                                                .index="${index}"
                                                @change="${e => this.updateLocation(i, e.location)}"
                                            ></location-input>
                                        </div>
                                    </td>
                                    ${this.data.data[i]?.map((data, j) => (html`
                                        <td class="cell">
                                            <input
                                                class="text-field"
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
                                    class="add-button"
                                    @click="${this.addRow}"
                                >${unsafeHTML(AddIcon)}</button>
                            </td></tr>
                        </table>
                    `;
                })(), html`<div class="loading"><ui-spinner></ui-spinner></div>`)}
            </div>
        `;
    }

}

customElements.define('map-data-input', MapDataInput);
