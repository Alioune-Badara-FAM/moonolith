import Klon from './klon';
import Const from './constants';
import { addToCurrentEvent, closeCurrentEvent } from './undoStack';
import { renderWidth, renderHeight, viewPosX, viewPosY } from '../main';
import { imageCatalog } from '../assets/imageData';

export let monolith;

export function buildMonolith() {
    monolith = Array.from({ length: Const.MONOLITH_LINES }, () =>
        Array.from({ length: Const.MONOLITH_COLUMNS }, () => new Klon(Const.DEFAULT_COLOR))
    );
}

export function drawPixel(x, y, zIndex, color) {
    if (x < 0 || x >= Const.MONOLITH_COLUMNS || y < 0 || y >= Const.MONOLITH_LINES) return; //IF OUT OF BOUNDS, return
    if (!monolith[y][x].isEditable(zIndex)) return; //IF IT IS NOT EDITABLE, return
    if (monolith[y][x].color === color && monolith[y][x].zIndex === zIndex) return; //IF IT IS THE SAME, return
    if (zIndex === 0) addToCurrentEvent(x, y, monolith[y][x]); //IF IT IS BEING DRAWN BY USER, ADD TO CURRENT EVENT
    monolith[y][x] = new Klon(color, zIndex);
}

export function getColor(x, y) {
    console.log('monolith[y][x]', x, y, monolith[y][x]);
    return monolith[y][x].color;
}

export function eraseAllPixel() {
    for (let j = 0; j < Const.MONOLITH_LINES; j++) {
        for (let i = 0; i < Const.MONOLITH_COLUMNS; i++) {
            erasePixel(i, j);
        }
    }
    closeCurrentEvent();
}

export function erasePixel(x, y) {
    if (monolith[y]?.[x]?.zIndex === 0) {
        addToCurrentEvent(x, y, monolith[y][x]);
        monolith[y][x] = new Klon(Const.DEFAULT_COLOR);
    }
}

export function convertIndexToXY(index) {
    let x = index % Const.MONOLITH_COLUMNS;
    let y = Math.floor(index / Const.MONOLITH_COLUMNS);
    return { x, y };
}

export function convertToMonolithPos(mousePos) {
    mousePos.y = Const.MONOLITH_LINES + Const.MARGIN_BOTTOM - viewPosY - renderHeight + mousePos.y;
    mousePos.x = viewPosX - Const.MARGIN_LEFT + mousePos.x;
    if (mousePos.x < 0 || mousePos.x >= Const.MONOLITH_COLUMNS || mousePos.y < 0 || mousePos.y >= Const.MONOLITH_LINES)
        return undefined;
    return mousePos;
}

export function increaseMonolithHeight(newRows) {
    for (let rowAdded = 0; rowAdded < newRows; rowAdded++) {
        let scalingValue = 1000 * Math.log(rowAdded);
        setTimeout(() => {
            Const.setMonolithHeight(Const.MONOLITH_LINES + 1);
            monolith.push(...[Array.from({ length: Const.MONOLITH_COLUMNS }, () => new Klon(Const.DEFAULT_COLOR))]);
            //MET A JOUR LES STARTY :
            for (let layer in imageCatalog) {
                const thisLayer = imageCatalog[layer];
                if (thisLayer.type === 'side') thisLayer.startY++;
            }
        }, scalingValue + 15 * rowAdded);
    }
}
