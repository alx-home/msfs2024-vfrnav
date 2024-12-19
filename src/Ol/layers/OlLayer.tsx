import { Map } from "ol";
import TileLayer from "ol/layer/Tile";
import { TileImage } from "ol/source";
import { useEffect, useRef } from "react";

export class OlLayerProp {
   constructor(public map?: Map, public order?: number, public active?: boolean, public maxZoom?: number, public minZoom?: number) { }
}

const useLayer = (source: TileImage, map?: Map, opacity?: number, maxZoom?: number, minZoom?: number) => {
   const layerRef = useRef<TileLayer>();

   useEffect(() => {
      const tileLayer = new TileLayer({
         opacity: opacity,
         source: source,
         maxZoom: maxZoom,
         minZoom: minZoom
      });

      layerRef.current = tileLayer;
      map?.addLayer(tileLayer);

      return () => { map?.removeLayer(tileLayer); };
   }, [map, opacity, maxZoom, minZoom, source]);

   return layerRef.current;
};

export const OlLayer = ({ opacity, source, map, order, active, maxZoom, minZoom }: OlLayerProp & {
   opacity?: number,
   source: TileImage
}) => {
   const layer = useLayer(source, map, opacity, maxZoom, minZoom);

   useEffect(() => {
      layer?.setVisible(active ?? false);
   }, [active, layer]);

   useEffect(() => {
      if (order !== undefined) {
         layer?.setZIndex(order);
      }
   }, [order, layer]);

   useEffect(() => {
      if (active !== undefined) {
         layer?.setVisible(active);
         if (order) {
            layer?.setZIndex(order);
         }
      }
   }, [active, order, layer]);

   return <></>;
};