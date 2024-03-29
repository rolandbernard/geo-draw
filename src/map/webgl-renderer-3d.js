
import EarthFragmentShader from './shaders/earth-fragment-shader.glsl';
import EarthVertexShader from './shaders/earth-vertex-shader.glsl';

import WebGLRenderer from './webgl-renderer';

const TEXTURE_HEIGHT = 2048;
const TEXTURE_WIDTH = 4096;

export default class WebGLRenderer3d extends WebGLRenderer {
    project() {
        return false;
    }

    clientPosToSpherePos(client_pos, map_pos, state) {
        const scale = this.generateScale(state);
        const pos = [
            (2 * (client_pos[0] - map_pos.x) / map_pos.width - 1.0) / scale[0],
            (1.0 - 2 * (client_pos[1] - map_pos.y) / map_pos.height) / scale[1],
            0
        ];
        pos[2] = 1 - pos[0] * pos[0] - pos[1] * pos[1];
        if (pos[2] < 0) {
            const dist = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1]);
            pos[0] /= dist;
            pos[1] /= dist;
            pos[2] = 0;
        } else {
            pos[2] = Math.sqrt(pos[2]);
        }
        return pos;
    }

    clientPosToSomePos(client_pos, map_pos, state) {
        const pos = this.clientPosToSpherePos(client_pos, map_pos, state)
        const position = this.mat3VecMul(this.generateTransform(state), pos)
        const coord = [
            Math.atan2(position[0], position[2]),
            Math.atan2(position[1], Math.sqrt(position[0] * position[0] + position[2] * position[2])),
        ];
        return coord;
    }

    normalizeAround(x, a) {
        if (x < a - Math.PI) {
            return x + 2 * Math.PI * Math.floor((a + Math.PI - x) / (2 * Math.PI));
        } else if (x > a + Math.PI) {
            return x - 2 * Math.PI * Math.floor((x + Math.PI - a) / (2 * Math.PI));
        } else {
            return x;
        }
    }

    clientPosToMapPos(client_pos, map_pos, state) {
        const { center } = state;
        const pos = this.clientPosToSpherePos(client_pos, map_pos, state)
        const coord = center[1] + Math.atan2(pos[1], Math.sqrt(pos[0] * pos[0] + pos[2] * pos[2]));
        const proj = this.clientPosToSomePos(client_pos, map_pos, state);
        return [this.normalizeAround(proj[0], center[0]), coord];
    }

    clientPosToProjPos(client_pos, map_pos, state) {
        return this.normalizePosition(this.clientPosToSomePos(client_pos, map_pos, state));
    }

    projPosToClientPos(proj_pos, map_pos, state) {
        const position = [
            Math.cos(proj_pos[1]) * Math.sin(proj_pos[0]),
            Math.sin(proj_pos[1]),
            Math.cos(proj_pos[1]) * Math.cos(proj_pos[0]),
        ];
        const pos = this.mat3VecMul(this.generateInverseTransform(state), position)
        if (pos[2] < 0) {
            const dist = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1]);
            pos[0] /= dist;
            pos[1] /= dist;
            pos[2] = 0;
        }
        const scale = this.generateScale(state);
        return [
            (pos[0] * scale[0] + 1) / 2 * map_pos.width + map_pos.x,
            (1 - pos[1] * scale[1]) / 2 * map_pos.height + map_pos.y
        ];
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

    mat3Mul(a, b) {
        const res = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                for (let k = 0; k < 3; k++) {
                    res[3*i + j] += a[3*i + k] * b[3*k + j];
                }
            }
        }
        return res;
    }

    mat3VecMul(a, v) {
        const res = [0, 0, 0];
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                res[i] += a[3*j + i] * v[j];
            }
        }
        return res;
    }

    mat3Rotation(axis, angle) {
        const res = [0, 0, 0, 0, 0, 0, 0, 0, 0];
        res[3*axis + axis] = 1;
        res[3*((axis + 1) % 3) + (axis + 1) % 3] = Math.cos(angle);
        res[3*((axis + 2) % 3) + (axis + 1) % 3] = Math.sin(angle);
        res[3*((axis + 1) % 3) + (axis + 2) % 3] = -Math.sin(angle);
        res[3*((axis + 2) % 3) + (axis + 2) % 3] = Math.cos(angle);
        return res;
    }

    generateTransform(state) {
        const { center } = state;
        return this.mat3Mul(this.mat3Rotation(0, center[1]), this.mat3Rotation(1, -center[0]))
    }

    generateInverseTransform(state) {
        const { center } = state;
        return this.mat3Mul(this.mat3Rotation(1, center[0]), this.mat3Rotation(0, -center[1]))
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
            } else if (gamma < 0) {
                res = [[0, 0], [1, 1 + gamma / Math.PI]];
            } else {
                res = [[0, gamma / Math.PI], [1, 1]];
            }
        } else if (0.5 - Math.abs(gamma) / Math.PI < Math.max(0.05, 0.5 / screen_scale[1])) {
            if (gamma < 0) {
                res = [[0, 0], [1, 1 + gamma / Math.PI]];
            } else {
                res = [[0, gamma / Math.PI], [1, 1]];
            }
        } else {
            const size_x = Math.min(0.25, 0.25 * (1 + (Math.abs(gamma) / Math.PI > 0.4 ? 3 : 1) * Math.abs(gamma)) / screen_scale[0]);
            const size_y = Math.min(0.25, 0.25 * (1 + Math.abs(gamma)) / screen_scale[1]);
            res = [
                [0.5 + beta / Math.PI / 2 - size_x, 0.5 + gamma / Math.PI - 2 * size_y],
                [0.5 + beta / Math.PI / 2 + size_x, 0.5 + gamma / Math.PI + 2 * size_y]
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

    initForContext(canvas, gl, locations, triangulated) {
        super.initForContext(canvas, gl, locations, triangulated);
        
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEXTURE_WIDTH, TEXTURE_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        const earth_shader_program = this.createShaderProgram(gl, EarthVertexShader, EarthFragmentShader);
        const earth_position_attribute = gl.getAttribLocation(earth_shader_program, 'aVertexPosition');
        const earth_scale_uniform = gl.getUniformLocation(earth_shader_program, 'uScale');
        const earth_scale2_uniform = gl.getUniformLocation(earth_shader_program, 'uScaleZ');
        const earth_sampler_uniform = gl.getUniformLocation(earth_shader_program, 'uSampler');
        const earth_texmin_uniform = gl.getUniformLocation(earth_shader_program, 'uTexMin');
        const earth_texmax_uniform = gl.getUniformLocation(earth_shader_program, 'uTexMax');
        const earth_transform_uniform = gl.getUniformLocation(earth_shader_program, 'uTransform');

        const earth_vertices = new Float32Array([
            -2, 2,   2, 2,   2, -2,   -2, -2,
        ]);
        const earth_triangles = new Uint16Array([
            0, 1, 2,   2, 3, 0,
        ]);
        const earth_position_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, earth_position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, earth_vertices, gl.STATIC_DRAW);
        const earth_index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earth_index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, earth_triangles, gl.STATIC_DRAW);

        this.webgl_data.texture = texture;
        this.webgl_data.earth_data = {
            shader_program: earth_shader_program,
            position_attribute: earth_position_attribute,
            scale_uniform: earth_scale_uniform,
            scale2_uniform: earth_scale2_uniform,
            sampler_uniform: earth_sampler_uniform,
            texmin_uniform: earth_texmin_uniform,
            texmax_uniform: earth_texmax_uniform,
            transform_uniform: earth_transform_uniform,
            vertices: earth_vertices,
            triangles: earth_triangles,
            gl_position_buffer: earth_position_buffer,
            gl_index_buffer: earth_index_buffer,
        };
    }

    deinitResources(locations, triangulated) {
        if (this.webgl_data?.context) {
            const gl = this.webgl_data.context;
            gl.deleteTexture(this.webgl_data.texture);
            gl.deleteBuffer(this.webgl_data.earth_data.gl_position_buffer);
            gl.deleteBuffer(this.webgl_data.earth_data.gl_index_buffer);
            gl.getAttachedShaders(this.webgl_data.earth_data.shader_program).forEach(s => {
                gl.deleteShader(s);
            });
            gl.deleteProgram(this.webgl_data.earth_data.shader_program);
        }
        super.deinitResources(locations, triangulated);
    }

    renderToTexture(locations, triangulated, state, min, max) {
        const gl = this.webgl_data.context;
        const fill_data = this.webgl_data.fill_data;
        const stroke_data = this.webgl_data.stroke_data;
        const triangles = this.webgl_data.triangles;

        gl.bindTexture(gl.TEXTURE_2D, this.webgl_data.texture);
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
            0.5 / (max[0] - min[0]) * Math.cbrt(state.scale) / state.scale,
            0.5 / (max[1] - min[1]) * Math.cbrt(state.scale) / state.scale
        ];

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Generate location colors
        const colors = new Uint8Array(locations.length * 4);
        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < 3; j++) {
                colors[4*i + j] = locations[i].color[j];
                if (locations[i].id === state.hover) {
                    colors[4*i + j] *= 0.8;
                }
            }
            colors[4*i + 3] = 255;
        }
        gl.bindTexture(gl.TEXTURE_2D, triangles.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, locations.length, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, colors);

        // Draw fill
        gl.useProgram(fill_data.shader_program);
        gl.uniform2fv(fill_data.scale_uniform, scale);
        gl.uniform1i(fill_data.colors_uniform, 0);
            
        gl.bindBuffer(gl.ARRAY_BUFFER, triangles.position_buffer);
        gl.vertexAttribPointer(fill_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(fill_data.position_attribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, triangles.color_buffer);
        gl.vertexAttribPointer(fill_data.color_attribute, 1, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(fill_data.color_attribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangles.index_buffer);
        for (let x = 0; x <= 1; x++) {
            gl.uniform2fv(fill_data.translate_uniform, translate);
            gl.drawElements(gl.TRIANGLES, triangulated.triangles.length, gl.UNSIGNED_INT, 0);
            translate[0] += 2 * Math.PI;
        }

        // Draw stroke
        gl.useProgram(stroke_data.shader_program);
        gl.uniform2fv(stroke_data.scale_uniform, scale);
        gl.uniform2fv(stroke_data.scale2_uniform, stroke_scale);
        gl.uniform1f(stroke_data.width_uniform, 0.0025);
        gl.uniform3fv(stroke_data.color_uniform, [0.271, 0.302, 0.38]);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, triangles.outline_normal_buffer);
        gl.vertexAttribPointer(stroke_data.normal_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(stroke_data.normal_attribute);

        gl.bindBuffer(gl.ARRAY_BUFFER, triangles.outline_position_buffer);
        gl.vertexAttribPointer(stroke_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(stroke_data.position_attribute);
        translate[0] -= 4 * Math.PI;
        for (let x = 0; x <= 1; x++) {
            gl.uniform2fv(stroke_data.translate_uniform, translate);
            gl.drawArrays(gl.TRIANGLES, 0, triangulated.outline_triangles.length / 2);
            translate[0] += 2 * Math.PI;
        }

        gl.viewport(0, 0, this.webgl_data.canvas.clientWidth, this.webgl_data.canvas.clientHeight);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    renderMapInContext(locations, triangulated, state) {
        const gl = this.webgl_data.context;
        const earth_data = this.webgl_data.earth_data;
        const [min, max] = this.generateTexMinMax(state);

        this.renderToTexture(locations, triangulated, state, min, max);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clearDepth(1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Draw globe
        gl.bindTexture(gl.TEXTURE_2D, this.webgl_data.texture);
        gl.useProgram(earth_data.shader_program);
        gl.uniform2fv(earth_data.scale_uniform, this.generateScale(state));
        gl.uniform2fv(earth_data.scale_uniform, this.generateScale(state));
        gl.uniform1fv(earth_data.scale2_uniform, [state.scale]);
        gl.uniform1i(earth_data.sampler_uniform, 0);
        gl.uniform2fv(earth_data.texmin_uniform, min);
        gl.uniform2fv(earth_data.texmax_uniform, max);
        gl.uniformMatrix3fv(earth_data.transform_uniform, false, this.generateTransform(state));
        
        gl.bindBuffer(gl.ARRAY_BUFFER, earth_data.gl_position_buffer);
        gl.vertexAttribPointer(earth_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(earth_data.position_attribute);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, earth_data.gl_index_buffer);
        gl.drawElements(gl.TRIANGLES, earth_data.triangles.length, gl.UNSIGNED_SHORT, 0);
    }
}

