import { Extent } from "ol/extent";
import { Projection } from "ol/proj";
import { OlLayerProp } from "./OlLayer";
import TileLayer from "ol/layer/Tile";
import { WMTS } from "ol/source";
import WMTSTileGrid from "ol/tilegrid/WMTS";
import { useEffect, useRef } from "react";

export const OlWMTSLayer = ({
   opacity,
   url,
   layer,
   matrixSet,
   version,
   format,
   projection,
   tileGrid,
   style,
   wrapX,
   map,
   order
}: {
   opacity?: number,
   url: string,
   layer: string,
   matrixSet?: string,
   version: string,
   format?: string,
   projection: Projection,
   tileGrid: {
      origin: Extent,
      resolutions: Array<number>,
      matrixIds: Array<string>,
   },
   style?: 'normal',
   wrapX?: boolean,
} & OlLayerProp) => {

   const layerRef = useRef<TileLayer>();

   useEffect(() => {
      const tileLayer = new TileLayer({
         opacity: opacity,
         source: new WMTS({
            url: url,
            layer: layer,
            matrixSet: matrixSet ?? 'PM',
            version: version,
            format: format ?? 'image/jpeg',
            projection: projection,
            tileGrid: new WMTSTileGrid(tileGrid),
            style: style ?? 'normal',
            wrapX: wrapX ?? true,
         })
      });

      layerRef.current = tileLayer;

      map?.addLayer(tileLayer);

      return () => { map?.removeLayer(tileLayer); };
   }, [map]);

   useEffect(() => {
      if (order != undefined) {
         layerRef.current?.setZIndex(order);
      }
   }, [order]);

   return <></>;
};