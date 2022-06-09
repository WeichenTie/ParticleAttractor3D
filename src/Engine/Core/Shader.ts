export class Shader {
    gl;
    program;
    constructor(gl: WebGL2RenderingContext, vShaderSrc: string, fShaderSrc: string, transformFeedbacks: string[]) {
        this.gl = gl;
        this.program = this.createProgram(vShaderSrc, fShaderSrc, transformFeedbacks);
    }

    createShader(shaderSrc:string, shaderType:number) {
        const gl = this.gl;
        const shader = gl.createShader(shaderType);
        gl.shaderSource(shader, shaderSrc);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }
    
    
    createProgram(vShaderSrc: string, fShaderSrc: string, transformFeedbackVaryings: string[]) {
        const gl = this.gl;
        const program = gl.createProgram();
        const vShader = this.createShader(vShaderSrc, gl.VERTEX_SHADER);
        const fShader = this.createShader(fShaderSrc, gl.FRAGMENT_SHADER);
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
    
        if (transformFeedbackVaryings != null) {
            gl.transformFeedbackVaryings(program, transformFeedbackVaryings, gl.INTERLEAVED_ATTRIBS);
        }
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log('FAILED COMPILATION');
            
            throw new Error(gl.getProgramParameter(program, null));
        }
        gl.deleteShader(vShader);
        gl.deleteShader(fShader);
        return program;
    }
    use() {
        this.gl.useProgram(this.program);
    }
}