
attribute vec2 aVertexPosition;

uniform vec2 uTranslate;
uniform vec2 uScale;

void main() {
    gl_Position = vec4((aVertexPosition + uTranslate) * uScale, 0.0, 1.0);
}
