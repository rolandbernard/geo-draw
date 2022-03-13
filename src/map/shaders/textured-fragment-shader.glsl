
#ifdef GL_ES
    precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec2 uTexMin;
uniform vec2 uTexMax;

void main() {
    gl_FragColor = texture2D(uSampler, vec2(
        (vTextureCoord.x - uTexMin.x) / (uTexMax.x - uTexMin.x),
        (vTextureCoord.y - uTexMin.y) / (uTexMax.y - uTexMin.y)
    ));
}

