
import { html, LitElement } from 'lit-element'

import './map-renderer';
import Icon from './icon.svg';

const data = {
    title: "Hello world",
    defcolor: "#ffffff",
    locations: ["-47045", "-47046", "-47072", "-365331"],
    columns: ["Test"],
    colors: ["#ff0000"],
    data: [[1], [2], [3]],
};

class EditingView extends LitElement {

    render() {
        return html`
            <style>
                header {
                    font-family: Roboto, sans-serif;
                    font-size: 2rem;
                    background: #373F51;
                    color: white;
                    padding: 0.5rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    height: 2.75rem;
                    box-shadow: 0px 2px 4px -1px rgba(0,0,0,0.2),
                        0px 4px 5px 0px rgba(0,0,0,0.14),
                        0px 1px 10px 0px rgba(0,0,0,0.12);
                }
                header img {
                    width: 2rem;
                    height: 2rem;
                    pointer-events: none;
                }
            </style>
            <header><img src="${Icon}"/><span>Geo-Draw</span></header>
            <div>
                <map-renderer
                    data=${JSON.stringify(data)}
                ></map-renderer>
            </div>
        `;
    }

}

customElements.define('editing-view', EditingView);
