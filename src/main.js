// Imports des composants
import { initialDecodeLandscape, lateDecodeLandscape, initialDecodeAnim } from './assets/imageData';
// Imports des fonctionnalités
import { clickManager, keyManager, scrollManager, mousePosInGrid } from './models/tools';
import Const from './models/constants';
import { chunkImport } from './utils/web3';
import { assemble } from './models/assembler';
import { buildMonolith } from './models/monolith';

export let canvas;
export let viewPosY = 0;
export let viewPosX = 0;
let myImageData;
let ctx;

export const windowHeight = window.innerHeight;
export const windowWidth = window.innerWidth;
export let renderWidth = Const.COLUMNS;
const pixelSize = windowWidth / renderWidth;
export let renderHeight = Math.ceil((windowHeight * renderWidth) / windowWidth);
let InitialImports = 13;

async function initApp() {
    let initPerf = performance.now();
    console.log('/////////   INITIALIZING APP   /////////');
    await chunkImport();
    initialDecodeLandscape(InitialImports);
    buildMonolith();
    initialDecodeAnim(InitialImports);
    initDisplay();
    lateDecodeLandscape(InitialImports);
    console.log('//         End of init', Math.floor(performance.now() - initPerf), 'ms        //');
    console.log('//////  INITIALIZATION COMPLETE   //////');
}

initApp();

function initDisplay() {
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    // Set canvas dimensions to the ratio of the screen size
    canvas.width = renderWidth;
    canvas.height = renderHeight;
    canvas.onmousedown = clickManager;

    // Set canvas size to size of screen
    canvas.style.width = '100%';
    canvas.style.imageRendering = 'pixelated';
    document.body.style.cssText = 'margin:0;padding:0;';

    // Create image data of size nbColumns * nbRows
    myImageData = ctx.createImageData(renderWidth, renderHeight);
    requestAnimationFrame(update);

    const providedY = parseInt(window.location.href.split('=')[1]);
    if (providedY) changeViewPos(0, providedY);

    console.log('//      displayGrid initialized       //');
}

function update() {
    myImageData.data.set(assemble(true));
    ctx.putImageData(myImageData, 0, 0);
    requestAnimationFrame(update);
}

//prettier-ignore
document.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);
//prettier-ignore
document.addEventListener('keydown', (e) => { keyManager(e) });
//prettier-ignore
window.onwheel = function (e) { scrollManager(e) };

export function changeViewPos(inputX, inputY) {
    viewPosX += inputX;
    viewPosY += inputY;
    if (viewPosY + renderHeight > Const.LINES) viewPosY = Const.LINES - renderHeight;
    if (viewPosY < -30) viewPosY = -30;
    if (viewPosX < 0) viewPosX = 0;
    if (viewPosX + renderWidth > Const.COLUMNS) viewPosX = Const.COLUMNS - renderWidth;
}

export function zoom() {
    if (renderWidth === Const.COLUMNS) {
        let zoomFactor = 2.5;
        renderWidth = Math.floor(renderWidth / zoomFactor);
        renderHeight = Math.floor((windowHeight / pixelSize + 1) / zoomFactor);
        console.log(`Zoomed x${zoomFactor} | renderWidth`, renderWidth, 'renderHeight', renderHeight);
        viewPosX = Math.floor(viewPosX + renderWidth / 2);
        viewPosY = Math.floor(viewPosY + renderHeight / 2);
    } else {
        // console.log('unzoomed');
        viewPosX = Math.floor(viewPosX - renderWidth / 2);
        viewPosY = Math.floor(viewPosY - renderHeight / 2);
        renderWidth = Const.COLUMNS;
        renderHeight = Math.ceil(windowHeight / pixelSize);
    }
    myImageData = ctx.createImageData(renderWidth, renderHeight);
    canvas.width = renderWidth;
    canvas.height = renderHeight;
}

setInterval(() => {
    chunkImport();
}, 5000);

export let pointer = { x: 0, y: 0 };
document.addEventListener('mousemove', (e) => {
    pointer = mousePosInGrid({ x: e.x, y: e.y });
});
