
import { LitElement, html, css } from 'lit-element';
import earcut from 'earcut';

import WebGLRenderer from './webgl-renderer';

const location_data_cache = {};

class MapBackendWebGl extends LitElement {

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
                display: block;
                position: absolute;
            }
        `;
    }
    
    constructor() {
        super();
        this.renderer = new WebGLRenderer();
        this.state = {
            center: [0, 0],
            scale: 1,
            min: [0, 0],
            max: [0, 0],
            size: [0, 0],
            hover: null,
        }
    }

    get center() {
        return this.state.center;
    }

    get scale() {
        return this.state.scale;
    }

    setCenterAndScale(center, scale) {
        this.state.center = center;
        this.state.scale = scale;
    }
    
    clientPosToMapPos(client_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        return this.renderer.clientPosToMapPos(client_pos, map_pos, this.state);
    }

    clientPosToLocationPos(client_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        return this.renderer.clientPosToLocationPos(client_pos, map_pos, this.state);
    }
    
    locationPosToClientPos(location_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        return this.renderer.locationPosToClientPos(location_pos, map_pos, this.state);
    }

    handleMouseMove(event) {
        const pos = this.clientPosToLocationPos([event.clientX, event.clientY]);
        for(const loc of this.locations) {
            if(loc.min[0] <= pos[0] && loc.min[1] <= pos[1] &&
                loc.max[0] >= pos[0] && loc.max[1] >= pos[1]) {
                for(const polygon of loc.triangles.polygons) {
                    if(polygon.min[0] <= pos[0] && polygon.min[1] <= pos[1] &&
                        polygon.max[0] >= pos[0] && polygon.max[1] >= pos[1]) {
                        for(let i = 0; i < polygon.triangles.length; i += 3) {
                            const v1 = [
                                polygon.vertices[2 * polygon.triangles[i]],
                                polygon.vertices[2 * polygon.triangles[i] + 1]
                            ];
                            const v2 = [
                                polygon.vertices[2 * polygon.triangles[i + 1]],
                                polygon.vertices[2 * polygon.triangles[i + 1] + 1]
                            ];
                            const v3 = [
                                polygon.vertices[2 * polygon.triangles[i + 2]],
                                polygon.vertices[2 * polygon.triangles[i + 2] + 1]
                            ];
                            function sign(p1, p2, p3) {
                                return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
                            }
                            const d1 = sign(pos, v1, v2);
                            const d2 = sign(pos, v2, v3);
                            const d3 = sign(pos, v3, v1);
                            const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
                            const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
                            if(!(has_neg && has_pos)) {
                                this.state.hover = loc.id;
                                const my_event = new Event('hover');
                                my_event.location = loc;
                                my_event.position = this.locationPosToClientPos([
                                    (polygon.min[0] + polygon.max[0]) / 2,
                                    (polygon.min[1] + polygon.max[1]) / 2
                                ]);
                                this.dispatchEvent(my_event);
                                return;
                            }
                        }
                    }
                }
            }
        }
        this.handleMouseOut();
    }

    handleMouseOut() {
        this.state.hover = null;
        const my_event = new Event('hover');
        my_event.location = null;
        my_event.position = null;
        this.dispatchEvent(my_event);
    }
    
    handleTouchStart(event) {
        if(event.touches.length === 1) {
            this.handleMouseMove({
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY,
            });
        } else {
            this.handleMouseOut(event);
        }
    }
    
    renderMapInCanvas() {
        if (
            !this.last || this.last.center != this.state.center
            || this.last.scale != this.state.scale
            || this.last.hover != this.state.hover
            || this.last.size != this.state.size
        ) {
            this.renderer.renderMapInContext(this.locations, this.state)
            this.last = { ...this.state };
        }
        window.requestAnimationFrame(this.renderMapInCanvas.bind(this));
    }

    firstUpdated() {
        const canvas = this.shadowRoot.getElementById('map');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        const handleResize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);
            this.state.size = [canvas.clientWidth, canvas.clientHeight];
        }
        window.addEventListener('resize', handleResize);
        handleResize();
        this.renderer.initForContext(gl, this.locations);
        this.renderMapInCanvas();
    }

    disconnectedCallback() {
        this.renderer.deinitResources(this.locations);
    }

    generateTriangles(location) {
        const polygons = [];
        let vertex_count = 0;
        let triangle_count = 0;
        let outline_count = 0;
        for (const poly of location.coords) {
            for (const part of poly) {
                outline_count += part.length;
            }
            const data = earcut.flatten(poly);
            const triangles = earcut(data.vertices, data.holes, data.dimensions);
            vertex_count += data.vertices.length;
            triangle_count += triangles.length;
            polygons.push({
                vertices: new Float32Array(data.vertices),
                triangles: new Uint16Array(triangles),
                min: poly.flat().reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
                max: poly.flat().reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
            });
        }
        const vertices = new Float32Array(vertex_count);
        const triangles = new Uint16Array(triangle_count);
        vertex_count = 0;
        triangle_count = 0;
        for (const poly of polygons) {
            vertices.set(poly.vertices, vertex_count);
            for (let i = 0; i < poly.triangles.length; i++) {
                triangles[triangle_count + i] = vertex_count / 2 + poly.triangles[i];
            }
            vertex_count += poly.vertices.length;
            triangle_count += poly.triangles.length;
        }
        const outline_triangles = new Float32Array(outline_count * 24);
        const outline_normals = new Float32Array(outline_count * 24);
        outline_count = 0;
        for (const poly of location.coords) {
            for (const part of poly) {
                for (let i = 0; i < part.length; i++) {
                    const curr = part[i];
                    const last = part[(part.length + i - 1) % part.length];
                    const from_last = [curr[0] - last[0], curr[1] - last[1]];
                    const next = part[(i + 1) % part.length];
                    const to_next = [next[0] - curr[0], next[1] - curr[1]];
                    const offset = outline_count * 24 + i * 24;
                    outline_triangles.set([
                        curr[0], curr[1],   curr[0], curr[1],   next[0], next[1], // Line
                        curr[0], curr[1],   next[0], next[1],   next[0], next[1],

                        curr[0], curr[1],   curr[0], curr[1],   curr[0], curr[1], // Corner
                        curr[0], curr[1],   curr[0], curr[1],   curr[0], curr[1],
                    ], offset);
                    outline_normals.set([
                        to_next[1], -to_next[0],   -to_next[1], to_next[0],   to_next[1], -to_next[0],
                        -to_next[1], to_next[0],   -to_next[1], to_next[0],   to_next[1], -to_next[0],

                        -from_last[1], from_last[0], from_last[1], -from_last[0], -to_next[1], to_next[0],
                        -from_last[1], from_last[0], from_last[1], -from_last[0], to_next[1], -to_next[0],
                    ], offset)
                }
                outline_count += part.length;
            }
        }
        return { polygons, vertices, triangles, outline_triangles, outline_normals };
    }

    buildRenderData() {
        const min = this.locations.filter(loc => loc).map(loc => loc.min).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]);
        const max = this.locations.filter(loc => loc).map(loc => loc.max).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
        this.state.min = min;
        this.state.max = max;
        this.locations.forEach(loc => {
            loc.color = loc.color.map(el => el / 255);
            if (loc) {
                if (!location_data_cache[loc.id]) {
                    location_data_cache[loc.id] = this.generateTriangles(loc);
                }
                loc.triangles = location_data_cache[loc.id];
            }
        });
    }

    render() {
        this.buildRenderData();
        return html`
            <canvas
                id="map"
                @mousemove="${this.handleMouseMove}"
                @wheel="${this.handleMouseMove}"
                @mouseout="${this.handleMouseOut}"
                @touchstart="${this.handleTouchStart}"
                @touchmove="${this.handleTouchStart}"
            >
            </canvas>
        `;
    }

}

customElements.define('map-backend', MapBackendWebGl);
