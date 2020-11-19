
import { LitElement, html, css } from 'lit-element';
import earcut from 'earcut';

import { map } from '../util';

import FillFragmentShader from './shaders/fill-fragment-shader.glsl';
import FillVertexShader from './shaders/fill-vertex-shader.glsl';
import StrokeFragmentShader from './shaders/stroke-fragment-shader.glsl';
import StrokeVertexShader from './shaders/stroke-vertex-shader.glsl';

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
        this.zoom_scale = 1;
        this.zoom_center = [0, 0];
        this.min = [0, 0];
        this.max = [0, 0];
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
        const [_, scale] = this.generateTranslateAndScale();
        const client_pos_norm = [
            2 * client_pos[0] / this.current_size[0] - 1.0,
            1.0 - 2 * client_pos[1] / this.current_size[1],
        ];
        return [
            client_pos_norm[0] / scale[0] - map_pos.x + this.zoom_center[0],
            client_pos_norm[1] / scale[1] - map_pos.y + this.zoom_center[1],
        ];
    }

    clientPosToLocationPos(client_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        const [transform, scale] = this.generateTranslateAndScale();
        const client_pos_norm = [
            2 * client_pos[0] / map_pos.width - 1.0,
            1.0 - 2 * client_pos[1] / map_pos.height,
        ];
        return [
            client_pos_norm[0] / scale[0] - map_pos.x - transform[0],
            client_pos_norm[1] / scale[1] - map_pos.y - transform[1],
        ];
    }
    
    locationPosToClientPos(location_pos) {
        const map = this.shadowRoot.getElementById('map');
        const map_pos = map.getBoundingClientRect();
        const [transform, scale] = this.generateTranslateAndScale();
        const client_pos_norm = [
            (location_pos[0] + transform[0] + map_pos.x) * scale[0],
            (location_pos[1] + transform[1] + map_pos.y) * scale[1],
        ];
        return [
            (client_pos_norm[0] + 1.0) / 2 * map_pos.width,
            (1.0 - client_pos_norm[1]) / 2 * map_pos.height,
        ];
    }

    handleMouseMove(event) {
        const pos = this.clientPosToLocationPos([event.clientX, event.clientY]);
        for(const location of this.locations) {
            if(location.min[0] <= pos[0] && location.min[1] <= pos[1] &&
                location.max[0] >= pos[0] && location.max[1] >= pos[1]) {
                for(const polygon of location.polygons) {
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
                                this.current_hover = location;
                                const my_event = new Event('hover');
                                my_event.location = location;
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
        this.current_hover = null;
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

    generateTranslateAndScale() {
        const width = this.max[0] - this.min[0];
        const height = this.max[1] - this.min[1];
        if(width / this.current_size[0] > height / this.current_size[1]) {
            const translate = [
                -this.min[0] - width / 2 - this.zoom_center[0],
                -this.min[1] - height / 2 - this.zoom_center[1],
            ];
            const scale = [
                2 / width * this.zoom_scale,
                -2 * (this.current_size[0] / this.current_size[1]) / width * this.zoom_scale,
            ];
            const stroke_scale = [
                1,
                -this.current_size[0] / this.current_size[1],
            ];
            return [translate, scale, stroke_scale];
        } else {
            const translate = [
                -this.min[0] - width / 2 - this.zoom_center[0],
                -this.min[1] - height / 2 - this.zoom_center[1],
            ];
            const scale = [
                2 * (this.current_size[1] / this.current_size[0]) / height * this.zoom_scale,
                -2 /  height * this.zoom_scale,
            ];
            const stroke_scale = [
                this.current_size[1] / this.current_size[0],
                -1,
            ];
            return [translate, scale, stroke_scale];
        }
    }

    renderMapInCanvas() {
        if (this.last_center != this.zoom_center
            || this.last_scale != this.zoom_scale
            || this.last_hover != this.current_hover
            || this.last_size != this.current_size) {
            const gl = this.webgl_data.context;
            const fill_data = this.webgl_data.fill_data;
            const stroke_data = this.webgl_data.stroke_data;

            const [translate, scale, stroke_scale] = this.generateTranslateAndScale();
            
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            for(const location of this.locations) {
                // Draw stroke
                gl.useProgram(stroke_data.shader_program);
                gl.uniform2fv(stroke_data.translate_uniform, translate);
                gl.uniform2fv(stroke_data.scale_uniform, scale);
                gl.uniform2fv(stroke_data.scale2_uniform, stroke_scale);
                gl.uniform1f(stroke_data.width_uniform, 0.005);
                gl.uniform3fv(stroke_data.color_uniform, [0.271, 0.302, 0.38]);
                for(const polygon of location.polygons) {    
                    gl.bindBuffer(gl.ARRAY_BUFFER, polygon.gl_outline_position_buffer);
                    gl.vertexAttribPointer(stroke_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(stroke_data.position_attribute);

                    gl.bindBuffer(gl.ARRAY_BUFFER, polygon.gl_outline_normal_buffer);
                    gl.vertexAttribPointer(stroke_data.normal_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(stroke_data.normal_attribute);
                    
                    let offset = 0;
                    for(const part of polygon.coords) {
                        gl.drawArrays(gl.TRIANGLE_STRIP, offset, (part.length + 1) * 4);
                        offset += part.length + 1;
                    }
                }
                // Draw fill
                gl.useProgram(fill_data.shader_program);
                gl.uniform2fv(fill_data.translate_uniform, translate);
                gl.uniform2fv(fill_data.scale_uniform, scale);
                if(location === this.current_hover) {
                    gl.uniform3fv(fill_data.color_uniform, location.color.map(el => el * 0.8));
                } else {
                    gl.uniform3fv(fill_data.color_uniform, location.color);
                }
                for(const polygon of location.polygons) {    
                    gl.bindBuffer(gl.ARRAY_BUFFER, polygon.gl_position_buffer);
                    gl.vertexAttribPointer(fill_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(fill_data.position_attribute);
                    
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, polygon.gl_index_buffer);
                    
                    gl.drawElements(gl.TRIANGLES, polygon.triangles.length, gl.UNSIGNED_SHORT, 0);
                }
            }
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
        const fill_translate_uniform = gl.getUniformLocation(fill_shader_program, 'uTranslate');
        const fill_scale_uniform = gl.getUniformLocation(fill_shader_program, 'uScale');
        const fill_color_uniform = gl.getUniformLocation(fill_shader_program, 'uFillColor');

        const stroke_shader_program = createShaderProgram(StrokeVertexShader, StrokeFragmentShader);
        const stroke_position_attribute = gl.getAttribLocation(stroke_shader_program, 'aVertexPosition');
        const stroke_normal_attribute = gl.getAttribLocation(stroke_shader_program, 'aVertexNormal');
        const stroke_translate_uniform = gl.getUniformLocation(stroke_shader_program, 'uTranslate');
        const stroke_scale_uniform = gl.getUniformLocation(stroke_shader_program, 'uScale');
        const stroke_scale2_uniform = gl.getUniformLocation(stroke_shader_program, 'uStrokeScale');
        const stroke_width_uniform = gl.getUniformLocation(stroke_shader_program, 'uWidth');
        const stroke_color_uniform = gl.getUniformLocation(stroke_shader_program, 'uStrokeColor');

        for(const location of this.locations) {
            for(const polygon of location.polygons) {
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
                translate_uniform: fill_translate_uniform,
                scale_uniform: fill_scale_uniform,
                color_uniform: fill_color_uniform,
            },
            stroke_data: {
                shader_program: stroke_shader_program,
                position_attribute: stroke_position_attribute,
                normal_attribute: stroke_normal_attribute,
                translate_uniform: stroke_translate_uniform,
                scale_uniform: stroke_scale_uniform,
                scale2_uniform: stroke_scale2_uniform,
                width_uniform: stroke_width_uniform,
                color_uniform: stroke_color_uniform,
            },
        };
        this.renderMapInCanvas();
    }
    
    render() {
        const min = this.locations.filter(loc => loc).map(loc => loc.min).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]);
        const max = this.locations.filter(loc => loc).map(loc => loc.max).reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]);
        this.min = min;
        this.max = max;
        this.locations.forEach(loc => {
            if(loc) {
                loc.color = loc.color.map(el => el / 255);
                loc.polygons = loc.coords.map(poly => {
                    const data = earcut.flatten(poly);
                    const triangles = earcut(data.vertices, data.holes, data.dimensions);
                    return {
                        coords: poly,
                        vertices: data.vertices,
                        triangles: triangles,
                        outline_vertices: poly.map(part => (
                            part.reduce((arr,coord) => arr.concat([coord, coord, coord, coord]), [])
                                .concat([part[0], part[0], part[0], part[0]])
                        )).flat(3),
                        outline_normals: poly.map(part => (
                            part.reduce((arr,coord,i) => {
                                const last = part[(part.length + i - 1) % part.length];
                                const from_last = [coord[0] - last[0], coord[1] - last[1]];
                                const next = part[(i + 1) % part.length];
                                const to_next = [next[0] - coord[0], next[1] - coord[1]];
                                return arr.concat([
                                    [from_last[1], -from_last[0]],
                                    [-from_last[1], from_last[0]],
                                    [to_next[1], -to_next[0]],
                                    [-to_next[1], to_next[0]],
                                ]);
                            }, []).concat((() => {
                                const coord = part[0]
                                const last = part[part.length - 1];
                                const from_last = [coord[0] - last[0], coord[1] - last[1]];
                                const next = part[1];
                                const to_next = [next[0] - coord[0], next[1] - coord[1]];
                                return [
                                    [from_last[1], -from_last[0]],
                                    [-from_last[1], from_last[0]],
                                    [to_next[1], -to_next[0]],
                                    [-to_next[1], to_next[0]],
                                ];
                            })())
                        )).flat(3),
                        min: poly.flat().reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
                        max: poly.flat().reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
                    }
                });
            }
        });
        return html`
            <canvas
                id="map"
                @mousemove="${this.handleMouseMove}"
                @mouseout="${this.handleMouseOut}"
                @touchstart="${this.handleTouchStart}"
            >
            </canvas>
        `;
    }

}

customElements.define('map-backend', MapBackendWebGl);
