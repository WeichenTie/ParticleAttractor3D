
export class MouseHandler {

    static target: HTMLElement;
    
    static mousePos: {x: number, y: number} = {
        x: -1,
        y: -1,
    }

    static mouseButtons = {
        left: false,
        middle: false,
        right: false
    }

    static addTarget(target: HTMLElement) {
        MouseHandler.target = target;
        target.addEventListener('mousemove', (event)=>{
            this.mousePos = {x: event.x, y: event.y};
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
        const rect = target.getBoundingClientRect();
        
    }
}