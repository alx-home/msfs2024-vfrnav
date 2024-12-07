import { Map } from "ol";

export class OlLayerProp {
   constructor(public order?: number, public active?: boolean, public map?: Map) { }
}