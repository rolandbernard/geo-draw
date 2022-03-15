
#ifdef GL_ES
    precision highp float;
#endif

#define PI 3.1415926538

uniform sampler2D uSampler;
uniform vec2 uTexMin;
uniform vec2 uTexMax;
uniform mat3 uTransform;

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
    return vec2(pos.x - PI, pos.y);
}

vec3 spherePosition() {
    vec3 pos = vec3(vPixelPos, 0.0);
    pos.z = 1.0 - pos.x*pos.x - pos.y*pos.y;
    if (pos.z < 0.0) {
        float dist = sqrt(pos.x*pos.x + pos.y*pos.y);
        pos.x /= dist;
        pos.y /= dist;
        pos.z = 0.0;
    } else {
        pos.z = sqrt(pos.z);
    }
    return pos;
}

vec2 texPosition(vec3 pos) {
    pos = uTransform * pos;
    vec2 coord = vec2(
        atan(pos.x, pos.z),
        atan(pos.y, sqrt(pos.x*pos.x + pos.z*pos.z))
    );
    vec2 lonlat = normalizePosition(coord);
    return vec2((lonlat.x + PI) / (2.0 * PI), (lonlat.y + PI / 2.0) / PI);
}

float computeLight(vec3 pos) {
    vec3 light = normalize(vec3(-1.0, 1.0, 3.0));
    float c = max(0.0, dot(light, pos));
    float a = max(0.0, dot(vec3(0.0, 0.0, 1.0), reflect(-light, pos)));
    a *= a;
    return c * 0.6 + a * 0.3 + 0.1;
}

void main() {
    vec3 pos = spherePosition();
    float dist = vPixelPos.x * vPixelPos.x + vPixelPos.y * vPixelPos.y;
    float edge = (dist - 1.0) * (dist - 1.0);
    if (dist < 1.0) {
        vec2 texCoord = texPosition(pos);
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
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
    float f = exp(-5.0e3 * edge);
    gl_FragColor = (1.0 - f) * gl_FragColor + f * vec4(0.5, 0.75, 1.0, 1.0);
    if (dist < 1.0) {
        f = 0.2 * exp(-1.0e2 * edge);
        gl_FragColor = (1.0 - f) * gl_FragColor + f * vec4(0.0, 0.75, 1.0, 1.0);
        f = 0.1 * exp(-1.0 * edge);
        gl_FragColor = (1.0 - f) * gl_FragColor + f * vec4(0.0, 0.75, 1.0, 1.0);
    }
    gl_FragColor.xyz = computeLight(pos) * gl_FragColor.xyz;
}

