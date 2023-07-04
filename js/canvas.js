const mainCanvas = document.getElementById("modal-canvas");
const context = mainCanvas.getContext("2d");

const fill = (color) => {
    context.fillStyle = color;
    context.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
};

fill('white');

let initialX;
let initialY;
let pencilColor = "#000";
let brushSize = 1;

const dibujar = (cursorX, cursorY) => {
    context.beginPath();
    context.moveTo(initialX, initialY);
    context.lineWidth = brushSize;
    context.strokeStyle = pencilColor;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineTo(cursorX, cursorY);
    context.stroke();

    initialX = cursorX;
    initialY = cursorY;
};

const mouseDown = (evt) => {
    initialX = evt.offsetX;
    initialY = evt.offsetY;
    dibujar(initialX, initialY);
    mainCanvas.addEventListener("mousemove", mouseMoving);
};

const mouseMoving = (evt) => {
    dibujar(evt.offsetX, evt.offsetY);
};

const mouseUp = () => {
    mainCanvas.removeEventListener("mousemove", mouseMoving);
};

const setPencilColor = (color) => {
    pencilColor = color;
};

const setBrushSize = (size) => {
    brushSize = size;
};

const saveImage = () => {
    const link = document.createElement("a");
    link.href = mainCanvas.toDataURL();
    link.download = "image.jpg";
    link.click();
};

mainCanvas.addEventListener("mousedown", mouseDown);
mainCanvas.addEventListener("mouseup", mouseUp);