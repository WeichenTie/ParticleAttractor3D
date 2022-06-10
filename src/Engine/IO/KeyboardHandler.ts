export class KeyBoardHandler {
    private static _keyState: Map<string, boolean> = new Map();
    static init() {
        document.addEventListener('keydown', (event)=>{
            console.log(event.code);
            
            KeyBoardHandler._keyState.set(event.code, true);
        }, false);

        document.addEventListener('keyup', (event) => {
            KeyBoardHandler._keyState.set(event.code, false);
        }, false);
    }
    static keyState(code: string) {
        const keyState = KeyBoardHandler._keyState.get(code);
        return !(keyState === undefined || keyState === false)
    }
}