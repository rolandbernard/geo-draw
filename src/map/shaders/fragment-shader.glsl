#ifdef GL_ES
    precision highp float;
#endif
    
uniform vec3 uGlobalColor;

void main() {
    gl_FragColor = vec4(uGlobalColor, 1.0);
}
