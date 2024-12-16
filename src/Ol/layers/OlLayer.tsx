import { Map } from "ol";
import TileLayer from "ol/layer/Tile";
import { TileImage } from "ol/source";
import { useEffect, useRef } from "react";

export class OlLayerProp {
   constructor(public order?: number, public active?: boolean, public map?: Map) { }
}

export const OlLayer = ({ opacity, source, map, order, active }: OlLayerProp & {
   opacity?: number,
   source: TileImage,
}) => {
   const layerRef = useRef<TileLayer>();

   useEffect(() => {
      const tileLayer = new TileLayer({
         opacity: opacity,
         source: source
      });

      layerRef.current = tileLayer;
      layerRef.current?.setVisible(active ?? false);

      map?.addLayer(tileLayer);

      return () => { map?.removeLayer(tileLayer); };
   }, [map, opacity]);

   useEffect(() => {
      if (order !== undefined) {
         layerRef.current?.setZIndex(order);
      }
   }, [order]);

   useEffect(() => {
      console.log(active)
      if (active !== undefined) {
         layerRef.current?.setVisible(active);
      }
   }, [active]);

   return <></>;
};