import { update, canvas, windowHeight, windowWidth, renderWidth, renderHeight } from '../main';

import { draw_pixel, get_color, erase_all_pixel, erase_pixel, convertToMonolithPos, monolith } from './monolith';
import Klon from './klon';
import { closeCurrentEvent, undo, redo } from './undoStack';
import { chunkCreator } from '../utils/web3';

import {
    _base64ToArrayBuffer,
    toRGBA8,
    hexToRGB,
    RGBToHex,
    moveDrawing,
    displayImageFromArrayBuffer,
    preEncode,
} from '../utils/image-manager';
import Const from './constants';

//prettier-ignore
class Tool {

    static get DONE() { return 0 }
    static get SMOL() { return 1 }
    static get PIPETTE() { return 2 }
    static get BIG() { return 3 }
    static get HUGE() { return 4 }
    static get MOVE() { return 5 }
    static get DELETE() { return 6 }

}

let tool = Tool.HUGE;
let colorPicked = '#b3e3da';

export function clickManager(e) {
    //console.log('clickManager', e);
    let mousePos = mousePosInGrid(e);
    if (mousePos.y > renderHeight - 6 && mousePos.x < 65) {
        //CASE GUI
        if (mousePos.x < 30) {
            colorPicked =
                mousePos.x < 5
                    ? Const.HEX1
                    : mousePos.x < 10
                    ? Const.HEX2
                    : mousePos.x < 15
                    ? Const.HEX10
                    : mousePos.x < 20
                    ? Const.HEX4
                    : mousePos.x < 25
                    ? Const.HEX5
                    : Const.HEX6;
            console.log('colorPicked', colorPicked);
        }
        if (mousePos.x >= 30 && mousePos.x < 35) tool = Tool.SMOL;
        if (mousePos.x >= 35 && mousePos.x < 40) tool = Tool.BIG;
        if (mousePos.x >= 40 && mousePos.x < 45) tool = Tool.HUGE;
        if (mousePos.x >= 45 && mousePos.x < 50) {
            console.log('send To the blockchain!');
            preEncode().then((res) => {
                chunkCreator(res);
            });
        }
        if (mousePos.x >= 50 && mousePos.x < 55) {
            console.log('move! (not working now)');
            moveDrawing(50, 500);
            update();
        }
        if (mousePos.x >= 55 && mousePos.x < 60) {
            erase_all_pixel();
            update();
        }
        if (mousePos.x >= 60 && mousePos.x < 65) importImage();
    } else {
        //CASE MONOLITH OR LANDSCAPE
        mousePos = convertToMonolithPos(mousePos);
        if (mousePos) startUsingTool(e, mousePos);
    }
}

function startUsingTool(e, mousePos) {
    if (e.button == 0) {
        useTool(mousePos);
        canvas.onmousemove = useTool;
        canvas.onmouseup = stopUsingTool;
    }
    if (e.button == 2) {
        useDeleteTool(mousePos);
        canvas.onmousemove = useDeleteTool;
        canvas.onmouseup = stopUsingTool;
    }
    if (e.button == 1) {
        useColorPicker(mousePos);
    }
}

function useTool(e) {
    //IF E IS PASSED IT'S ALREADY FORMATED, ELSE IT'S A MOUSE EVENT
    const mousePos = e.type ? convertToMonolithPos(mousePosInGrid({ x: e.x, y: e.y })) : e;
    if (!mousePos) return;
    //console.log('mousePos', mousePos);
    switch (tool) {
        case Tool.SMOL:
            draw_pixel(mousePos.x, mousePos.y, Klon.USERPAINTED, hexToRGB(colorPicked));
            break;
        case Tool.BIG:
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (mousePos.x + i < renderWidth && mousePos.x + i > -1)
                        draw_pixel(mousePos.x + i, mousePos.y + j, Klon.USERPAINTED, hexToRGB(colorPicked));
                }
            }
            break;
        case Tool.HUGE:
            for (let i = -15; i <= 15; i++) {
                for (let j = -15; j <= 15; j++) {
                    if (mousePos.x + i < renderWidth && mousePos.x + i > -1)
                        draw_pixel(mousePos.x + i, mousePos.y + j, Klon.USERPAINTED, hexToRGB(colorPicked));
                }
            }
            break;
        case Tool.MOVE:
            moveDrawing(mousePos.x, mousePos.y);
            break;
    }
    update();
}

function useDeleteTool(e) {
    //IF E IS PASSED IT'S ALREADY FORMATED, ELSE IT'S A MOUSE EVENT
    const mousePos = e.type ? convertToMonolithPos(mousePosInGrid({ x: e.x, y: e.y })) : e;
    if (!mousePos) return;
    switch (tool) {
        case Tool.SMOL:
            erase_pixel(mousePos.x, mousePos.y);
            break;
        case Tool.BIG:
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    erase_pixel(mousePos.x + i, mousePos.y + j);
                }
            }
            break;
        case Tool.HUGE:
            for (let i = -15; i <= 15; i++) {
                for (let j = -15; j <= 15; j++) {
                    erase_pixel(mousePos.x + i, mousePos.y + j);
                }
            }
            break;
    }
    update();
}

function stopUsingTool() {
    closeCurrentEvent();
    canvas.onmousemove = null;
}

export function mousePosInGrid(e) {
    // console.log('mousePosInGrid', e);
    let x = Math.floor((e.x / windowWidth) * renderWidth);
    let y = Math.floor((e.y / windowHeight) * renderHeight);
    return { x: x, y: y };
}

function useColorPicker(mousePos) {
    colorPicked = get_color(mousePos.x, mousePos.y);
    colorPicked = RGBToHex(colorPicked[0], colorPicked[1], colorPicked[2]);
    console.log(colorPicked);
}

function importImage() {
    let input = document.createElement('input');
    input.type = 'file';

    input.onchange = (e) => {
        let file = e.target.files[0];
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = (res) => {
            let importedImage = res.target.result; // this is the content!
            displayImageFromArrayBuffer(importedImage, 1, 400, 999999, 99999, 0);
        };
    };
    input.click();
}
