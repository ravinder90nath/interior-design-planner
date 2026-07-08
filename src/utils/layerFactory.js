import { LAYER_DEFAULT_NAME } from '../constants';

let layerIdCounter = 1;
let itemIdCounter  = 100;

export const nextLayerId = () => layerIdCounter++;
export const nextItemId  = () => itemIdCounter++;

export const makeLayer = (name) => ({
  id:           nextLayerId(),
  name:         name || LAYER_DEFAULT_NAME,
  blueprintImg: null,
  items:        [],
});
