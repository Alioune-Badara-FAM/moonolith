// Imports des composants
import DisplayGrid from './models/displayGrid';
import { initialImport, lateImport } from './assets/data';
import { undo, redo } from './models/undoStack';
// Imports des fonctionnalités
import { _base64ToArrayBuffer, displayImageFromArrayBuffer, moveDrawing } from './utils/image-manager';
import { clickManager } from './models/tools';

import Const from './models/constants';
import { chunkCreator, getChunk, getChunksFromPosition, getSupply, getTotalPixs, getThreshold } from './utils/web3';
import { assemble } from './models/assembler';

/**********************************
 ************* DISPLAY ************
 **********************************/

let displayGrid;
export let canvas;
export let viewPosY = 0;
export let viewPosX = 0;
let lastCall = 0;
let displayData;

export const windowHeight = window.innerHeight;
export const windowWidth = window.innerWidth;
export let renderWidth = 256;
const pixelSize = windowWidth / renderWidth;
export let renderHeight = Math.floor(windowHeight / pixelSize) + 2;

function initDisplay() {
    displayGrid = new DisplayGrid(renderWidth, renderHeight);
    displayGrid.initialize(document.body);
    canvas = displayGrid.pixels.canvas;
    canvas.onmousedown = clickManager;
}
initDisplay();

async function initDecodeLandscape() {
    let numberOfImports = 4;
    initialImport(numberOfImports)
        .then(() => {
            setTimeout(() => {
                update();
            }, 150);
        })
        .then(() => {
            lateImport(numberOfImports);
        });
}
initDecodeLandscape();

export function update() {
    if (new Date() - lastCall < 10) return;
    //data is the array of the displayed klons
    displayData = assemble();
    displayGrid.updateDisplay(displayData);
    lastCall = new Date();
}

let zoomFactor;
function zoom() {
    if (zoomFactor !== 4) {
        console.log('zoomed x4');
        zoomFactor = 4;
    } else {
        console.log('unzoomed');
        zoomFactor = 0.25;
    }
    renderWidth = renderWidth / zoomFactor;
    renderHeight = renderHeight / zoomFactor;
    console.log('renderWidth', renderWidth, 'renderHeight', renderHeight);
    document.body.removeChild(displayGrid.pixels.canvas);
    initDisplay();
    update();
}

//prettier-ignore
document.addEventListener('contextmenu', (e) => { e.preventDefault(); }, false);
//prettier-ignore
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') undo();
    if (e.metaKey && e.key === 'z') undo();
    if (e.ctrlKey && e.key === 'Z') redo();
    if (e.metaKey && e.key === 'Z') redo();
    if (e.ctrlKey && e.key === 'y') redo();
    if (e.metaKey && e.key === 'y') redo();
    if (e.key === 'u') console.log('CONST', Const);
    if (e.key === 'a') {
        moveDrawing(50, 400);
        update()
    }
    if (e.key === 'y') zoom();
    if (e.key === 'ArrowUp') { viewPosY -= 3; limitsViewPos(); }
    if (e.key === 'ArrowDown') { viewPosY += 3; limitsViewPos(); }
    if (e.key === 'ArrowLeft') { viewPosX += 3; limitsViewPos(); }
    if (e.key === 'ArrowRight') { viewPosX -= 3; limitsViewPos(); }
});

//prettier-ignore
window.onwheel = function (e) {
    if (e.deltaY > 0) { viewPosY -= 3; } else { viewPosY += 3;} limitsViewPos(); };

function limitsViewPos() {
    if (viewPosY < -30) viewPosY = -30;
    if (viewPosY + renderHeight > Const.LINES) viewPosY = Const.LINES - renderHeight;
    if (viewPosX < 0) viewPosX = 0;
    if (viewPosX + renderWidth > Const.COLUMNS) viewPosX = Const.COLUMNS - renderWidth;
    update();
}

getTotalPixs();
// .then(async (total) => {
//let klonSum = total.toNumber();
//const offsetFormule = nbColonne * 64;
// getThreshold().then(async (threshold) => {
//const formuleDeLaMort = offsetFormule + (klonSum * threshold) / 1000000;
// const nbLine = Math.floor(formuleDeLaMort / nbColonne);
//console.log(`nbLine : ${nbLine}, nbColonne : ${nbColonne}`);

//     });
// })
// .then((res) => {
//     getSupply().then(async (supply) => {
//         let s = supply.toNumber();
//         console.log('s', s);

//         for (let i = 1; i <= s; i++) {
//             getChunk(i).then((res) => {
//                 let pixelPaid = res[2].toNumber();
//                 let index = res[0].toNumber();
//                 let yMaxLegal = res[1].toNumber();
//                 console.log('index', index, 'yMaxLegal', yMaxLegal, 'pixelPaid', pixelPaid);
//                 let x = index % Const.MONOLITH_COLUMNS;
//                 let y = Math.floor(index / Const.MONOLITH_COLUMNS);
//                 let arrBuffer = _base64ToArrayBuffer(res[3]);
//                 displayImageFromArrayBuffer(arrBuffer, x, y, pixelPaid, 1000, i);
//             });
//         }
//     });
// });
