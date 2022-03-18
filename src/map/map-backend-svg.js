
import { LitElement, html, svg, css } from 'lit';
import { styleMap } from 'lit/directives/style-map.js';

import { map } from '../util';
import MapRenderer from './map-renderer';

class MapBackendSvg extends LitElement {

    static get properties() {
        return {
            locations: { type: Array }
        }
    }

    static get styles() {
        return css`
            :host {
                width: 100%;
                height: 100%;
                position: relative;
                display: block;
            }
            #map {
                width: 100%;
                height: 100%;
                max-width: 100%;
                max-height: 100%;
                transform: scale(5);
                opacity: 0.001;
                will-change: transform, opacity;
                stroke: var(--background-darkish);
                stroke-width: 0.125%;
                stroke-linejoin: round;
                paint-order: stroke fill;
                display: block;
                position: absolute;
            }
            svg#map g:hover {
                fill-opacity: 0.75;
            }
        `;
    }
    
    constructor() {
        super();
        this.zoom_scale = 1;
        this.zoom_center = [0, 0];
    }
    
    get center() {
        return this.zoom_center;
    }

    get scale() {
        return this.zoom_scale;
    }

    setCenterAndScale(center, scale) {
        this.zoom_center = center;
        this.zoom_scale = scale;
        const element = this.shadowRoot.getElementById('map');
        element.style.transform = `scale(${this.zoom_scale}) translate(${-this.zoom_center[0]}%,${-this.zoom_center[1]}%)`;
    }
    
    clientPosToMapPos(client_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        return [
            (client_pos[0] - map_pos.x - map_pos.width / 2) / map_pos.width * 100,
            (client_pos[1] - map_pos.y - map_pos.height / 2) / map_pos.height * 100,
        ];
    }

    handleMouseMove(event) {
        const base_elem = event.target;
        let elem = base_elem;
        if(elem?.tagName === 'path') {
            elem = elem.parentNode;
        }
        if(elem?.location_data) {
            const location = elem?.location_data;
            const elem_pos = base_elem.getBoundingClientRect();
            const position = [elem_pos.x + elem_pos.width / 2, elem_pos.y + elem_pos.height / 2];
            const my_event = new Event('hover');
            my_event.location = location;
            my_event.position = position;
            this.dispatchEvent(my_event);
        } else {
            const my_event = new Event('hover');
            my_event.location = null;
            my_event.position = null;
            this.dispatchEvent(my_event);
        }
    }

    handleMouseOut() {
        const my_event = new Event('hover');
        my_event.location = null;
        my_event.position = null;
        this.dispatchEvent(my_event);
    }
    
    handleTouchStart(event) {
        if(event.touches.length === 1) {
            this.handleMouseMove(event);
        } else {
            this.handleMouseOut(event);
        }
    }

    updated() {
        // This is a stupid trick to get chrome to render at a higher resolution
        const animationFrameCallback = () => {
            const element = this.shadowRoot.getElementById('map');
            if(element) {
                window.requestAnimationFrame(() => {
                    window.requestAnimationFrame(() => {
                        element.style.transform = `scale(${this.zoom_scale}) translate(${-this.zoom_center[0]}%,${-this.zoom_center[1]}%)`;
                        element.style.opacity = 1;
                    });
                });
            } else {
                window.requestAnimationFrame(animationFrameCallback);
            }
        };
        window.requestAnimationFrame(animationFrameCallback);
    }

    svgPathForPolygon(poly, min, total_diff, max_size) {
        const vertex = poly.vertex;
        const starts = [0, ...poly.holes, vertex.length / 2];
        const res = [];
        for (let i = 0; i < starts.length - 1; i++) {
            const sub = [];
            const last = [NaN, NaN];
            for (let j = starts[i]; j < starts[i + 1]; j++) {
                const coords = [
                    Math.round(map(vertex[2*j], min[0], min[0] + total_diff, 0, max_size)).toString(),
                    Math.round(map(vertex[2*j + 1], min[1], min[1] + total_diff, 0, max_size)).toString(),
                ];
                if (coords[0] != last[0] || coords[1] != last[1]) {
                    sub.push(j == starts[i] ? ' M' : ' L');
                    sub.push(coords[0] + ',' + coords[1]);
                    last = coords;
                }
            }
            if (i == 0) {
                res.push(...sub);
            } else {
                res.push(...sub.reverse());
            }
            res.push(' z');
        }
        return res.join('');
    }

    render() {
        const min = this.locations.filter(loc => loc).map(loc => loc.geo.proj_min)
                .reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]);
        const max = this.locations.filter(loc => loc).map(loc => loc.geo.proj_max)
                .reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
        const total_diff = Math.max(max[0] - min[0], max[1] - min[1]);
        const max_size = Math.max(window.innerWidth, window.innerHeight) * 5;
        this.locations.forEach(loc => {
            if(loc) {
                const polygons = [...Array(loc.geo.count_polygons()).keys()].map(i => loc.geo.get_proj_polygon(i))
                loc.svg = polygons.map(poly => (
                    svg`<path d="${this.svgPathForPolygon(poly, min, total_diff, max_size)}"/>`
                ));
            }
        });
        return html`
            <svg
                id="map"
                viewBox="${
                    Math.round(map(min[0], min[0], min[0] + total_diff, 0, max_size)) + ' ' + 
                    Math.round(map(min[1], min[1], min[1] + total_diff, 0, max_size)) + ' ' +
                    Math.round(map(max[0], min[0], min[0] + total_diff, 0, max_size)) + ' ' + 
                    Math.round(map(max[1], min[1], min[1] + total_diff, 0, max_size))
                }"
                @mousemove="${this.handleMouseMove}"
                @wheel="${this.handleMouseMove}"
                @mouseout="${this.handleMouseOut}"
                @touchstart="${this.handleTouchStart}"
                @touchmove="${this.handleTouchStart}"
            >
                ${this.locations.map((loc) => (svg`
                    <g
                        class="geometry"
                        style="${styleMap({
                            fill: `rgb(${loc.color[0]},${loc.color[1]},${loc.color[2]})`,
                        })}"
                        .location_data="${loc}"
                    >
                        ${loc?.svg}
                    </g>
                `))}
            </svg>
        `;
    }

}

customElements.define('map-backend', MapBackendSvg);
