
#ifdef GL_ES
    precision highp float;
#endif
    
uniform vec3 uStrokeColor;

void main() {
    gl_FragColor = vec4(uStrokeColor, 1.0);
}
    