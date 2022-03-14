
import TexturedFragmentShader from './shaders/textured-fragment-shader.glsl';
import TexturedVertexShader from './shaders/textured-vertex-shader.glsl';
import GlowFragmentShader from './shaders/glow-fragment-shader.glsl';
import GlowVertexShader from './shaders/glow-vertex-shader.glsl';

import WebGLRenderer from './webgl-renderer';

const TEXTURE_HEIGHT = 2048;
const TEXTURE_WIDTH = 4096;

const SPHERE_SEGMENTS = 25;

export default class WebGLRenderer3d extends WebGLRenderer {
    projection(array) {
        return [...array];
    }

    applyProjection(_array) {
        // This is a noop
    }

    clientPosToMapPos(client_pos, map_pos, state) {
        return super.clientPosToMapPos(client_pos, map_pos, state);
    }

    clientPosToLocationPos(client_pos, map_pos, state) {
        return super.clientPosToLocationPos(client_pos, map_pos, state);
    }

    locationPosToClientPos(location_pos, map_pos, state) {
        return super.locationPosToClientPos(location_pos, map_pos, state);
    }
    
    generateScale({size, scale: zoom_scale}) {
        let scale;
        if(size[0] < size[1]) {
            scale = [zoom_scale, (size[0] / size[1]) * zoom_scale];
        } else {
            scale = [(size[1] / size[0]) * zoom_scale, zoom_scale];
        }
        return scale;
    }

    generateTransform(state) {
        const {center} = state;
        const scale = this.generateScale(state);
        const alpha = 0;
        const beta = -center[0];
        const gamma = -center[1];
        return [
            Math.cos(alpha) * Math.cos(beta) * scale[0],
            (Math.cos(alpha) * Math.sin(beta) * Math.sin(gamma) - Math.sin(alpha) * Math.cos(gamma)) * scale[1],
            (Math.cos(alpha) * Math.sin(beta) * Math.cos(gamma) + Math.sin(alpha) * Math.sin(gamma)),
            0,

            Math.sin(alpha) * Math.cos(beta) * scale[0],
            (Math.sin(alpha) * Math.sin(beta) * Math.sin(gamma) + Math.cos(alpha) * Math.cos(gamma)) * scale[1],
            (Math.sin(alpha) * Math.sin(beta) * Math.cos(gamma) - Math.cos(alpha) * Math.sin(gamma)),
            0,

            -Math.sin(beta) * scale[0],
            Math.cos(beta) * Math.sin(gamma) * scale[1],
            Math.cos(beta) * Math.cos(gamma),
            0,

            0, 0, 0, 1,
        ];
    }

    normalizePosition([beta, gamma]) {
        gamma = (gamma + Math.PI) % (2 * Math.PI);
        gamma = (2 * Math.PI + gamma) % (2 * Math.PI) - Math.PI;
        if (gamma < -Math.PI / 2) {
            beta += Math.PI;
            gamma = Math.abs(-Math.PI / 2 - gamma) - Math.PI / 2;
        } else if (gamma > Math.PI / 2) {
            beta += Math.PI;
            gamma = Math.PI / 2 - Math.abs(gamma - Math.PI / 2);
        }
        beta = (beta + Math.PI) % (2 * Math.PI);
        beta = (2 * Math.PI + beta) % (2 * Math.PI);
        return [beta - Math.PI, gamma];
    }

    generateTexMinMax(state) {
        const { center } = state;
        const screen_scale = this.generateScale(state);
        const [beta, gamma] = this.normalizePosition(center);
        let res;
        if (1 / (screen_scale[0] * screen_scale[0]) + 1 / (screen_scale[1] * screen_scale[1]) > 1) {
            if (Math.abs(gamma) < 0.1) {
                res = [
                    [0.5 + beta / Math.PI / 2 - 0.26, 0],
                    [0.5 + beta / Math.PI / 2 + 0.26, 1]
                ];
            } else if (gamma > 0) {
                res = [[0, 0], [1, 1 - gamma / Math.PI]];
            } else {
                res = [[0, -gamma / Math.PI], [1, 1]];
            }
        } else if (0.5 - Math.abs(gamma) / Math.PI < Math.max(0.05, 0.5 / screen_scale[1])) {
            if (gamma > 0) {
                res = [[0, 0], [1, 1 - gamma / Math.PI]];
            } else {
                res = [[0, -gamma / Math.PI], [1, 1]];
            }
        } else {
            const size_x = Math.min(0.25, 0.25 * (1 + (Math.abs(gamma) / Math.PI > 0.4 ? 3 : 1) * Math.abs(gamma)) / screen_scale[0]);
            const size_y = Math.min(0.25, 0.25 * (1 + Math.abs(gamma)) / screen_scale[1]);
            res = [
                [0.5 + beta / Math.PI / 2 - size_x, 0.5 - gamma / Math.PI - 2 * size_y],
                [0.5 + beta / Math.PI / 2 + size_x, 0.5 - gamma / Math.PI + 2 * size_y]
            ];
        }
        res[0][0] = (1 + (res[0][0] % 1)) % 1;
        res[1][0] = (1 + (res[1][0] % 1)) % 1;
        if (res[1][0] <= res[0][0]) {
            res[1][0] += 1;
        }
        res[0][1] = Math.min(1, Math.max(0, res[0][1]));
        res[1][1] = Math.min(1, Math.max(0, res[1][1]));
        return res;
    }

    initForContext(canvas, gl, locations) {
        super.initForContext(canvas, gl, locations);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const texture_shader_program = this.createShaderProgram(gl, TexturedVertexShader, TexturedFragmentShader);
        const texture_position_attribute = gl.getAttribLocation(texture_shader_program, 'aVertexPosition');
        const texture_texcoord_attribute = gl.getAttribLocation(texture_shader_program, 'aTextureCoord');
        const texture_transform_uniform = gl.getUniformLocation(texture_shader_program, 'uTransform');
        const texture_sampler_uniform = gl.getUniformLocation(texture_shader_program, 'uSampler');
        const texture_texmin_uniform = gl.getUniformLocation(texture_shader_program, 'uTexMin');
        const texture_texmax_uniform = gl.getUniformLocation(texture_shader_program, 'uTexMax');
        
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
                const alpha = Math.PI * j / (SPHERE_SEGMENTS - 1) - Math.PI / 2;
                const beta = 2 * Math.PI * i / (SPHERE_SEGMENTS - 1);
                sphere_vertices[vertex_count * 3 + 0] = Math.cos(alpha) * Math.sin(beta);
                sphere_vertices[vertex_count * 3 + 1] = Math.sin(alpha);
                sphere_vertices[vertex_count * 3 + 2] = Math.cos(alpha) * Math.cos(beta);
                sphere_texcoord[vertex_count * 2 + 0] = 1 - i / (SPHERE_SEGMENTS - 1);
                sphere_texcoord[vertex_count * 2 + 1] = j / (SPHERE_SEGMENTS - 1);
                vertex_count++;
            }
        }
        const sphere_triangles = new Uint16Array((SPHERE_SEGMENTS - 1) * SPHERE_SEGMENTS * 6);
        let triangle_count = 0;
        for (let j = 0; j < SPHERE_SEGMENTS - 1; j++) {
            for (let i = 0; i < SPHERE_SEGMENTS; i++) {
                sphere_triangles[triangle_count * 3 + 0] = (j + 1) * SPHERE_SEGMENTS + i;
                sphere_triangles[triangle_count * 3 + 1] = j * SPHERE_SEGMENTS + (i + 1) % SPHERE_SEGMENTS;
                sphere_triangles[triangle_count * 3 + 2] = j * SPHERE_SEGMENTS + i;
                sphere_triangles[triangle_count * 3 + 3] = (j + 1) * SPHERE_SEGMENTS + i;
                sphere_triangles[triangle_count * 3 + 4] = (j + 1) * SPHERE_SEGMENTS + (i + 1) % SPHERE_SEGMENTS;
                sphere_triangles[triangle_count * 3 + 5] = j * SPHERE_SEGMENTS + (i + 1) % SPHERE_SEGMENTS;
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

        const glow_shader_program = this.createShaderProgram(gl, GlowVertexShader, GlowFragmentShader);
        const glow_position_attribute = gl.getAttribLocation(glow_shader_program, 'aVertexPosition');
        const glow_scale_uniform = gl.getUniformLocation(glow_shader_program, 'uScale');

        const glow_vertices = new Float32Array(8);
        {
            glow_vertices[0] = -2;
            glow_vertices[1] = 2;
            glow_vertices[2] = 2;
            glow_vertices[3] = 2;
            glow_vertices[4] = 2;
            glow_vertices[5] = -2;
            glow_vertices[6] = -2;
            glow_vertices[7] = -2;
        }
        const glow_triangles = new Uint16Array(6);
        {
            glow_triangles[0] = 0;
            glow_triangles[1] = 1;
            glow_triangles[2] = 2;
            glow_triangles[3] = 2;
            glow_triangles[4] = 3;
            glow_triangles[5] = 0;
        }
        const glow_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, glow_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, glow_vertices, gl.STATIC_DRAW);
        const glow_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glow_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, glow_triangles, gl.STATIC_DRAW);

        this.webgl_data.texture = texture;
        this.webgl_data.texture_data = {
            shader_program: texture_shader_program,
            position_attribute: texture_position_attribute,
            texcoord_attribute: texture_texcoord_attribute,
            transform_uniform: texture_transform_uniform,
            sampler_uniform: texture_sampler_uniform,
            texmin_uniform: texture_texmin_uniform,
            texmax_uniform: texture_texmax_uniform,
        };
        this.webgl_data.sphere_data = {
            vertices: sphere_vertices,
            texcoord: sphere_texcoord,
            triangles: sphere_triangles,
            gl_position_buffer: sphere_position_buffer,
            gl_index_buffer: sphere_index_buffer,
            gl_texcoord_buffer: sphere_texcoord_buffer,
        };
        this.webgl_data.glow_data = {
            shader_program: glow_shader_program,
            position_attribute: glow_position_attribute,
            scale_uniform: glow_scale_uniform,
            vertices: glow_vertices,
            triangles: glow_triangles,
            gl_position_buffer: glow_position_buffer,
            gl_index_buffer: glow_index_buffer,
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

    renderToTexture(locations, state, min, max) {
        const gl = this.webgl_data.context;
        const fill_data = this.webgl_data.fill_data;
        const stroke_data = this.webgl_data.stroke_data;

        const fb = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        const attachment = gl.COLOR_ATTACHMENT0;
        gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, this.webgl_data.texture, 0);
        gl.viewport(0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT);

        const translate = [
            2 * Math.PI * (0.5 - (min[0] + max[0]) / 2),
            Math.PI * (0.5 - (min[1] + max[1]) / 2),
        ];
        const scale = [1 / (max[0] - min[0]) / Math.PI, 2 / (max[1] - min[1]) / Math.PI];
        const stroke_scale = [
            0.5 / (max[0] - min[0]) / state.scale,
            0.5 / (max[1] - min[1]) / state.scale
        ];

        gl.clearColor(0.0, 0.25, 0.55, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (let x = 0; x <= 1; x++) {
            for (let i = 0; i < locations.length; i++) {
                const loc = locations[i];
                const triangles = loc.triangles;
                if (
                    (triangles.min[0] + translate[0]) * scale[0] <= 1
                    && (triangles.max[0] + translate[0]) * scale[0] >= -1
                    && (triangles.min[1] + translate[1]) * scale[1] <= 1
                    && (triangles.max[1] + translate[1]) * scale[1] >= -1
                ) {
                    // Draw stroke
                    gl.useProgram(stroke_data.shader_program);
                    gl.uniform2fv(stroke_data.translate_uniform, translate);
                    gl.uniform2fv(stroke_data.scale_uniform, scale);
                    gl.uniform2fv(stroke_data.scale2_uniform, stroke_scale);
                    gl.uniform1f(stroke_data.width_uniform, 0.005);
                    gl.uniform3fv(stroke_data.color_uniform, [0.271, 0.302, 0.38]);

                    gl.bindBuffer(gl.ARRAY_BUFFER, triangles.gl_outline_normal_buffer);
                    gl.vertexAttribPointer(stroke_data.normal_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(stroke_data.normal_attribute);

                    gl.bindBuffer(gl.ARRAY_BUFFER, triangles.gl_outline_position_buffer);
                    gl.vertexAttribPointer(stroke_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(stroke_data.position_attribute);

                    gl.drawArrays(gl.TRIANGLES, 0, triangles.outline_triangles.length / 2);

                    // Draw fill
                    gl.useProgram(fill_data.shader_program);
                    gl.uniform2fv(fill_data.translate_uniform, translate);
                    gl.uniform2fv(fill_data.scale_uniform, scale);
                    if (loc.id === state.hover) {
                        gl.uniform3fv(fill_data.color_uniform, loc.color.map(el => el * 0.8));
                    } else {
                        gl.uniform3fv(fill_data.color_uniform, loc.color);
                    }
                    gl.bindBuffer(gl.ARRAY_BUFFER, triangles.gl_position_buffer);
                    gl.vertexAttribPointer(fill_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
                    gl.enableVertexAttribArray(fill_data.position_attribute);

                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangles.gl_index_buffer);
                    gl.drawElements(gl.TRIANGLES, triangles.triangles.length, gl.UNSIGNED_SHORT, 0);
                }
            }
            translate[0] += 2 * Math.PI;
        }

        gl.viewport(0, 0, this.webgl_data.canvas.clientWidth, this.webgl_data.canvas.clientHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    renderMapInContext(locations, state) {
        const gl = this.webgl_data.context;
        const tex_data = this.webgl_data.texture_data;
        const sphere_data = this.webgl_data.sphere_data;
        const glow_data = this.webgl_data.glow_data;
        const [min, max] = this.generateTexMinMax(state);

        this.renderToTexture(locations, state, min, max);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Draw sphere
        gl.useProgram(tex_data.shader_program);
        gl.uniformMatrix4fv(tex_data.transform_uniform, false, this.generateTransform(state));
        gl.uniform1i(tex_data.sampler_uniform, 0);
        gl.uniform2fv(tex_data.texmin_uniform, min);
        gl.uniform2fv(tex_data.texmax_uniform, max);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, sphere_data.gl_position_buffer);
        gl.vertexAttribPointer(tex_data.position_attribute, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tex_data.position_attribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, sphere_data.gl_texcoord_buffer);
        gl.vertexAttribPointer(tex_data.texcoord_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(tex_data.texcoord_attribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere_data.gl_index_buffer);
        gl.drawElements(gl.TRIANGLES, sphere_data.triangles.length, gl.UNSIGNED_SHORT, 0);

        // Draw glow
        gl.clear(gl.DEPTH_BUFFER_BIT);
        gl.useProgram(glow_data.shader_program);
        gl.uniform2fv(glow_data.scale_uniform, this.generateScale(state));
        
        gl.bindBuffer(gl.ARRAY_BUFFER, glow_data.gl_position_buffer);
        gl.vertexAttribPointer(glow_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(glow_data.position_attribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, glow_data.gl_index_buffer);
        gl.drawElements(gl.TRIANGLES, glow_data.triangles.length, gl.UNSIGNED_SHORT, 0);
    }
}

