export class VBO {
    gl;
    VBO;
    constructor(gl: WebGL2RenderingContext, data: number[], usage: number) {
        this.gl = gl;
        this.VBO = gl.createBuffer();
        this.bind();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage);
        this.unbind();
    }

    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.VBO);
    }

    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
}