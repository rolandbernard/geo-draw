
import { LitElement, html, css } from 'lit-element';
import earcut from 'earcut';

import FillFragmentShader from './shaders3d/fill-fragment-shader.glsl';
import FillVertexShader from './shaders3d/fill-vertex-shader.glsl';

const location_data_cache = {};

class MapBackend3d extends LitElement {

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
        this.zoom_scale = 1;
        this.zoom_center = [0, 0];
        this.current_hover = null;
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
    }
    
    clientPosToMapPos(client_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        const client_pos_norm = [
            2 * (client_pos[0] - map_pos.x) / map_pos.width - 1.0,
            1.0 - 2 * (client_pos[1] - map_pos.y) / map_pos.height,
        ];
        return [
            client_pos_norm[0] * this.zoom_scale + this.zoom_center[0],
            client_pos_norm[1] * this.zoom_scale + this.zoom_center[1],
        ];
    }

    clientPosToLocationPos(client_pos) {
        // const map = this.shadowRoot.getElementById('map');
        // const map_pos = map.getBoundingClientRect();
        // const [transform, scale] = this.generateTranslateAndScale();
        // const client_pos_norm = [
        //     2 * (client_pos[0] - map_pos.x) / map_pos.width - 1.0,
        //     1.0 - 2 * (client_pos[1] - map_pos.y) / map_pos.height,
        // ];
        // return [
        //     client_pos_norm[0] / scale[0] - transform[0],
        //     client_pos_norm[1] / scale[1] - transform[1],
        // ];
    }
    
    locationPosToClientPos(location_pos) {
        // const map= this.shadowRoot.getElementById('map');
        // const map_pos = map.getBoundingClientRect();
        // const [transform, scale] = this.generateTranslateAndScale();
        // const client_pos_norm = [
        //     (location_pos[0] + transform[0]) * scale[0],
        //     (location_pos[1] + transform[1]) * scale[1],
        // ];
        // return [
        //     (client_pos_norm[0] + 1.0) / 2 * map_pos.width + map_pos.x,
        //     (1.0 - client_pos_norm[1]) / 2 * map_pos.height + map_pos.y,
        // ];
    }

    handleMouseMove(event) {
        // const pos = this.clientPosToLocationPos([event.clientX, event.clientY]);
        // for(const loc of this.locations) {
        //     if(loc.raw_min[0] <= pos[0] && loc.raw_min[1] <= pos[1] &&
        //         loc.raw_max[0] >= pos[0] && loc.raw_max[1] >= pos[1]) {
        //         const location = location_data_cache[loc.id];
        //         for(const polygon of location.polygons) {
        //             if(polygon.min[0] <= pos[0] && polygon.min[1] <= pos[1] &&
        //                 polygon.max[0] >= pos[0] && polygon.max[1] >= pos[1]) {
        //                 for(let i = 0; i < polygon.triangles.length; i += 3) {
        //                     const v1 = [
        //                         polygon.vertices[2 * polygon.triangles[i]],
        //                         polygon.vertices[2 * polygon.triangles[i] + 1]
        //                     ];
        //                     const v2 = [
        //                         polygon.vertices[2 * polygon.triangles[i + 1]],
        //                         polygon.vertices[2 * polygon.triangles[i + 1] + 1]
        //                     ];
        //                     const v3 = [
        //                         polygon.vertices[2 * polygon.triangles[i + 2]],
        //                         polygon.vertices[2 * polygon.triangles[i + 2] + 1]
        //                     ];
        //                     function sign(p1, p2, p3) {
        //                         return (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
        //                     }
        //                     const d1 = sign(pos, v1, v2);
        //                     const d2 = sign(pos, v2, v3);
        //                     const d3 = sign(pos, v3, v1);
        //                     const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
        //                     const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
        //                     if(!(has_neg && has_pos)) {
        //                         this.current_hover = loc.id;
        //                         const my_event = new Event('hover');
        //                         my_event.location = loc;
        //                         my_event.position = this.locationPosToClientPos([
        //                             (polygon.min[0] + polygon.max[0]) / 2,
        //                             (polygon.min[1] + polygon.max[1]) / 2
        //                         ]);
        //                         this.dispatchEvent(my_event);
        //                         return;
        //                     }
        //                 }
        //             }
        //         }
        //     }
        // }
        // this.handleMouseOut();
    }

    handleMouseOut() {
        // this.current_hover = null;
        // const my_event = new Event('hover');
        // my_event.location = null;
        // my_event.position = null;
        // this.dispatchEvent(my_event);
    }
    
    handleTouchStart(event) {
        // if(event.touches.length === 1) {
        //     this.handleMouseMove({
        //         clientX: event.touches[0].clientX,
        //         clientY: event.touches[0].clientY,
        //     });
        // } else {
        //     this.handleMouseOut(event);
        // }
    }

    generateScaleTransform() {
        let scale;
        if(this.current_size[0] < this.current_size[1]) {
            scale = [
                this.zoom_scale,
                (this.current_size[0] / this.current_size[1]) * this.zoom_scale,
            ];
        } else {
            scale = [
                (this.current_size[1] / this.current_size[0]) * this.zoom_scale,
                this.zoom_scale,
            ];
        }
        return [
            scale[0], 0, 0, 0,
            0, scale[1], 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }

    generateTransform() {
        const scale_transform = this.generateScaleTransform();
        const alpha = 0;
        const beta = -this.zoom_center[0] - Math.PI / 2;
        const gamma = this.zoom_center[1];
        return [
            Math.cos(alpha) * Math.cos(beta) * scale_transform[0],
            (Math.cos(alpha) * Math.sin(beta) * Math.sin(gamma) - Math.sin(alpha) * Math.cos(gamma)) * scale_transform[5],
            (Math.cos(alpha) * Math.sin(beta) * Math.cos(gamma) + Math.sin(alpha) * Math.sin(gamma)) * scale_transform[10],
            0,

            Math.sin(alpha) * Math.cos(beta) * scale_transform[0],
            (Math.sin(alpha) * Math.sin(beta) * Math.sin(gamma) + Math.cos(alpha) * Math.cos(gamma)) * scale_transform[5],
            (Math.sin(alpha) * Math.sin(beta) * Math.cos(gamma) - Math.cos(alpha) * Math.sin(gamma)) * scale_transform[10],
            0,

            -Math.sin(beta) * scale_transform[0],
            Math.cos(beta) * Math.sin(gamma) * scale_transform[5],
            Math.cos(beta) * Math.cos(gamma) * scale_transform[10],
            0,

            0, 0, 0, 1,
        ];
    }

    renderMapInCanvas() {
        if (true || this.last_center != this.zoom_center
            || this.last_scale != this.zoom_scale
            || this.last_hover != this.current_hover
            || this.last_size != this.current_size) {
            const gl = this.webgl_data.context;
            const fill_data = this.webgl_data.fill_data;
            const transform = this.generateTransform();
            const scale_transform = this.generateScaleTransform();

            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clearDepth(1);
            gl.clear(gl.COLOR_BUFFER_BIT);

            for(const loc of this.locations) {
                const location = location_data_cache[loc.id];
                // Draw fill
                gl.useProgram(fill_data.shader_program);
                if(loc.id === this.current_hover) {
                    gl.uniform3fv(fill_data.color_uniform, loc.color.map(el => el * 0.8));
                } else {
                    gl.uniform3fv(fill_data.color_uniform, loc.color);
                }
                gl.uniformMatrix4fv(fill_data.transform_uniform, false, transform);
                for(const polygon of location.polygons) {    
                    gl.bindBuffer(gl.ARRAY_BUFFER, polygon.gl_position_buffer);
                    gl.vertexAttribPointer(fill_data.position_attribute, 3, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(fill_data.position_attribute);
                    
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polygon.gl_index_buffer);
                    
                    gl.drawElements(gl.TRIANGLES, polygon.triangles.length, gl.UNSIGNED_SHORT, 0);
                }
            }
            // Draw sphere
            gl.useProgram(fill_data.shader_program);
            gl.uniform3fv(fill_data.color_uniform, [0, 0, 0.75]);
            gl.uniformMatrix4fv(fill_data.transform_uniform, false, scale_transform);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.gl_position_buffer);
            gl.vertexAttribPointer(fill_data.position_attribute, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(fill_data.position_attribute);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphere.gl_index_buffer);
            gl.drawElements(gl.TRIANGLES, this.sphere.triangles.length, gl.UNSIGNED_SHORT, 0);

            // Set last render values
            this.last_center = this.zoom_center;
            this.last_scale = this.zoom_scale;
            this.last_hover = this.current_hover;
            this.last_size = this.current_size;
        }
        window.requestAnimationFrame(this.renderMapInCanvas.bind(this));
    }

    firstUpdated() {
        const canvas = this.shadowRoot.getElementById('map');
        this.current_size = [canvas.width, canvas.height];
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        gl.enable(gl.DEPTH_TEST);
        
        function createShaderProgram(vertex_shader_source, fragment_shader_source) {
            const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vertex_shader, vertex_shader_source);
            gl.compileShader(vertex_shader);
            const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fragment_shader, fragment_shader_source);
            gl.compileShader(fragment_shader);
            const shader_program = gl.createProgram();
            gl.attachShader(shader_program, vertex_shader);
            gl.attachShader(shader_program, fragment_shader);
            gl.linkProgram(shader_program);
            return shader_program;
        }

        const fill_shader_program = createShaderProgram(FillVertexShader, FillFragmentShader);
        const fill_position_attribute = gl.getAttribLocation(fill_shader_program, 'aVertexPosition');
        const fill_transform_uniform = gl.getUniformLocation(fill_shader_program, 'uTransform');
        const fill_color_uniform = gl.getUniformLocation(fill_shader_program, 'uFillColor');

        for(const location of this.locations) {
            for(const polygon of location_data_cache[location.id].polygons) {
                const position_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygon.vertices), gl.STATIC_DRAW);
                const index_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(polygon.triangles), gl.STATIC_DRAW);
                const outline_position_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, outline_position_buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygon.outline_vertices), gl.STATIC_DRAW);
                const outline_normal_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, outline_normal_buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygon.outline_normals), gl.STATIC_DRAW);
                polygon.gl_position_buffer = position_buffer;
                polygon.gl_index_buffer = index_buffer;
                polygon.gl_outline_position_buffer = outline_position_buffer;
                polygon.gl_outline_normal_buffer = outline_normal_buffer;
            }
        }
        this.sphere.gl_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.sphere.gl_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sphere.vertecies), gl.STATIC_DRAW);
        this.sphere.gl_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.sphere.gl_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.sphere.triangles), gl.STATIC_DRAW);

        const handleResize = () => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            this.current_size = [canvas.width, canvas.height];
        }
        window.addEventListener('resize', handleResize);
        handleResize();

        this.webgl_data = {
            canvas: canvas,
            context: gl,
            fill_data: {
                shader_program: fill_shader_program,
                position_attribute: fill_position_attribute,
                transform_uniform: fill_transform_uniform,
                color_uniform: fill_color_uniform,
            },
        };
        this.renderMapInCanvas();
    }

    disconnectedCallback() {
        if (this.webgl_data?.context) {
            const gl = this.webgl_data.context;
            for (const location of this.locations) {
                for (const polygon of location_data_cache[location.id].polygons) {
                    gl.deleteBuffer(polygon.gl_position_buffer);
                    gl.deleteBuffer(polygon.gl_index_buffer);
                    gl.deleteBuffer(polygon.gl_outline_position_buffer);
                    gl.deleteBuffer(polygon.gl_outline_normal_buffer);
                }
            }
            gl.deleteBuffer(this.sphere.gl_position_buffer);
            gl.deleteBuffer(this.sphere.gl_index_buffer);
            gl.getAttachedShaders(this.webgl_data.fill_data.shader_program).forEach(s => {
                gl.deleteShader(s);
            });
            gl.deleteProgram(this.webgl_data.fill_data.fill_shader_program);
        }
    }

    static project([longitude, latitude]) {
        const lon = longitude / 180 / 1e7 * Math.PI;
        const lat = latitude / 180 / 1e7 * Math.PI;
        const x = Math.cos(lat) * Math.cos(lon);
        const y = Math.cos(lat) * Math.sin(lon);
        const z = Math.sin(lat);
        return [x, z, y];
    }

    buildRenderData() {
        this.locations.forEach(loc => {
            loc.raw_min = loc.raw_coords.flat(2).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]);
            loc.raw_max = loc.raw_coords.flat(2).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
            loc.color = loc.color.map(el => el / 255);
            if(loc && !location_data_cache[loc.id]) {
                location_data_cache[loc.id] = {
                    polygons: loc.raw_coords
                        .map(poly => poly.map(part => part.map(MapBackend3d.project)))
                        .map(poly => {
                            const data = earcut.flatten(poly);
                            const triangles = earcut(data.vertices, data.holes, data.dimensions);
                            return {
                                coords: poly,
                                vertices: data.vertices,
                                triangles: triangles,
                                min: poly.flat().reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
                                max: poly.flat().reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
                            }
                        }),
                };
            }
        });
        this.sphere = {
            vertecies: [ 0, 0, 0 ],
            triangles: [ ],
        };
        const N = 100;
        for (let i = 0; i < N; i++) {
            this.sphere.vertecies.push(Math.sin(2 * Math.PI * i / N), Math.cos(2 * Math.PI * i / N), 0);
        }
        for (let i = 0; i < N; i++) {
            this.sphere.triangles.push(0, i + 1, (i + 1) % N + 1);
        }
        console.log(this.sphere.vertecies);
        console.log(this.sphere.triangles);
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

customElements.define('map-backend-3d', MapBackend3d);
