import { OlLayer, OlLayerProp } from "./OlLayer";
import { BingMaps } from "ol/source";
import { useMemo } from "react";

export const OlBingLayer = ({
   opacity,
   map,
   order,
   active
}: OlLayerProp & {
   opacity?: number
}) => {
   const source = useMemo(() => new BingMaps({
      key: "@TODO",
      imagerySet: 'AerialWithLabels'
   }), []);
   return <OlLayer source={source} map={map} opacity={opacity} order={order} active={active} />;
};