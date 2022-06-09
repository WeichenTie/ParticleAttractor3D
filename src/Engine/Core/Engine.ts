import { Shader } from "./Shader";
import { VAO, VAOAttribLayout } from "./VAO";
import { VBO } from "./VBO";
import { MouseHandler } from "../IO/MouseHandler";

import * as GLM from '../libs'

const vShader = `#version 300 es
    layout(location = 0) in vec2 a_OldPosition;
    layout(location = 1) in vec2 a_OldVelocity;

    uniform mat4 u_MVP;
    uniform vec2 u_MousePosition;
    uniform int u_MouseDown;

    out vec2 v_NewPosition;
    out vec2 v_NewVelocity;

    vec2 particleToMouse() {
        return normalize(u_MousePosition - a_OldPosition);
    }
    vec2 calcNewVelocity() {
        vec2 vel = vec2(0,0);
        if (u_MouseDown == 1) {
            vel = a_OldVelocity + particleToMouse();
        }

        return vel;
    }

    void main() {
        v_NewVelocity = calcNewVelocity();
        v_NewPosition = a_OldPosition + v_NewVelocity;
        gl_Position = u_MVP * vec4(a_OldPosition, 0, 1);
        gl_PointSize = 1.0;
    }
`

const fShader = `#version 300 es
    precision highp float;
    out vec4 f_Color;
    void main() {
        f_Color = vec4(1,1,1,1);
    }
`


const width = 750;
const height = 750;
const orthoMat = GLM.mat4.create();
GLM.mat4.ortho(orthoMat, 0, width, height, 0, -1, 1);


function generatePoints(count: number) { 
    let points = [];
    for (let i = 0; i < count; i++) {
        points.push(Math.random() * width, Math.random() * height);
        points.push(Math.random(), Math.random());
    }
    // console.log(points);
    return points;
}

function createTransformFeedback(gl: WebGL2RenderingContext, buffer: VBO) {
    const tf = gl.createTransformFeedback();
    gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, tf);
    gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, buffer.VBO);
    gl.bindBuffer(gl.TRANSFORM_FEEDBACK_BUFFER, null);
    return tf;
} 


export default class Engine {
    canvas : HTMLCanvasElement;
    gl;
    VAO1;
    VBO1;
    VAO2;
    VBO2;
    TF1;
    TF2;
    program: Shader;
    current: { vao: VAO; tf: WebGLTransformFeedback; id: number};
    next: { vao: VAO; tf: WebGLTransformFeedback; id: number};
    numPoints: number;
    mvpLoc: WebGLUniformLocation;
    mousePositionLoc: WebGLUniformLocation;
    mouseStateLoc: WebGLUniformLocation;
    constructor(canvasID :string) {
        this.canvas = <HTMLCanvasElement>document.getElementById(canvasID);
        this.gl = this.canvas.getContext('webgl2');
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

        this.numPoints = 10000;

        this.program = new Shader(this.gl, vShader, fShader, ['v_NewPosition', 'v_NewVelocity']);

        this.VAO1 = new VAO(this.gl);
        this.VAO2 = new VAO(this.gl);
        this.VBO1 = new VBO(this.gl, generatePoints(this.numPoints), this.gl.DYNAMIC_DRAW);
        this.VBO2 = new VBO(this.gl, generatePoints(this.numPoints), this.gl.DYNAMIC_DRAW);
        this.TF1 = createTransformFeedback(this.gl, this.VBO1);
        this.TF2 = createTransformFeedback(this.gl, this.VBO2);
        const attribLayout = new VAOAttribLayout();
        attribLayout.addAttrib(2, this.gl.FLOAT, false);
        attribLayout.addAttrib(2, this.gl.FLOAT, false);
        this.VAO1.addAttribute(this.VBO1, attribLayout);
        this.VAO2.addAttribute(this.VBO2, attribLayout);

        this.mvpLoc = this.gl.getUniformLocation(this.program.program, 'u_MVP');
        this.mousePositionLoc = this.gl.getUniformLocation(this.program.program, 'u_MousePosition');
        this.mouseStateLoc = this.gl.getUniformLocation(this.program.program, 'u_MouseDown');

        this.current = {
            vao: this.VAO1,
            tf: this.TF2,
            id: 0,
        }
        this.next = {
            vao: this.VAO2,
            tf: this.TF1,
            id: 1
        }
    }

    run() {
        
        MouseHandler.addTarget(this.gl.canvas);
        requestAnimationFrame(() => this.loop());
    }
    
    update() {
        
    }
    
    draw() {
        const gl = this.gl;
        gl.clearColor(0, 0, 0, 255);
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.program.use();
        this.current.vao.bind();

        gl.uniformMatrix4fv(this.mvpLoc, false, orthoMat);
        gl.uniform2f(this.mousePositionLoc, MouseHandler.mousePos.x, MouseHandler.mousePos.y);
        gl.uniform1i(this.mouseStateLoc, MouseHandler.mouseButtons.left ? 1 : 0);
        console.log(MouseHandler.mouseButtons.left);
        

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.current.tf);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.numPoints);
        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        const temp = this.next;
        this.next = this.current;
        this.current = temp;
    }
    
    loop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.loop());
    }
}