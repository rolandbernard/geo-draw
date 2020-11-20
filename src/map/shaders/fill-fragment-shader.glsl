
#ifdef GL_ES
    precision highp float;
#endif
    
uniform vec3 uFillColor;

void main() {
    gl_FragColor = vec4(uFillColor, 1.0);
}
