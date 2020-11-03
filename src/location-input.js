
import { css, html, LitElement } from 'lit-element'
import { classMap } from 'lit-html/directives/class-map';

class LocationInput extends LitElement {

    static get properties() {
        return {
            value: {type: String, hasChanged: () => false},
            index: {type: Object},
            complete: {type: Array},
            complete_select: {type: Number},
        }
    }
    
    static get styles() {
        return css`
            div.location-input-root {
                position: relative;
            }
            div.autocomplete {
                display: none;
                position: absolute;
                max-height: 40rem;
                overflow: auto;
            }
            input.input-element:focus ~ div.autocomplete {
                display: block;
            }
        `;
    }
    
    constructor() {
        super();
        this.complete_select = 0;
    }
    
    onKeypress(event) {
        console.log(event);
        const value = event.target.value;
        if(value) {
            const search_fargments = new Set(value.split(/[\s\d-.'"~:;,\/\\]/).filter(el => el).map(el => el.toLowerCase()));
            const fragment_map = {};
            for (const fragment of search_fargments) {
                const found_in = this.index.fragments[fragment];
                if(found_in) {
                    for (const id of Object.keys(found_in)) {
                        if (fragment_map[id]) {
                            fragment_map[id] += found_in[id];
                        } else {
                            fragment_map[id] = found_in[id];
                        }
                    }
                }
            }
            const sorted = Object.keys(fragment_map).map(id => [id, fragment_map[id], this.index.names[id]])
                .sort(([_, a, na], [__, b, nb]) => a < b ? true : b < a ? false : na.length > nb.length);
            this.complete = sorted.map(([id, _, name]) => ({id, name}));
            console.log(fragment_map, search_fargments, this.complete);
        } else {
            this.complete = Object.keys(this.index.names).map(id => ({id, name: this.index.names[id]}));
        }
        if(event.key === 'ArrowUp') {
            if(this.complete_select !== 0) {
                this.complete_select--;
            }
        } else if(event.key === 'ArrowDown') {
            if(this.complete_select < this.complete.length) {
                this.complete_select++;
            }
        }
    }

    render() {
        if(this.string_value === undefined) {
            this.string_value = this.index?.names?.[this.value];
            if(this.string_value === undefined) {
                this.string_value = '';
            }
            this.complete = Object.keys(this.index.names).map(id => ({id, name: this.index.names[id]}));
        }
        return html`
            <div class="location-input-root">
                <input
                    class="input-element"
                    value="${this.string_value}"
                    @keyup="${this.onKeypress}"
                />
                <div class="autocomplete">${this.complete.map((com, i) => (html`
                    <div class="${classMap({complete: true, selected: i === this.complete_select})}">${com.name}</div>
                `))}</div>
            </div>
        `;
    }

}

customElements.define('location-input', LocationInput);
