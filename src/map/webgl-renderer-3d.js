
import TexturedFragmentShader from './shaders/textured-fragment-shader.glsl';
import TexturedVertexShader from './shaders/textured-vertex-shader.glsl';

import WebGLRenderer from './webgl-renderer';

const TEXTURE_HEIGHT = 1024;
const TEXTURE_WIDTH = 2048;

const SPHERE_SEGMENTS = 5;

export default class WebGLRenderer3d extends WebGLRenderer {
    clientPosToMapPos(client_pos, map_pos, state) {
        return super.clientPosToMapPos(client_pos, map_pos, state);
    }

    clientPosToLocationPos(client_pos, map_pos, state) {
        return super.clientPosToLocationPos(client_pos, map_pos, state);
    }

    locationPosToClientPos(location_pos, map_pos, state) {
        return super.locationPosToClientPos(location_pos, map_pos, state);
    }
    
    generateScaleTransform({size, scale: zoom_scale}) {
        let scale;
        if(size[0] < size[1]) {
            scale = [zoom_scale, (size[0] / size[1]) * zoom_scale];
        } else {
            scale = [(size[1] / size[0]) * zoom_scale, zoom_scale];
        }
        return [
            scale[0], 0, 0, 0,
            0, scale[1], 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    }

    generateTransform(state) {
        const {center} = state;
        const scale_transform = this.generateScaleTransform(state);
        const alpha = 0;
        const beta = -center[0] - Math.PI / 2;
        const gamma = center[1];
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

    initForContext(canvas, gl, locations) {
        super.initForContext(canvas, gl, locations);
        const texture_shader_program = this.createShaderProgram(gl, TexturedVertexShader, TexturedFragmentShader);
        const texture_position_attribute = gl.getAttribLocation(texture_shader_program, 'aVertexPosition');
        const texture_texcoord_attribute = gl.getAttribLocation(texture_shader_program, 'aTextureCoord');
        const texture_transform_uniform = gl.getUniformLocation(texture_shader_program, 'uTransform');
        const texture_sampler_uniform = gl.getUniformLocation(texture_shader_program, 'uSampler');
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEXTURE_WIDTH, TEXTURE_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const sphere_vertices = new Float32Array(SPHERE_SEGMENTS * SPHERE_SEGMENTS * 3);
        const sphere_texcoord = new Float32Array(SPHERE_SEGMENTS * SPHERE_SEGMENTS * 2);
        let vertex_count = 0;
        for (let j = 0; j < SPHERE_SEGMENTS; j++) {
            for (let i = 0; i < SPHERE_SEGMENTS; i++) {
                const alpha = Math.PI * j / (SPHERE_SEGMENTS - 1);
                const beta = 2 * Math.PI * i / SPHERE_SEGMENTS;
                const cos = Math.cos(alpha);
                sphere_vertices[vertex_count * 3 + 0] = cos * Math.cos(beta);
                sphere_vertices[vertex_count * 3 + 1] = cos * Math.sin(beta);
                sphere_vertices[vertex_count * 3 + 2] = Math.sin(alpha);
                sphere_texcoord[vertex_count * 2 + 0] = j / (SPHERE_SEGMENTS - 1);
                sphere_texcoord[vertex_count * 2 + 1] = i / SPHERE_SEGMENTS;
                vertex_count++;
            }
        }
        const sphere_triangles = new Uint16Array((SPHERE_SEGMENTS - 1) * SPHERE_SEGMENTS * 6);
        let triangle_count = 0;
        for (let j = 0; j < SPHERE_SEGMENTS - 1; j++) {
            for (let i = 0; i < SPHERE_SEGMENTS; i++) {
                sphere_triangles[triangle_count * 6 + 0] = (j + 1) * SPHERE_SEGMENTS + i;
                sphere_triangles[triangle_count * 6 + 1] = j * SPHERE_SEGMENTS + (i + 1) % SPHERE_SEGMENTS;
                sphere_triangles[triangle_count * 6 + 2] = j * SPHERE_SEGMENTS + i;
                sphere_triangles[triangle_count * 6 + 3] = (j + 1) * SPHERE_SEGMENTS + i;
                sphere_triangles[triangle_count * 6 + 4] = (j + 1) * SPHERE_SEGMENTS + (i + 1) % SPHERE_SEGMENTS;
                sphere_triangles[triangle_count * 6 + 5] = j * SPHERE_SEGMENTS + (i + 1) % SPHERE_SEGMENTS;
                triangle_count += 2;
            }
        }
        const sphere_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphere_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, sphere_vertices, gl.STATIC_DRAW);
        const sphere_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere_triangles, gl.STATIC_DRAW);
        const sphere_texcoord_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, sphere_texcoord_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, sphere_texcoord, gl.STATIC_DRAW);

        this.webgl_data.texture = texture;
        this.webgl_data.texture_data = {
            shader_program: texture_shader_program,
            position_attribute: texture_position_attribute,
            texcoord_attribute: texture_texcoord_attribute,
            transform_uniform: texture_transform_uniform,
            sampler_uniform: texture_sampler_uniform,
        };
        this.webgl_data.sphere_data = {
            vertices: sphere_vertices,
            texcoord: sphere_texcoord,
            triangles: sphere_triangles,
            gl_position_buffer: sphere_position_buffer,
            gl_index_buffer: sphere_index_buffer,
            gl_texcoord_buffer: sphere_texcoord_buffer,
        };
    }

    deinitResources(locations) {
        gl.deleteTexture(this.webgl_data.texture);
        gl.deleteBuffer(this.webgl_data.sphere_data.gl_position_buffer);
        gl.deleteBuffer(this.webgl_data.sphere_data.gl_index_buffer);
        gl.deleteBuffer(this.webgl_data.sphere_data.gl_texcoord_buffer);
        gl.getAttachedShaders(this.webgl_data.texture_data.shader_program).forEach(s => {
            gl.deleteShader(s);
        });
        gl.deleteProgram(this.webgl_data.texture_data.shader_program);
        super.deinitResources(locations);
    }

    renderToTexture(locations, state) {
        if (!this.last || this.last.hover != state.hover) {
            const gl = this.webgl_data.context;
            const fb = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
            const attachment = gl.COLOR_ATTACHMENT0;
            gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, this.webgl_data.texture, 0);
            gl.viewport(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);
            super.renderMapInContext(locations, {
                ...state,
                min: [0, 0], max: [6.283185307179586, 3.141592653589793],
                size: [TEXTURE_WIDTH, TEXTURE_HEIGHT],
                center: [3.141592653589793, 1.5707963267948966],
                scale: 1
            }, [0.1, 0.2, 0.5, 1.0]);
            gl.viewport(0, 0, this.webgl_data.canvas.clientWidth, this.webgl_data.canvas.clientHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.last = { hover: state.hover };
        }
    }

    renderMapInContext(locations, state) {
        const gl = this.webgl_data.context;
        const tex_data = this.webgl_data.texture_data;
        const sphere_data = this.webgl_data.sphere_data;
        this.renderToTexture(locations, state);
        
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        // Draw sphere
        gl.useProgram(tex_data.shader_program);
        gl.uniformMatrix4fv(tex_data.transform_uniform, false, this.generateTransform(state));
        gl.uniform1i(tex_data.sampler_uniform, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, sphere_data.gl_position_buffer);
        gl.vertexAttribPointer(tex_data.position_attribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tex_data.position_attribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphere_data.gl_texcoord_buffer);
        gl.vertexAttribPointer(tex_data.texcoord_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tex_data.texcoord_attribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_data.gl_index_buffer);
        gl.drawElements(gl.TRIANGLES, sphere_data.triangles.length, gl.UNSIGNED_SHORT, 0);
    }
}

