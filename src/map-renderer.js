
import { LitElement, html, svg, css } from 'lit-element';
import { styleMap } from 'lit-html/directives/style-map';
import { until } from 'lit-html/directives/until';

class MapRenderer extends LitElement {

    static get properties() {
        return {
            data: { type: Object },
        };
    }
    
    static get styles() {
        return css`
            div#map-renderer-root {
                width: 100%;
                height: 100%;
                overflow: visible;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            svg.wrapping-svg {
                stroke: var(--background-light);
                stroke-width: 0.25%;
                stroke-linejoin: round;
                stroke-linecap: round;
                filter: url(#dropshadow);
            }
            div#map-wrapper {
                position: relative;
                flex: 1 1 auto;
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
            }
            div#info-box-wrapper.visible {
                display: block;
            }
            div#info-box {
                padding: 0.5rem;
                font-size: 0.9rem;
                font-family: Roboto, sans-serif;
                display: block;
                width: max-content;
                height: max-content;
                max-width: 15rem;
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
                opacity: 0.7;
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
                justify-content: right;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        `;
    }

    static parseBinaryData(array_buffer) {
        const uint8_array = new Uint8Array(array_buffer);
        let len = 0;
        while(uint8_array[len] != 0) {
            len++;
        }
        const string_part = new Uint8Array(array_buffer, 0, len);
        const utf8_decoder = new TextDecoder();
        const data_view = new DataView(array_buffer, len + 1);
        len = 0;
        const coords = [];
        const num_poly = data_view.getUint32(len, true);
        len += 4;
        for (let p = 0; p < num_poly; p++) {
            coords.push([]);
            const num_path = data_view.getUint32(len, true);
            len += 4;
            for (let t = 0; t < num_path; t++) {
                coords[p].push([]);
                const num_cords = data_view.getUint32(len, true);
                len += 4;
                for (let c = 0; c < num_cords; c++) {
                    const lon = data_view.getUint32(len, true);
                    len += 4;
                    const lat = data_view.getUint32(len, true);
                    len += 4;
                    coords[p][t].push([lon, lat]);
                }
            }
        }
        return {
            name: utf8_decoder.decode(string_part),
            coords: coords,
        };
    }

    static project([lon, lat]) {
        return [
            (Math.PI + (lon * Math.PI / 180)),
            (
                Math.abs(lat) > 89.5
                    ? Math.sign(lat) * 89.5
                    : (() => {
                        const phi = lat * Math.PI / 180;
                        return Math.PI - Math.log(Math.tan(Math.PI / 4 + phi / 2));
                    })()
            )
        ];
    }

    static parseColor(str) {
        const match = str.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
        if(match) {
            return [parseInt(match[1], 16), parseInt(match[2], 16), parseInt(match[3], 16)];
        } else {
            return [255, 255, 255];
        }
    }

    static blendColors(colors, proportion) {
        const ret = [0, 0, 0];
        colors.forEach((col, i) => ret.forEach((el, j) => ret[j] += col[j]*col[j]*proportion[i]));
        return ret.map(el => Math.sqrt(el));
    }

    static colorPropScale(prop) {
        return Math.log10(99 * prop + 1) / 2;
    }
    
    mouseMoveCallback(event) {
        const x = event.clientX;
        const y = event.clientY;
        if(!x || !y) {
            console.log(event);
        }
        let elem = this.shadowRoot.elementFromPoint(x, y);
        if(elem?.tagName === 'path') {
            elem = elem.parentNode;
        }
        const info_box = this.shadowRoot.getElementById('info-box-wrapper');
        if(elem?.location_data) {
            const location = elem?.location_data;
            if (!info_box.current_location !== location) {
                const name = this.shadowRoot.getElementById('info-box-name');
                const map_wrapper = this.shadowRoot.getElementById('map-wrapper');
                const elem_pos = elem.getBoundingClientRect();
                const x = elem_pos.x - map_wrapper.offsetLeft + elem_pos.width / 2;
                const y = elem_pos.y - map_wrapper.offsetTop + elem_pos.height / 2;
                info_box.style.left = x + 'px';
                info_box.style.top = y + 'px';
                info_box.style.setProperty('--anchor-point', (x / map_wrapper.clientWidth * 90 + 5) + '%');
                info_box.style.setProperty('--anchor-at-bottom', (y > ((info_box.clientHeight + 12) * 1.2)) ? 1 : 0);
                name.innerText = location.name.split(',')[0];
                Array.from(info_box.getElementsByClassName('info-field-value')).forEach((el, i) => {
                    el.innerText = Math.round(location.data[i] * 100) / 100;
                });
                info_box.classList.add('visible');
                info_box.current_location = location;
            }
        } else {
            info_box.classList.remove('visible');
            info_box.current_location = null;
        }
    }

    async drawMap() {
        const data = this.data;
        if(data?.locations) {
            const locations_promise = Promise.all(data.locations.map(async location => {
                const res = await fetch(`/static/data/${location}.bin`);
                const data = MapRenderer.parseBinaryData(await res.arrayBuffer());
                data.coords = data.coords.map(poly => poly.map(part => (
                    part.map(([lon, lat]) => MapRenderer.project([lon / 1e7, lat / 1e7]).map(el => 1000 * el))
                )));
                return {
                    name: data.name,
                    min: data.coords.flat(2).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
                    max: data.coords.flat(2).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
                    svg: data.coords.map(poly => (
                        svg`<path d="${
                            poly.map((part, i) => (
                                (i == 0 ? part : part.reverse())
                                    .map((coord, i) => (
                                        i == 0
                                            ? 'M ' + coord[0] + ',' + coord[1]
                                            : 'L ' + coord[0] + ',' + coord[1]
                                    )).join(' ') + ' z'
                            )).join(' ')
                        }"/>`
                    )),
                };
            }));
            const color_data = data.data.map(row => row.filter((_, i) => data.color_using ? data.color_using.find(el => el === i) : true));
            const defcolor = MapRenderer.parseColor(data.defcolor || "#ffffff");
            let colors;
            if(color_data?.[0].length > 0) {
                const max_data = color_data.reduce((a, b) => a.map((el, i) => Math.max(el, b[i])));
                colors = color_data.map(data_vec => {
                    if(data_vec.length == 1) {
                        const color = MapRenderer.parseColor(data.colors[0]);
                        const prop = MapRenderer.colorPropScale(data_vec[0] / max_data[0]);
                        return MapRenderer.blendColors([color, defcolor], [prop, 1 - prop]);
                    } else {
                        const sum = data_vec.reduce((a, b) => a + b);
                        const colors = data.colors.map(col => MapRenderer.parseColor(col));
                        const prop = data_vec.map(el => el / sum);
                        return MapRenderer.blendColors(colors, prop);
                    }
                });
            } else {
                colors = data.locations.map(() => defcolor);
            }
            const locations = (await locations_promise).map((loc, i) => ({...loc, data: data.data[i], columns: data.columns}));
            const min = locations.map(loc => loc.min).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]);
            const max = locations.map(loc => loc.max).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
            return html`
                <div id="map-wrapper">
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
                    </div>
                    <svg
                        class="wrapping-svg"
                        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        viewBox="${min[0] + " " + min[1] + " " + (max[0] - min[0]) + " " + (max[1] - min[1])}"
                        @mousemove="${this.mouseMoveCallback}"
                        @mouseout="${this.mouseMoveCallback}"
                        @mousedown="${this.mouseMoveCallback}"
                    >
                        <filter id="dropshadow" height="130%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="3"/>
                          <feOffset dx="2" dy="2" result="offsetblur"/>
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.25"/>
                          </feComponentTransfer>
                          <feMerge> 
                            <feMergeNode/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                        ${locations.map((loc, i) => (svg`
                            <g class="geometry" style="${styleMap({
                                fill: `rgb(${colors[i][0]},${colors[i][1]},${colors[i][2]})`,
                            })}" .location_data="${loc}">
                                ${loc.svg}
                            </g>
                        `))}
                    </svg>
                </div>
            `;
        } else {
            return html`<div class="no-data">No data</div>`
        }
    }

    render() {
        return html`
            <div id="map-renderer-root">
                ${until(this.drawMap(), "Loading...")}
            </div>
        `;
    }

}

customElements.define('map-renderer', MapRenderer);
