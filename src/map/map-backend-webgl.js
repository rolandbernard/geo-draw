
import { LitElement, html, css } from 'lit-element';
import earcut from 'earcut';

import { map } from '../util';

import FragmentShader from './shaders/fragment-shader.glsl';
import VertexShader from './shaders/vertex-shader.glsl';

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
        this.current_hover = -1;
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

    handleMouseMove(event) {
        // TODO
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
            return [translate, scale];
        } else {
            const translate = [
                -this.min[0] - width / 2 - this.zoom_center[0],
                -this.min[1] - height / 2 - this.zoom_center[1],
            ];
            const scale = [
                2 * (this.current_size[1] / this.current_size[0]) / height * this.zoom_scale,
                -2 /  height * this.zoom_scale,
            ];
            return [translate, scale];
        }
    }

    renderMapInCanvas() {
        if (this.last_center != this.zoom_center
            || this.last_scale != this.zoom_scale
            || this.last_hover != this.current_hover
            || this.last_size != this.current_size) {
            const gl = this.webgl_data.context;
            const position_attribute = this.webgl_data.position_attribute;
            const shader_program = this.webgl_data.shader_program;
            const translate_uniform = this.webgl_data.translate_uniform;
            const scale_uniform = this.webgl_data.scale_uniform;
            const color_uniform = this.webgl_data.color_uniform;

            const [translate, scale] = this.generateTranslateAndScale();
            
            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.useProgram(shader_program);
            gl.uniform2fv(translate_uniform, translate);
            gl.uniform2fv(scale_uniform, scale);
            for(const location of this.locations) {
                gl.uniform3fv(color_uniform, location.color);
                for(const polygon of location.polygons) {    
                    gl.bindBuffer(gl.ARRAY_BUFFER, polygon.gl_position_buffer);
                    gl.vertexAttribPointer(position_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(position_attribute);
                    
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
        
        const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertex_shader, VertexShader);
        gl.compileShader(vertex_shader);

        const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragment_shader, FragmentShader);
        gl.compileShader(fragment_shader);

        const shader_program = gl.createProgram();
        gl.attachShader(shader_program, vertex_shader);
        gl.attachShader(shader_program, fragment_shader);
        gl.linkProgram(shader_program);
        
        const position_attribute = gl.getAttribLocation(shader_program, 'aVertexPosition');
        const translate_uniform = gl.getUniformLocation(shader_program, 'uTranslate');
        const scale_uniform = gl.getUniformLocation(shader_program, 'uScale');
        const color_uniform = gl.getUniformLocation(shader_program, 'uGlobalColor');

        for(const location of this.locations) {
            for(const polygon of location.polygons) {
                const position_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(polygon.vertices), gl.STATIC_DRAW);
                const index_buffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(polygon.triangles), gl.STATIC_DRAW);
                polygon.gl_position_buffer = position_buffer;
                polygon.gl_index_buffer = index_buffer;
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
            shader_program: shader_program,
            position_attribute: position_attribute,
            translate_uniform: translate_uniform,
            scale_uniform: scale_uniform,
            color_uniform: color_uniform,
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
                        vertices: data.vertices,
                        triangles: triangles,
                        min: poly.reduce((a, b) => a.concat(b), [])
                            .reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1])]),
                        max: poly.reduce((a, b) => a.concat(b), [])
                            .reduce((a, b) => [Math.max(a[0], b[0]), Math.max(a[1], b[1])]),
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