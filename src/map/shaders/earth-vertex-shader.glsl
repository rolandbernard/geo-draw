
attribute vec2 aVertexPosition;

uniform vec2 uScale;

varying vec2 vPixelPos;

void main() {
    vPixelPos = aVertexPosition;
    gl_Position = vec4(uScale * aVertexPosition, 0.0, 1.0);
}

