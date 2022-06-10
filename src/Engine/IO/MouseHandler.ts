
export class MouseHandler {

    static target: HTMLElement;
    
    static mousePos: {x: number, y: number, dx: number, dy: number} = {
        x: -1,
        y: -1,
        dx: 0,
        dy: 0,
    }
    static mouseButtons = {
        left: false,
        middle: false,
        right: false
    }
    static update() {
        MouseHandler.mousePos.dx = 0;
        MouseHandler.mousePos.dy = 0;
    }
    static addTarget(target: HTMLElement) {
        MouseHandler.target = target;
        target.addEventListener('mousemove', (event)=>{
            MouseHandler.mousePos = {x: event.x, y: event.y, dx: MouseHandler.mousePos.dx + event.movementX, dy: MouseHandler.mousePos.dy + event.movementY};
        }, false);
        target.addEventListener('mousedown', (event) => {
            MouseHandler.mouseButtons.left = (event.buttons | 1) === 1;
            MouseHandler.mouseButtons.right = (event.buttons | 2) === 1;
            MouseHandler.mouseButtons.middle = (event.buttons | 4) === 1;
        }, false);
        target.addEventListener('mouseup', (event) => {
            MouseHandler.mouseButtons.left = (event.buttons | 1) === 0;
            MouseHandler.mouseButtons.right = (event.buttons | 2) === 0;
            MouseHandler.mouseButtons.middle = (event.buttons | 4) === 0;
        }, false);
        
    }
}