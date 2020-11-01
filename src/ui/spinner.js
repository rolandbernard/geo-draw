
import { css, html, LitElement, unsafeCSS } from 'lit-element'

const NUM_ELEM = 10;

class Spinner extends LitElement {

    static get styles() {
        return css`
            span.ui-spinner {
                width: 5rem;
                height: 5rem;
                max-width: 100%;
                max-height: 100%;
                position: relative;
                display: block;
            }
            span.ui-spinner span {
                display: block;
                position: absolute;
                background: var(--primary);
                border-radius: 50%;
            }
            @keyframes ui-spinner-keyframes {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            ${unsafeCSS([...Array(NUM_ELEM).keys()].map((i) => (css`
                span.ui-spinner span:nth-child(${unsafeCSS(i + 1)}) {
                    animation: 1s calc(0.02s * ${unsafeCSS(i + 1)}) ease-in-out infinite ui-spinner-keyframes;
                    width: calc(25% - 1% * ${unsafeCSS(i + 1)});
                    height: calc(25% - 1% * ${unsafeCSS(i + 1)});
                    top: calc(50% - (25% - 1% * ${unsafeCSS(i + 1)}) / 2);
                    left: 0%;
                    transform-origin: ${unsafeCSS((50 * 100 / (25 - 1 * (i + 1))) + '%')} 50%;
                }
            `)).join(''))}
        `;
    }

    render() {
        return html`
            <span class="ui-spinner">
                ${[...Array(NUM_ELEM).keys()].map(() => (
                    html`<span></span>`
                ))}
            </span>
        `;
    }

}

customElements.define('ui-spinner', Spinner);
