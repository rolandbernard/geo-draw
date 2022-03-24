
attribute vec2 aVertexPosition;
attribute vec2 aVertexNormal;

uniform vec2 uTranslate;
uniform vec2 uScale;
uniform vec2 uStrokeScale;
uniform float uWidth;

void main() {
    gl_Position = vec4(
        (aVertexPosition + uTranslate) * uScale + normalize(aVertexNormal) * uWidth * uStrokeScale,
        0.0, 1.0);
}

