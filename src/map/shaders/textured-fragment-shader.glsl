
#ifdef GL_ES
    precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform vec2 uTexMin;
uniform vec2 uTexMax;

void main() {
    if (uTexMin.x <= vTextureCoord.x && uTexMax.x >= vTextureCoord.x) {
        vec2 texPos = vec2(
            (vTextureCoord.x - uTexMin.x) / (uTexMax.x - uTexMin.x),
            (vTextureCoord.y - uTexMin.y) / (uTexMax.y - uTexMin.y)
        );
        gl_FragColor = texture2D(uSampler, texPos);
    } else if (uTexMin.x <= 1.0 + vTextureCoord.x && uTexMax.x >= 1.0 + vTextureCoord.x) {
        vec2 texPos = vec2(
            (vTextureCoord.x + 1.0 - uTexMin.x) / (uTexMax.x - uTexMin.x),
            (vTextureCoord.y - uTexMin.y) / (uTexMax.y - uTexMin.y)
        );
        gl_FragColor = texture2D(uSampler, texPos);
    }
}

