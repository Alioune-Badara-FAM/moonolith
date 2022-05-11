import Const from '../constants';
import { pixelSize, renderHeight } from '../main';
import { scaleFactor, viewPosY, viewPosX } from '../display/view';
import { canvas } from '../display/displayLoop';
import { imageCatalog } from '../display/images';
import { GUICatalog } from '../display/GUI';

export function isInCircle(mousePos, y, x, radius, plan) {
    mousePos = convertToLayer(mousePos, plan);
    // console.log('convertedmousePos', mousePos);
    return Math.ceil(mousePos.x - x) ** 2 + Math.ceil(mousePos.y - y) ** 2 <= radius ** 2;
}

export function isInSquare(mousePos, xmin, xmax, ymin, ymax, plan) {
    mousePos = convertToLayer(mousePos, plan);
    // console.log('convertedmousePos', mousePos);
    if (mousePos.x >= xmin && mousePos.x <= xmax && mousePos.y >= ymin && mousePos.y <= ymax) {
        return true;
    }
    return false;
}

function convertToLayer(coords, plan) {
    const thisImage = imageCatalog[plan] ? imageCatalog[plan] : GUICatalog[plan];

    return {
        x: coords.x - thisImage.x,
        y: coords.y - thisImage.y,
    };
}

export function mousePosInGrid(e) {
    const boundingClientRect = canvas.getBoundingClientRect();
    let y = Math.floor((e.y - boundingClientRect.y) / (scaleFactor * pixelSize));
    let x = Math.floor((e.x - boundingClientRect.x) / (scaleFactor * pixelSize));
    // console.log('mousePosInGrid', x, y);
    return { x: x, y: y };
}

export function convertToMonolithPos(mousePos) {
    mousePos.y = Const.MONOLITH_LINES + Const.MARGIN_BOTTOM - viewPosY - renderHeight + mousePos.y;
    mousePos.x = viewPosX - Const.MARGIN_LEFT + mousePos.x;
    if (mousePos.x < 0 || mousePos.x >= Const.MONOLITH_COLUMNS || mousePos.y < 0 || mousePos.y >= Const.MONOLITH_LINES)
        return undefined;
    return mousePos;
}