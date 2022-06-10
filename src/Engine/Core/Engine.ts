import { Shader } from "./Shader";
import { VAO, VAOAttribLayout } from "./VAO";
import { VBO } from "./VBO";
import { MouseHandler } from "../IO/MouseHandler";

import * as GLM from '../libs'
import { Camera } from '../Renderer/Camera';
import { KeyBoardHandler } from '../IO/KeyboardHandler';

const vShader = `#version 300 es
    layout(location = 0) in vec3 a_OldPosition;
    layout(location = 1) in vec3 a_OldVelocity;

    uniform mat4 u_MVP;
    uniform vec3 u_MousePosition;
    uniform float u_DeltaTime;
    uniform int u_MouseDown;

    out vec4 v_Color;
    
    out vec3 v_NewPosition;
    out vec3 v_NewVelocity;

    void main() {
        vec3 toMouse = u_MousePosition - a_OldPosition;
        vec3 toMouseNorm = normalize(toMouse);
        float distSquared = max(dot(toMouse, toMouse), 10000.0);
        vec3 gForce = (1.0 / distSquared) * toMouseNorm * float(u_MouseDown);

        float velocitySquared = max(dot(a_OldVelocity, a_OldVelocity), 0.001);
        vec3 velocityNorm = normalize(a_OldVelocity);
        vec3 dragForce = 0.001 * velocitySquared * velocityNorm;

        v_NewVelocity = a_OldVelocity + gForce - dragForce;
        v_NewVelocity *= 0.995;
        v_NewPosition = a_OldPosition + v_NewVelocity;

        v_Color = vec4(velocityNorm, 0);

        gl_Position = u_MVP * vec4(v_NewPosition, 1);
        gl_PointSize = 1.0;
    }
`

const fShader = `#version 300 es
    precision highp float;
    in vec4 v_Color;
    out vec4 f_Color;
    void main() {
        f_Color = v_Color;
    }
`


const width = window.innerWidth;
const height = window.innerHeight;
const orthoMat = GLM.mat4.create();
GLM.mat4.ortho(orthoMat, 0, width, height, 0, -1, 1);


function generatePoints(count: number) { 
    let points = [];
    for (let i = 0; i < count; i++) {
        points.push(0,0,0);
        //points.push(Math.random() * width, Math.random() * height);
        points.push(0.001 * (Math.random() - 0.5), 0.001 * (Math.random() - 0.5), 0.001* (Math.random() - 0.5));
    }
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
    then = 0;
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
    deltaTime: WebGLUniformLocation;
    camera: Camera;
    projectionMatrix: mat4;
    dT: number = 0;
    constructor(canvasID :string) {
        this.canvas = document.getElementById(canvasID) as HTMLCanvasElement;
        this.gl = this.canvas.getContext('webgl2');
        this.gl.canvas.width = width;
        this.gl.canvas.height = height;
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)

        this.numPoints = 1000000;

        this.program = new Shader(this.gl, vShader, fShader, ['v_NewPosition', 'v_NewVelocity']);

        this.camera = new Camera([0,0,-1.], [0,0,10]);

        this.VAO1 = new VAO(this.gl);
        this.VAO2 = new VAO(this.gl);
        this.VBO1 = new VBO(this.gl, generatePoints(this.numPoints), this.gl.DYNAMIC_DRAW);
        this.VBO2 = new VBO(this.gl, generatePoints(this.numPoints), this.gl.DYNAMIC_DRAW);
        this.TF1 = createTransformFeedback(this.gl, this.VBO1);
        this.TF2 = createTransformFeedback(this.gl, this.VBO2);
        const attribLayout = new VAOAttribLayout();
        attribLayout.addAttrib(3, this.gl.FLOAT, false);
        attribLayout.addAttrib(3, this.gl.FLOAT, false);
        this.VAO1.addAttribute(this.VBO1, attribLayout);
        this.VAO2.addAttribute(this.VBO2, attribLayout);
        
        this.mvpLoc = this.gl.getUniformLocation(this.program.program, 'u_MVP');
        this.mousePositionLoc = this.gl.getUniformLocation(this.program.program, 'u_MousePosition');
        this.mouseStateLoc = this.gl.getUniformLocation(this.program.program, 'u_MouseDown');
        this.deltaTime = this.gl.getUniformLocation(this.program.program, 'u_DeltaTime');
        this.projectionMatrix = GLM.mat4.create();
        GLM.mat4.perspective(this.projectionMatrix, Math.PI/4, this.gl.canvas.width/ this.gl.canvas.height, 0.01, 1000);
        
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
        KeyBoardHandler.init();
        window.addEventListener("keypress", (ev)=>{
            const canvas = document.getElementById('gl-canvas');
            if (ev.code === 'KeyF') {
                canvas.requestPointerLock();
            }
        });
        requestAnimationFrame((time) => this.loop(time));
    }
    
    update() {
        let velocity = 0.25;
        
        this.camera.rotate(-MouseHandler.mousePos.dx * this.dT,  MouseHandler.mousePos.dy * this.dT, 0);
        
        if (KeyBoardHandler.keyState('ShiftLeft')) {
            velocity /= 2;
        }
        if (KeyBoardHandler.keyState('Space')) {
            velocity = 0.5;
        }
        if (KeyBoardHandler.keyState('KeyW')) {
            this.camera.translate(0, 0, velocity * this.dT);
        }
        if (KeyBoardHandler.keyState('KeyA')) {
            this.camera.translate(-velocity * this.dT, 0, 0);
        }
        if (KeyBoardHandler.keyState('KeyS')) {
            this.camera.translate(0, 0, -velocity * this.dT);
        }
        if (KeyBoardHandler.keyState('KeyD')) {
            this.camera.translate(velocity * this.dT, 0, 0);
        }
        
    }
    
    draw(time: number) {
        const timeSec = time / 1000;
        this.dT = timeSec - this.then;
        this.then = timeSec;
        const gl = this.gl;
        gl.clearColor(0, 0, 0, 255);
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.program.use();
        this.current.vao.bind();


        const mvp = GLM.mat4.create();
        GLM.mat4.mul(mvp, this.projectionMatrix, this.camera.getViewMatrix());
        gl.uniformMatrix4fv(this.mvpLoc, false, mvp);

        const rayDist = GLM.vec3.create();
        const mousePosition = GLM.vec3.create();
        const scale = 0.5;
        GLM.vec3.scale(rayDist, this.camera.direction, scale);
        GLM.vec3.add(mousePosition, this.camera.position, rayDist);
        
        gl.uniform3f(this.mousePositionLoc, mousePosition[0] + 0.00001, mousePosition[1] + 0.00001, mousePosition[2]);
        gl.uniform1i(this.mouseStateLoc, MouseHandler.mouseButtons.left ? 1 : 0);
        gl.uniform1f(this.deltaTime, this.dT);
        

        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, this.current.tf);
        gl.beginTransformFeedback(gl.POINTS);
        gl.drawArrays(gl.POINTS, 0, this.numPoints);
        gl.endTransformFeedback();
        gl.bindTransformFeedback(gl.TRANSFORM_FEEDBACK, null);

        const temp = this.next;
        this.next = this.current;
        this.current = temp;
    }
    
    loop(time: number) {
        this.update();
        this.draw(time);
        MouseHandler.update();
        requestAnimationFrame((time) => this.loop(time));
    }
}