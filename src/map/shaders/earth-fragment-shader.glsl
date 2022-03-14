
#ifdef GL_ES
    precision highp float;
#endif

#define PI 3.1415926538

uniform sampler2D uSampler;
uniform vec2 uTexMin;
uniform vec2 uTexMax;
uniform vec2 uCenter;

varying vec2 vPixelPos;

float fmod(float a, float b) {
    return a - (b * floor(a / b));
}

vec2 normalizePosition(vec2 pos) {
    pos.y = fmod(pos.y + PI, 2.0 * PI);
    pos.y = fmod(2.0 * PI + pos.y, 2.0 * PI) - PI;
    if (pos.y < -PI / 2.0) {
        pos.x += PI;
        pos.y = abs(-PI / 2.0 - pos.y) - PI / 2.0;
    } else if (pos.y > PI / 2.0) {
        pos.x += PI;
        pos.y = PI / 2.0 - abs(pos.y - PI / 2.0);
    }
    pos.x = fmod(pos.x + PI, 2.0 * PI);
    pos.x = fmod(2.0 * PI + pos.x, 2.0 * PI);
    return vec2(pos.x / (2.0 * PI), (pos.y + PI / 2.0) / PI);
}

vec2 texPosition() {
    vec3 pos = vec3(vPixelPos, 0.0);
    pos.z = 1.0 - pos.x*pos.x - pos.y*pos.y;
    if (pos.z < 0.0) {
        pos.z = 0.0;
    } else {
        pos.z = sqrt(pos.z);
    }
    vec2 coord = vec2(
        uCenter.x + atan(pos.x, pos.z),
        uCenter.y + atan(pos.y, sqrt(pos.x*pos.x + pos.z*pos.z))
    );
    return normalizePosition(coord);
}

void main() {
    float dist = vPixelPos.x * vPixelPos.x + vPixelPos.y * vPixelPos.y;
    float edge = (dist - 1.0) * (dist - 1.0);
    if (dist < 1.0) {
        vec2 texCoord = texPosition();
        if (uTexMin.x <= 1.0 + texCoord.x && uTexMax.x >= 1.0 + texCoord.x) {
            vec2 texPos = vec2(
                (texCoord.x + 1.0 - uTexMin.x) / (uTexMax.x - uTexMin.x),
                (texCoord.y - uTexMin.y) / (uTexMax.y - uTexMin.y)
            );
            gl_FragColor = texture2D(uSampler, texPos);
        } else {
            vec2 texPos = vec2(
                (texCoord.x - uTexMin.x) / (uTexMax.x - uTexMin.x),
                (texCoord.y - uTexMin.y) / (uTexMax.y - uTexMin.y)
            );
            gl_FragColor = texture2D(uSampler, texPos);
        }
    }
}

