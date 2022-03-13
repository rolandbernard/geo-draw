
#ifdef GL_ES
    precision highp float;
#endif

varying vec2 vPixelPos;

void main() {
    float dist = vPixelPos.x * vPixelPos.x + vPixelPos.y * vPixelPos.y;
    float edge = (dist - 1.0) * (dist - 1.0);
    if (dist < 1.0 && dist > 0.985) {
        gl_FragColor = vec4(0.0, 0.25, 0.50, 1.0);
    } else if (dist < 1.0) {
        gl_FragColor = vec4(0.0, 0.25, 0.50, 0.0);
    }
    float f = 0.5 * exp(-5.0e3 * edge);
    gl_FragColor = (1.0 - f) * gl_FragColor + f * vec4(0.5, 0.5, 0.75, 1.0);
    if (dist < 1.0) {
        f = 0.25 * exp(-1.0e2 * edge);
        gl_FragColor = (1.0 - f) * gl_FragColor + f * vec4(0.0, 0.75, 1.0, 1.0);
        f = 0.2 * exp(-1.0 * edge);
        gl_FragColor = (1.0 - f) * gl_FragColor + f * vec4(0.0, 0.75, 1.0, 1.0);
    }
}

