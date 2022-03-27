
#ifdef GL_ES
    precision highp float;
#endif

varying vec3 vPixelColor;

void main() {
    gl_FragColor = vec4(vPixelColor, 1.0);
}

