
import FillFragmentShader from './shaders/fill-fragment-shader.glsl';
import FillVertexShader from './shaders/fill-vertex-shader.glsl';
import StrokeFragmentShader from './shaders/stroke-fragment-shader.glsl';
import StrokeVertexShader from './shaders/stroke-vertex-shader.glsl';

import MapRenderer from './map-renderer';

export default class WebGLRenderer {
    projection(array) {
        return MapRenderer.project(array);
    }

    applyProjection(array) {
        for (let i = 0; i < array.length; i += 2) {
            [array[i], array[i + 1]] = this.projection([array[i], array[i + 1]]);
        }
    }

    clientPosToMapPos(client_pos, map_pos, state) {
        const [_, scale] = this.generateTranslateAndScale(state);
        const client_pos_norm = [
            2 * (client_pos[0] - map_pos.x) / map_pos.width - 1.0,
            1.0 - 2 * (client_pos[1] - map_pos.y) / map_pos.height,
        ];
        return [
            client_pos_norm[0] / scale[0] + state.center[0],
            client_pos_norm[1] / scale[1] + state.center[1],
        ];
    }

    clientPosToProjPos(client_pos, map_pos, state) {
        const [transform, scale] = this.generateTranslateAndScale(state);
        const client_pos_norm = [
            2 * (client_pos[0] - map_pos.x) / map_pos.width - 1.0,
            1.0 - 2 * (client_pos[1] - map_pos.y) / map_pos.height,
        ];
        return [
            client_pos_norm[0] / scale[0] - transform[0],
            client_pos_norm[1] / scale[1] - transform[1],
        ];
    }

    projPosToClientPos(location_pos, map_pos, state) {
        const [transform, scale] = this.generateTranslateAndScale(state);
        const client_pos_norm = [
            (location_pos[0] + transform[0]) * scale[0],
            (location_pos[1] + transform[1]) * scale[1],
        ];
        return [
            (client_pos_norm[0] + 1.0) / 2 * map_pos.width + map_pos.x,
            (1.0 - client_pos_norm[1]) / 2 * map_pos.height + map_pos.y,
        ];
    }

    generateTranslateAndScale({min, max, size, center, scale: zoom_scale}) {
        const width = max[0] - min[0];
        const height = max[1] - min[1];
        if(width / size[0] > height / size[1]) {
            const translate = [
                -min[0] - width / 2 - center[0],
                -min[1] - height / 2 - center[1],
            ];
            const scale = [
                2 / width * zoom_scale,
                -2 * (size[0] / size[1]) / width * zoom_scale,
            ];
            const stroke_scale = [
                1,
                -size[0] / size[1],
            ];
            return [translate, scale, stroke_scale];
        } else {
            const translate = [
                -min[0] - width / 2 - center[0],
                -min[1] - height / 2 - center[1],
            ];
            const scale = [
                2 * (size[1] / size[0]) / height * zoom_scale,
                -2 /  height * zoom_scale,
            ];
            const stroke_scale = [
                size[1] / size[0],
                -1,
            ];
            return [translate, scale, stroke_scale];
        }
    }
    
    createShaderProgram(gl, vertex_shader_source, fragment_shader_source) {
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

    initForContext(canvas, gl, locations, location_data) {
        const fill_shader_program = this.createShaderProgram(gl, FillVertexShader, FillFragmentShader);
        const fill_position_attribute = gl.getAttribLocation(fill_shader_program, 'aVertexPosition');
        const fill_translate_uniform = gl.getUniformLocation(fill_shader_program, 'uTranslate');
        const fill_scale_uniform = gl.getUniformLocation(fill_shader_program, 'uScale');
        const fill_color_uniform = gl.getUniformLocation(fill_shader_program, 'uFillColor');

        const stroke_shader_program = this.createShaderProgram(gl, StrokeVertexShader, StrokeFragmentShader);
        const stroke_position_attribute = gl.getAttribLocation(stroke_shader_program, 'aVertexPosition');
        const stroke_normal_attribute = gl.getAttribLocation(stroke_shader_program, 'aVertexNormal');
        const stroke_translate_uniform = gl.getUniformLocation(stroke_shader_program, 'uTranslate');
        const stroke_scale_uniform = gl.getUniformLocation(stroke_shader_program, 'uScale');
        const stroke_scale2_uniform = gl.getUniformLocation(stroke_shader_program, 'uStrokeScale');
        const stroke_width_uniform = gl.getUniformLocation(stroke_shader_program, 'uWidth');
        const stroke_color_uniform = gl.getUniformLocation(stroke_shader_program, 'uStrokeColor');

        for(const location of locations) {
            const triangles = location_data[location.id];
            const position_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, triangles.vertices, gl.STATIC_DRAW);
            const index_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangles.triangles, gl.STATIC_DRAW);
            const outline_position_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, outline_position_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, triangles.outline_triangles, gl.STATIC_DRAW);
            const outline_normal_buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, outline_normal_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, triangles.outline_normals, gl.STATIC_DRAW);
            triangles.gl_position_buffer = position_buffer;
            triangles.gl_index_buffer = index_buffer;
            triangles.gl_outline_position_buffer = outline_position_buffer;
            triangles.gl_outline_normal_buffer = outline_normal_buffer;
        }

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
    }

    deinitResources(locations, location_data) {
        if (this.webgl_data?.context) {
            const gl = this.webgl_data.context;
            for (const location of locations) {
                const triangles = location_data[location.id];
                gl.deleteBuffer(triangles.gl_position_buffer);
                gl.deleteBuffer(triangles.gl_index_buffer);
                gl.deleteBuffer(triangles.gl_outline_position_buffer);
                gl.deleteBuffer(triangles.gl_outline_normal_buffer);
            }
            gl.getAttachedShaders(this.webgl_data.fill_data.shader_program).forEach(s => {
                gl.deleteShader(s);
            });
            gl.deleteProgram(this.webgl_data.fill_data.shader_program);
            gl.getAttachedShaders(this.webgl_data.stroke_data.shader_program).forEach(s => {
                gl.deleteShader(s);
            });
            gl.deleteProgram(this.webgl_data.stroke_data.shader_program);
        }
    }

    renderMapInContext(locations, location_data, state) {
        const gl = this.webgl_data.context;
        const fill_data = this.webgl_data.fill_data;
        const stroke_data = this.webgl_data.stroke_data;

        const [translate, scale, stroke_scale] = this.generateTranslateAndScale(state);

        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for (let i = 0; i < locations.length; i++) {
            const loc = locations[i];
            const triangles = location_data[loc.id];
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
                gl.uniform3fv(fill_data.color_uniform, loc.color.map(el => el / 255 * 0.8));
            } else {
                gl.uniform3fv(fill_data.color_uniform, loc.color.map(el => el / 255));
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, triangles.gl_position_buffer);
            gl.vertexAttribPointer(fill_data.position_attribute, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(fill_data.position_attribute);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangles.gl_index_buffer);
            gl.drawElements(gl.TRIANGLES, triangles.triangles.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}

