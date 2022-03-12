
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uTransform;

varying vec2 vTextureCoord;

void main() {
    gl_Position = uTransform * vec4(aVertexPosition, 1.0);
	vTextureCoord = aTextureCoord;
}

