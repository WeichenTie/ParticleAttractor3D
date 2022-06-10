import * as GLM from '../libs'
import { toRadian } from '../libs/common';


export class Camera {
    position:vec3 = [0, 0, 0];
    direction:vec3 = [0, 0, 1];
    up = GLM.vec3.create();
    right = GLM.vec3.create();

    pitch = 0;
    yaw = 0;
    roll = 0;

    sensitivity = 15;
    zoom = 1;

    constructor(position: vec3, direction: vec3, angle: number = 0) {
        this.position = position;
        console.log(direction);
        
        GLM.vec3.normalize(this.direction, direction);
        this.pitch = Math.asin(-this.direction[1]) / Math.PI * 180;
        this.yaw = Math.atan2(-this.direction[0], this.direction[2]) / Math.PI * 180;
        this.roll = angle / Math.PI * 180;
        this.updateCameraVectors();
        console.log(this.direction);
        console.log(this.pitch);
        console.log(this.yaw);
        console.log(this.roll);
    }
    translate(x:number, y:number, z:number) {
        const velocity = GLM.vec3.create();
        const xVelocity = GLM.vec3.create();
        xVelocity[0] = this.right[0] * x;
        xVelocity[1] = this.right[1] * x;
        xVelocity[2] = this.right[2] * x;
        const zVelocity = GLM.vec3.create();
        zVelocity[0] = this.direction[0] * z;
        zVelocity[1] = this.direction[1] * z;
        zVelocity[2] = this.direction[2] * z;
        GLM.vec3.add(velocity, xVelocity, zVelocity);
        GLM.vec3.add(this.position, this.position, velocity);
    }
    rotate(deltaYaw: number, deltaPitch:number, deltaRoll: number) {
        this.pitch += deltaPitch * this.sensitivity;
        this.yaw += deltaYaw * this.sensitivity;
        this.roll += deltaRoll * this.sensitivity;
        
        if (this.pitch > 89.0)
            this.pitch = 89.0;
        if (this.pitch < -89.0)
            this.pitch = -89.0;

        this.direction = [0,0,1];
        GLM.vec3.rotateX(this.direction, this.direction, [0,0,0], toRadian(this.pitch));
        GLM.vec3.rotateY(this.direction, this.direction, [0,0,0], toRadian(this.yaw));
        GLM.vec3.rotateZ(this.direction, this.direction, [0,0,0], toRadian(this.roll));
        this.updateCameraVectors();
    }
    getViewMatrix() {
        const viewMat = GLM.mat4.create();
        const target = GLM.vec3.create();
        GLM.vec3.add(target, this.position, this.direction);
        GLM.mat4.lookAt(viewMat, this.position, target, this.up);
        return viewMat;
    }

    private updateCameraVectors() {
        GLM.vec3.normalize(this.direction, this.direction);
        GLM.vec3.cross(this.right, this.direction, [0, 1, 0]);
        GLM.vec3.normalize(this.right, this.right);
        GLM.vec3.cross(this.up, this.right, this.direction);
        GLM.vec3.normalize(this.up, this.up);
    }
}