
import { css, html, LitElement } from 'lit-element'

class NotFoundView extends LitElement {

    static get styles() {
        return css`
            div.not-found-view-root {
                width: 100%;
                height: 100%;
                background: var(--background-dark);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
            }
            div.content-root {
                display: flex;
                flex-flow: column;
                align-items: center;
                justify-content: center;
                font-family: Roboto, sans-serif;
                text-transform: uppercase;
            }
            div.title {
                font-weight: 600;
                font-size: 5rem;
                text-shadow: 2px 2px black;
            }
            div.info-text {
                font-weight: 400;
                font-size: 1rem;
            }
        `;
    }

    render() {
        document.title = 'Not found';
        return html`
            <div class="not-found-view-root">
                <div class="content-root">
                    <div class="title">404</div>
                    <div class="info-text">URL could not be found</div>
                </div>
            </div>
        `;
    }

}

customElements.define('not-found-view', NotFoundView);