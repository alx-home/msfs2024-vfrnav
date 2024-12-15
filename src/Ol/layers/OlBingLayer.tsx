import { OlLayerProp } from "./OlLayer";
import TileLayer from "ol/layer/Tile";
import { BingMaps } from "ol/source";
import { useEffect, useRef } from "react";

export const OlBingLayer = ({
   opacity,
   map,
   order,
   active
}: OlLayerProp & {
   opacity?: number
}) => {
   const layerRef = useRef<TileLayer>();

   useEffect(() => {
      const tileLayer = new TileLayer({
         opacity: opacity,
         source: new BingMaps({
            key: "@TODO",
            imagerySet: 'AerialWithLabels'
         })
      });

      layerRef.current = tileLayer;

      map?.addLayer(tileLayer);

      return () => { map?.removeLayer(tileLayer); };
   }, [map, opacity]);

   useEffect(() => {
      if (order != undefined) {
         layerRef.current?.setZIndex(order);
      }
   }, [order]);

   useEffect(() => {
      if (active != undefined) {
         layerRef.current?.setVisible(active);
      }
   }, [active]);

   return <></>;
};