
import { css, html, LitElement } from 'lit'
import { classMap } from 'lit/directives/class-map.js';

class LocationInput extends LitElement {

    static get properties() {
        return {
            value: {type: String},
            index: {type: Object},
            complete: {type: Array},
            selected: {type: Number},
            string_value: {type: String},
        }
    }
    
    static get styles() {
        return css`
            :host {
                width: 100%;
            }
            div.location-input-root {
                position: relative;
                width: 100%;
            }
            div.autocomplete {
                display: none;
                position: absolute;
                max-height: 40rem;
                overflow: auto;
                width: 100%;
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                box-shadow: var(--shadow-small);
                scrollbar-width: none;
                z-index: 1000;
                pointer-events: none;
            }
            input.input-element:focus ~ div.autocomplete {
                display: block;
            }
            input.input-element {
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
                box-sizing: border-box;
                margin: 0;
                width: 100%;
            }
            div.complete {
                box-sizing: border-box;
                background: var(--background-light);
                color: black;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                width: 100%;
                padding: 0.5rem;
                text-align: left;
            }
            div.complete.selected {
                background: lightgrey;
            }
            div.autocomplete::-webkit-scrollbar {
                display: none;
            }
        `;
    }
    
    constructor() {
        super();
        this.selected = 0;
        this.complete = [];
        this.string_value = '';
    }
   
    updateAutocomplete() {
        const value = this.string_value;
        if (value) {
            const search_fargments = new Set(value.split(/[\s\d-.'"~:;,\/\\]/).filter(el => el).map(el => el.toLowerCase()));
            const fragment_map = {};
            for (const fragment of search_fargments) {
                const found_in = this.index.fragments[fragment];
                if (found_in) {
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
            this.complete = sorted.map(([id, _, name]) => ({ id, name }));
        } else {
            this.complete = Object.keys(this.index.names).map(id => ({ id, name: this.index.names[id] })).sort((a, b) => a.name > b.name);
        }
        this.selected = 0;
    }
    
    onKeypress(event) {
        if(event.key !== 'Enter') {
            const value = event.target.value;
            if(value !== this.string_value) {
                this.string_value = value;
                this.updateAutocomplete();
            }
        }
    }
    
    onKeydown(event) {
        if(event.key === 'ArrowUp') {
            this.selected = (this.complete.length + this.selected - 1) % this.complete.length;
            event.preventDefault();
        } else if(event.key === 'ArrowDown') {
            this.selected = (this.selected + 1) % this.complete.length;
            event.preventDefault();
        } else if(event.key === 'Enter') {
            event.target.blur();
            const location = this.complete[this.selected].id;
            if(location) {
                const event = new Event('change');
                event.location = location;
                this.value = location;
                this.dispatchEvent(event);
            }
        }
    }

    updated() {
        const selected = this.shadowRoot.querySelector('div.autocomplete div.complete.selected');
        if(selected) {
            selected.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    update(props) {
        if(props.has('value')) {
            this.string_value = this.index?.names?.[this.value];
            if(this.string_value === undefined) {
                this.string_value = '';
            }
            this.updateAutocomplete();
        }
        super.update(props)
    }

    render() {
        return html`
            <div class="location-input-root">
                <input
                    class="input-element"
                    .value="${this.string_value}"
                    @keyup="${this.onKeypress}"
                    @keydown="${this.onKeydown}"
                    @focusout="${this.onFocus}"
                />
                <div class="autocomplete">${this.complete.map((com, i) => (html`
                    <div class="${classMap({complete: true, selected: i === this.selected})}">${com.name}</div>
                `))}</div>
            </div>
        `;
    }

}

customElements.define('location-input', LocationInput);
