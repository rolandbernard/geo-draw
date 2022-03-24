
attribute vec2 aVertexPosition;
attribute float aVertexColor;

uniform vec2 uTranslate;
uniform vec2 uScale;
uniform sampler2D uColors;

varying vec3 vPixelColor;

void main() {
    vPixelColor = texture2D(uColors, vec2(aVertexColor, 0.5)).xyz;
    gl_Position = vec4((aVertexPosition + uTranslate) * uScale, 0.0, 1.0);
}

