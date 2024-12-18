import { Map } from "ol";
import TileLayer from "ol/layer/Tile";
import { TileImage } from "ol/source";
import { useEffect, useRef } from "react";

export class OlLayerProp {
   constructor(public order?: number, public active?: boolean, public map?: Map, public maxZoom?: number, public minZoom?: number) { }
}

export const OlLayer = ({ opacity, source, map, order, active, maxZoom, minZoom }: OlLayerProp & {
   opacity?: number,
   source: TileImage
}) => {
   const layerRef = useRef<TileLayer>();

   useEffect(() => {
      const tileLayer = new TileLayer({
         opacity: opacity,
         source: source,
         maxZoom: maxZoom,
         minZoom: minZoom
      });

      layerRef.current = tileLayer;
      layerRef.current?.setVisible(active ?? false);

      map?.addLayer(tileLayer);

      return () => { map?.removeLayer(tileLayer); };
   }, [map, opacity, active, maxZoom, minZoom, source]);

   useEffect(() => {
      if (order !== undefined) {
         layerRef.current?.setZIndex(order);
      }
   }, [order]);

   useEffect(() => {
      if (active !== undefined) {
         layerRef.current?.setVisible(active);
         if (order) {
            layerRef.current?.setZIndex(order);
         }
      }
   }, [active, order]);

   return <></>;
};