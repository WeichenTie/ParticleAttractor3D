import { VBO } from "./VBO";

export class VAO {
    gl;
    VAO;
    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;
        this.VAO = gl.createVertexArray();
    }

    addAttribute(vbo: VBO, layout: VAOAttribLayout) {
        this.bind();
        vbo.bind();
        let location = 0;
        for (let attrib of layout.attribs) {
            this.gl.enableVertexAttribArray(location);
            this.gl.vertexAttribPointer(location, attrib.count, attrib.type, attrib.normalise, layout.stride, attrib.offset);
            location++;
        }
        vbo.unbind();
        this.unbind();
    }

    bind() {
        this.gl.bindVertexArray(this.VAO);
    }
    unbind() {
        this.gl.bindVertexArray(null);
    }   

}

export interface IVAOAttrib {
    count: number;
    type: number;
    normalise: boolean;
    offset: number;
}

export class VAOAttribLayout {
    stride = 0;
    attribs : IVAOAttrib[] = [];

    addAttrib(count: number, type: number, normalise: boolean) {
        this.attribs.push({count, type, normalise, offset: this.stride});
        this.stride += count * VAOAttribLayout.getTypeSize();
    }
    public static getTypeSize() {
        return 4;
    }
}