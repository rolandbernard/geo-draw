
import { LitElement, html, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';
import { until } from 'lit/directives/until.js';
import { cache } from 'lit/directives/cache.js';

import '../ui/spinner';
import { map as mapFromTo, hasWebGlSupport } from '../util';

import { LocationData } from '../../pkg/index';

if (false && hasWebGlSupport()) {
    import(/* webpackChunkName: "map-backend-webgl" */ './map-backend-webgl');
} else {
    import(/* webpackChunkName: "map-backend-svg" */ './map-backend-svg');
}

const data_location = './static/data';
const location_cache = {};

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 30;

export default class MapRenderer extends LitElement {

    static get properties() {
        return {
            data: { type: Object },
            render3d: { state: true },
            details: { state: true },
        };
    }

    static get styles() {
        return css`
            * {
                box-sizing: border-box;
            }
            :host {
                width: 100%;
                height: 100%;
                display: block;
                overflow: hidden;
            }
            div#map-renderer-root {
                width: 100%;
                height: 100%;
                overflow: hidden;
                position: relative;
                color: white;
                --background: var(--background-dark);
                background: var(--background);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            div#map-wrapper {
                position: relative;
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                display: block;
                will-change: cursor;
            }
            div#info-box-wrapper {
                --anchor-point: 50%;
                --anchor-at-bottom: 0;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 100;
                transform: translate(
                    calc(var(--anchor-point) * -1),
                    calc(var(--anchor-at-bottom) * (-100% - 8.5px) + (1 - var(--anchor-at-bottom)) * 8.5px));
                display: none;
                pointer-events: none;
                will-change: transform, top, left;
            }
            div#info-box-wrapper.visible {
                display: block;
            }
            div#info-box {
                padding: 0.5rem;
                font-size: 0.9rem;
                font-family: Roboto, sans-serif;
                color: black;
                display: block;
                width: max-content;
                height: max-content;
                max-width: 15rem;
                min-width: 200px;
                width: 100%;
            }
            div#info-box-name {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            div#info-box-background {
                display: block;
                position: absolute;
                background: var(--background-light);
                width: 100%;
                height: 100%;
                border-radius: 4px;
                opacity: 0.85;
                z-index: -1;
            }
            div#info-box-background::before {
                content: '';
                box-shadow: var(--shadow-small);
                position: absolute;
                width: 100%;
                height: 100%;
                top: 0;
                left: 0;
                border-radius: 4px;
            }
            div#info-box-background::after {
                content: '';
                position: absolute;
                width: 12px;
                height: 12px;
                top: calc(var(--anchor-at-bottom) * 100%);
                left: var(--anchor-point);
                transform: translate(-50%, -50%) rotate(45deg);
                background: var(--background-light);
                will-change: top, left
            }
            div.info-field {
                display: grid;
                grid-template-columns: auto auto;
            }
            span.info-field-name {
                padding-right: 1rem;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            span.info-field-value {
                display: flex;
                align-items: center;
                justify-content: flex-end;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            hr {
                border: 1px solid var(--secondary);
            }
            div.title {
                flex: 0 0 auto;
                font-size: 1.2rem;
                padding: 1rem 0 0 1rem;
                font-family: Roboto, sans-serif;
                position: absolute;
                z-index: 10;
                left: 0;
                top: 0;
                pointer-events: none;
            }
            div#map-legend {
                z-index: 9;
                position: absolute;
                padding: 0 1rem 1rem 0;
                bottom: 0;
                right: 0;
                font-size: 0.85rem;
                font-family: Roboto, sans-serif;
                display: flex;
                flex-flow: column;
                pointer-events: none;
                align-items: flex-end;
            }
            div.current-legend {
                display: flex;
                flex-flow: column;
                text-align: right;
                padding: 0.5rem;
                text-shadow: black 0px 0px 10px;
            }
            div.current-legend .legend-item {
                display: flex;
                flex-flow: row;
                align-items: center;
                justify-content: flex-start;
            }
            div.current-legend .color-block {
                margin: 0 0.5rem;
            }
            div.current-legend .color-gradiant {
                margin-left: 0.5rem;
            }
            select.select-option {
                pointer-events: all;
                appearance: none;
                background: var(--background-darkish);
                color: white;
                border: none;
                padding: 0.35rem;
                border-radius: 4px;
                text-align: center;
                text-align-last: center;
            }
            select.select-option:hover {
                cursor: pointer;
            }
            span.color-gradiant {
                display: flex;
                flex-flow: column;
                align-items: center;
            }
            span.color-gradiant span.scale {
                display: block;
                height: 5rem;
                width: 0.65rem;
                box-shadow: var(--shadow-small);
                margin-top: 0.25rem;
                margin-bottom: 0.25rem;
            }
            span.color-block {
                display: block;
                height: 0.5rem;
                width: 0.5rem;
                box-shadow: var(--shadow-small);
            }
            div.no-data {
                font-family: Roboto, sans-serif;
                font-weight: 600;
                font-size: 2rem; 
                white-space: nowrap;
                text-transform: uppercase;
            }
            #option-box {
                position: absolute;
                left: 0.5rem;
                bottom: 0.5rem;
                display: flex;
                flex-flow: column;
            }
            #option-box div {
                padding: 0.25rem;
                text-shadow: black 0px 0px 10px;
            }
        `;
    }

    constructor() {
        super();
        this.render3d = false;
        this.details = true;
    }

    static parseColor(str) {
        const match = str.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if (match) {
            return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
        } else {
            return [255, 255, 255];
        }
    }

    static blendColors(colors, proportion) {
        const ret = [0, 0, 0];
        const sum = proportion.reduce((a, b) => a + b, 0);
        if (sum === 0) {
            return colors[0] || ret;
        } else {
            colors.forEach((col, i) => ret.forEach((el, j) => ret[j] += col[j] * col[j] * proportion[i]));
            return ret.map(el => Math.sqrt(el / sum));
        }
    }

    static colorPropScale(prop) {
        return Math.log10(99 * prop + 1) / 2;
    }

    handleLocationHover(event) {
        if (this.details) {
            const info_box = this.shadowRoot.getElementById('info-box-wrapper');
            if (event.location && event.position) {
                const name = this.shadowRoot.getElementById('info-box-name');
                const map_wrapper = this.shadowRoot.getElementById('map-wrapper');
                name.innerText = event.location.name.split(',')[0];
                Array.from(info_box.getElementsByClassName('info-field-value')).forEach((el, i) => {
                    el.innerText = (Math.round(event.location.data[i] * 100) / 100).toLocaleString();
                });
                const map_wrapper_pos = map_wrapper.getBoundingClientRect();
                let x = event.position[0] - map_wrapper_pos.x;
                let y = event.position[1] - map_wrapper_pos.y;
                {
                    const y = Math.min(Math.max(y, 0), map_wrapper_pos.height);
                    info_box.style.setProperty('--anchor-point', (x / map_wrapper_pos.width * 90 + 5) + '%');
                    info_box.style.setProperty('--anchor-at-bottom', (y > ((info_box.clientHeight + 12) * 1.2)) ? 1 : 0);
                }
                info_box.style.left = x + 'px';
                info_box.style.top = y + 'px';
                info_box.classList.add('visible');
                const info_box_pos = info_box.getBoundingClientRect();
                if (info_box_pos.x < 4) {
                    x = Math.max(x, 8.5);
                    y = Math.min(Math.max(y, info_box_pos.height * 0.1), map_wrapper_pos.height - info_box_pos.height * 0.1);
                    info_box.style.setProperty('--anchor-point', '0%');
                    info_box.style.setProperty('--anchor-at-bottom', (y / map_wrapper_pos.height * 0.8 + 0.1));
                } else if (info_box_pos.x + info_box_pos.width + 4 > map_wrapper_pos.x + map_wrapper_pos.width) {
                    x = Math.min(x, map_wrapper_pos.width - 8.5);
                    y = Math.min(Math.max(y, info_box_pos.height * 0.1), map_wrapper_pos.height - info_box_pos.height * 0.1);
                    info_box.style.setProperty('--anchor-point', '100%');
                    info_box.style.setProperty('--anchor-at-bottom', (y / map_wrapper_pos.height * 0.8 + 0.1));
                } else {
                    y = Math.min(Math.max(y, 0), map_wrapper_pos.height);
                    info_box.style.setProperty('--anchor-point', (x / map_wrapper_pos.width * 90 + 5) + '%');
                    info_box.style.setProperty('--anchor-at-bottom', (y > ((info_box_pos.height + 12) * 1.2)) ? 1 : 0);
                }
                info_box.style.left = x + 'px';
                info_box.style.top = y + 'px';
                info_box.current_location = location;
            } else {
                const info_box = this.shadowRoot.getElementById('info-box-wrapper');
                info_box.classList.remove('visible');
                info_box.current_location = null;
            }
        }
    }

    handleScroll(event) {
        event.preventDefault();
        const map = this.shadowRoot.getElementById('map-backend');
        let new_scale = map.scale;
        if (event.deltaY < 0) {
            new_scale *= mapFromTo(event.deltaY, 0, -10, 1.1, 1.5);
        } else {
            new_scale *= mapFromTo(event.deltaY, 0, 10, 0.6, 0.9);
        }
        new_scale = Math.min(Math.max(MIN_ZOOM, new_scale), MAX_ZOOM);
        const ds = new_scale / map.scale;
        const center = map.center;
        const pointer = map.clientPosToMapPos([event.clientX, event.clientY]);
        const delta = [(pointer[0] - center[0]) * (1 - 1 / ds), (pointer[1] - center[1]) * (1 - 1 / ds)];
        const new_center = [center[0] + delta[0], center[1] + delta[1]];
        map.setCenterAndScale(new_center, new_scale);
    }

    handleDragStart(event) {
        event.preventDefault();
        const element_wrap = this.shadowRoot.getElementById('map-wrapper');
        this.last_drag_pos = [event.clientX, event.clientY];
        element_wrap.onmouseup = this.handleDragEnd.bind(this);
        element_wrap.onmouseleave = this.handleDragEnd.bind(this);
        element_wrap.onmousemove = this.handleDragMove.bind(this);
        element_wrap.style.cursor = 'grabbing';
    }

    handleDragMove(event) {
        event.preventDefault();
        const map = this.shadowRoot.getElementById('map-backend');
        const last_map_pos = map.clientPosToMapPos(this.last_drag_pos);
        this.last_drag_pos = [event.clientX, event.clientY];
        const current_map_pos = map.clientPosToMapPos([event.clientX, event.clientY]);
        const diff = [current_map_pos[0] - last_map_pos[0], current_map_pos[1] - last_map_pos[1]];
        const new_center = [map.center[0] - diff[0], map.center[1] - diff[1]];
        map.setCenterAndScale(new_center, map.scale);
    }

    handleDragEnd(event) {
        event.preventDefault();
        const element_wrap = this.shadowRoot.getElementById('map-wrapper');
        element_wrap.onmouseup = null;
        element_wrap.onmouseleave = null;
        element_wrap.onmousemove = null;
        element_wrap.style.cursor = null;
    }

    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length == 2 || event.touches.length == 1) {
            this.avg_touch_pos = Array.from(event.touches)
                .map(touch => [touch.clientX, touch.clientY])
                .reduce((a, b) => [a[0] + b[0], a[1] + b[1]]).map(el => el / event.touches.length);
            if (event.touches.length == 2) {
                const touch_array = [[event.touches[0].clientX, event.touches[0].clientY], [event.touches[1].clientX, event.touches[1].clientY]];
                const diff = [touch_array[0][0] - touch_array[1][0], touch_array[0][1] - touch_array[1][1]];
                this.touch_dist = (diff[0] * diff[0] + diff[1] * diff[1]);
            }
        }
    }

    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length == 2 || event.touches.length == 1) {
            const map = this.shadowRoot.getElementById('map-backend');
            // Translation
            const new_touch_pos = Array.from(event.touches)
                .map(touch => [touch.clientX, touch.clientY])
                .reduce((a, b) => [a[0] + b[0], a[1] + b[1]]).map(el => el / event.touches.length);
            const last_map_pos = map.clientPosToMapPos(this.avg_touch_pos);
            this.avg_touch_pos = new_touch_pos;
            const current_map_pos = map.clientPosToMapPos([new_touch_pos[0], new_touch_pos[1]]);
            const diff = [current_map_pos[0] - last_map_pos[0], current_map_pos[1] - last_map_pos[1]];
            let new_center = [map.center[0] - diff[0], map.center[1] - diff[1]];
            let new_scale = map.scale;
            if (event.touches.length == 2) {
                // Scaling
                const touch_array = [[event.touches[0].clientX, event.touches[0].clientY], [event.touches[1].clientX, event.touches[1].clientY]];
                const touch_diff = [touch_array[0][0] - touch_array[1][0], touch_array[0][1] - touch_array[1][1]];
                const new_touch_dist = (touch_diff[0] * touch_diff[0] + touch_diff[1] * touch_diff[1]);
                if (this.touch_dist !== 0 && new_touch_dist !== 0) {
                    new_scale *= new_touch_dist / this.touch_dist;
                    this.touch_dist = new_touch_dist;
                    new_scale = Math.min(Math.max(MIN_ZOOM, new_scale), MAX_ZOOM);
                    const ds = new_scale / map.scale;
                    const pointer = map.clientPosToMapPos(new_touch_pos);
                    const delta = [(pointer[0] - new_center[0]) * (1 - 1 / ds), (pointer[1] - new_center[1]) * (1 - 1 / ds)];
                    new_center[0] += delta[0];
                    new_center[1] += delta[1];
                }
            }
            map.setCenterAndScale(new_center, new_scale);
        }
    }

    handleTouchEnd(event) {
        event.preventDefault();
        this.avg_touch_pos = Array.from(event.touches)
            .map(touch => [touch.clientX, touch.clientY])
            .reduce((a, b) => [a[0] + b[0], a[1] + b[1]]).map(el => el / event.touches.length);
    }

    static getCachedLocations(locations) {
        return locations.map(location => {
            if (location in location_cache) {
                return location_cache[location];
            } else {
                return null;
            }
        });
    }

    static getLocations(locations) {
        return Promise.all(locations.map(async location => {
            if (location) {
                if (!location_cache[location]) {
                    try {
                        const res = await fetch(`${data_location}/${location}.bin`);
                        if (res.ok) {
                            const uint8_array = new Uint8Array(await res.arrayBuffer());
                            location_cache[location] = LocationData.parse_location_data(uint8_array);
                        } else {
                            location_cache[location] = null;
                        }
                    } catch (e) {
                        return null;
                    }
                }
                return location_cache[location];
            } else {
                return null;
            }
        }));
    }

    handleOptionChange(event) {
        const option = event.target.value;
        this.data = { ...this.data, ...this.data.options[option], option_selected: option };
    }

    handleDetailsChange(event) {
        this.details = event.target.checked;
    }

    handle3dChange(event) {
        this.render3d = event.target.checked;
    }

    drawMap(locations_data) {
        const data = this.data;
        try {
            if (data?.locations?.length > 0) {
                if (data.title) {
                    document.title = data.title;
                }
                const color_data = data.data.map(row => data.color_using ? data.color_using.map(el => row[el]) : row);
                const defcolor = MapRenderer.parseColor(data.defcolor || "#ffffff");
                let colors;
                if (color_data?.[0]?.length > 0) {
                    const max_data = color_data.reduce((a, b) => a.map((el, i) => Math.max(el, b[i])));
                    const min_data = color_data.reduce((a, b) => a.map((el, i) => Math.min(el, b[i])));
                    colors = color_data.map(data_vec => {
                        if (data_vec.length == 1) {
                            const color = MapRenderer.parseColor(data.colors[0]);
                            const prop = MapRenderer.colorPropScale(mapFromTo(data_vec[0], min_data[0], max_data[0], 0, 1));
                            return MapRenderer.blendColors([color, defcolor], [prop, 1 - prop]);
                        } else {
                            const sum = data_vec.reduce((a, b) => a + b);
                            const colors = data.colors.map(col => MapRenderer.parseColor(col));
                            const prop = data_vec.map(el => (sum !== 0 ? el / sum : 1));
                            return MapRenderer.blendColors(colors, prop);
                        }
                    });
                } else {
                    colors = data.locations.map(() => defcolor);
                }
                const locations = locations_data
                    .filter(loc => loc)
                    .map((loc, i) => ({
                        name: loc.name,
                        raw: loc,
                        color: colors[i],
                        data: data.data[i],
                        columns: data.columns,
                    }));
                if (locations.length == 0) {
                    throw 'No data';
                }
                const data_min = color_data.reduce((a, b) => a.map((el, i) => Math.min(el, b[i])));
                const data_max = color_data.reduce((a, b) => a.map((el, i) => Math.max(el, b[i])));
                return html`
                    <div
                        id="map-wrapper"
                        @wheel="${this.handleScroll}"
                        @mousedown="${this.handleDragStart}"
                        @touchstart="${this.handleTouchStart}"
                        @touchmove="${this.handleTouchMove}"
                        @touchend="${this.handleTouchEnd}"
                    >
                        ${this.details
                            ? html`
                                <div id="info-box-wrapper">
                                    <div id="info-box-background"></div>
                                    <div id="info-box">
                                        <div id="info-box-name"></div>
                                        <hr />
                                        <div class="info-field">
                                            ${data.columns.map(col => (html`
                                                <span class="info-field-name">${col}</span>
                                                <span class="info-field-value"></span>
                                            `))}
                                        </div>
                                    </div>
                                </div>`
                            : html``
                        }
                        ${cache(this.render3d
                            ? html`
                                <map-backend-3d
                                    id="map-backend"
                                    .locations="${locations}"
                                    @hover="${this.handleLocationHover}"
                                ></map-backend-3d>`
                            : html`
                                <map-backend
                                    id="map-backend"
                                    .locations="${locations}"
                                    @hover="${this.handleLocationHover}"
                                ></map-backend>`
                        )}
                    </div>
                    <div class="title">${data.title}</div>
                    <div id="option-box">
                        <div>
                            <input type="checkbox" id="details" ?checked=${this.details} @change=${this.handleDetailsChange}>
                            <label for="details">Details</label>
                        </div>
                        ${this.data.allow_3d && hasWebGlSupport()
                            ? html`
                                <div>
                                    <input type="checkbox" id="render3d" ?checked=${this.render3d} @change=${this.handle3dChange}>
                                    <label for="render3d">3D</label>
                                </div>`
                            : html``
                        }
                    </div>
                    <div id="map-legend">
                        <div class="current-legend">
                        ${color_data?.[0]?.length > 1
                        ? (data.colors.map((col, i) => (html`
                                    <div class="legend-item">
                                        <span class="color-block" style="${styleMap({
                            background: col,
                        })}"></span>
                                        <span class="legend-label">${data.color_using ? data.columns[data.color_using[i]] : data.color_using[i]}</span>
                                    </div>
                                ` )))
                        : (data.colors.length >= 1
                            ? (html`
                                        <div class="legend-item">
                                            ${data.options
                                    ? null
                                    : html`
                                                        <span class="legend-label">${data.color_using ? data.columns[data.color_using[0]] : data.color_using[0]}</span>
                                                    `
                                }
                                            <span class="color-gradiant">
                                                <span>${(Math.round(data_max[0] * 100) / 100).toLocaleString()}</span>
                                                <span class="scale" style="${styleMap({
                                    background: `linear-gradient(${data.colors[0]},${data.defcolor})`,
                                })}"></span>
                                                <span>${(Math.round(data_min[0] * 100) / 100).toLocaleString()}</span>
                                            </span>
                                        </div>
                                    `)
                            : null
                        )
                    }
                        </div>
                        ${data.options
                        ? html`
                                <select
                                    class="select-option"
                                    @change="${this.handleOptionChange}"
                                >${data.options.map((option, i) => html`
                                        <option
                                            value="${i}"
                                            ?selected="${i == data.option_selected}"
                                        >${option.name}</option>
                                    `)
                            }</select>
                            `
                        : null
                    }
                    </div>
                `;
            } else {
                throw 'No data';
            }
        } catch (e) {
            return html`<div class="no-data">No data</div>`
        }
    }

    render() {
        const cached = MapRenderer.getCachedLocations(this.data.locations);
        if (cached.includes(null)) {
            return html`
                <div id="map-renderer-root">
                    ${until(
                        (async () => this.drawMap(await MapRenderer.getLocations(this.data.locations)))(),
                        html`<ui-spinner></ui-spinner>`
                    )}
                </div>
            `;
        } else {
            return html`
                <div id="map-renderer-root">
                    ${this.drawMap(cached)}
                </div>
            `;
        }
    }
}

customElements.define('map-renderer', MapRenderer);
