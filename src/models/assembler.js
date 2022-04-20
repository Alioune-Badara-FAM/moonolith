import { monolith } from './monolith';
import { GUI } from './GUI';
import { landscapeBase64 } from '../assets/data';
import Const from './constants';
import { renderWidth, renderHeight, viewPosX, viewPosY } from '../main';

var previousViewPosY;
var previousViewPosX;
var previousLandscape;

export function assemble() {
    const monolithStartY = Const.MONOLITH_LINES + Const.MARGIN_BOTTOM - viewPosY - renderHeight;
    const monolithStartX = viewPosX - Const.MARGIN_LEFT;
    console.log('monolithStartY', monolithStartY);
    console.log('monolithStartX', monolithStartX);
    let startAssemble = performance.now();

    let layersToDisplay = [];
    //PUSH GUI AND MONOLITH TO LAYERSTODISPLAY ARRAY
    layersToDisplay.push({ name: 'GUI', colorsArray: GUI, startX: 0, startY: 0 });
    layersToDisplay.push({
        name: 'monolith',
        colorsArray: monolith,
        startX: monolithStartX,
        startY: monolithStartY,
    });

    //IF THE VIEWPOS HAS CHANGED, PUSH THE NEW LAYERS TO LAYER ARRAY
    if (previousViewPosY !== viewPosY || previousViewPosX !== viewPosX) {
        //FOR EACH LAYER, IF CONDITIONS ARE MET, PUSH TO LAYERTODISPLAY
        for (let layer in landscapeBase64) {
            const thisLayer = landscapeBase64[layer];

            ////////////////////////////////////////////////////   HELL   ////////////////////////////////////////////////////////////
            // let parallaxOffset = Math.floor(thisLayer.parallax * viewPosY);

            // if (thisLayer.startY - thisLayer.height - parallaxOffset > viewPosY + renderHeight) continue; // If the layer above render, skip it
            // if (Const.LINES - thisLayer.startY + parallaxOffset > Const.LINES - viewPosY) continue; // If the layer under render, skip it

            // let offset = (Const.LINES - thisLayer.startY + parallaxOffset) * Const.COLUMNS;

            const startX = 0;
            const startY = thisLayer.height - renderHeight + viewPosY;

            ////////////////////////////////////////////////////   HELL   ////////////////////////////////////////////////////////////

            layersToDisplay.push({
                name: thisLayer.name,
                colorsArray: thisLayer.decodedYX,
                startX: startX,
                startY: startY,
            });
        }
        previousViewPosY = viewPosY;
        previousViewPosX = viewPosX;
    } else {
        // ELSE, JUST PUSH PREVIOUSLANDSCAPE AT 0, 0
        layersToDisplay.push({ name: 'previousLandscape', colorsArray: previousLandscape, startX: 0, startY: 0 });
    }

    console.log('layersToDisplay', layersToDisplay);

    let displayArray = [];
    for (let y = 0; y < renderHeight; y++) {
        for (let x = 0; x < renderWidth; x++) {
            //FOR EACH LAYER, PUSH COLOR IF PRESENT
            for (let z = 0; z < layersToDisplay.length; z++) {
                const layer = layersToDisplay[z];
                const array = layer.colorsArray;
                const startX = layer.startX;
                const startY = layer.startY;
                if (!array[startY + y]?.[startX + x]) continue;

                const colorToPush = array[startY + y][startX + x].color
                    ? array[startY + y][startX + x].color
                    : array[startY + y][startX + x];
                displayArray.push(colorToPush);
                break;
            }

            //IF NO COLOR HAS BEEN PUSHED, PUSH THE DEFAULT COLOR
            if (!displayArray[y * renderWidth + x]) {
                displayArray.push([0.9764, 0.5098, 0.5176]);
            }
        }
    }

    previousLandscape = displayArray;
    console.log('displayArray', displayArray);
    console.log('Assemble = ', Math.floor(performance.now() - startAssemble), 'ms');
    return displayArray;
}
