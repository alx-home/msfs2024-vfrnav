'use client'

import { OlLayerProp } from "./OlLayer";
import VectorSource from "ol/source/Vector";
import { Feature } from "ol";
import { Geometry, SimpleGeometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import { FeatureLike } from "ol/Feature";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { toContext } from "ol/render";
import Fill from "ol/style/Fill";
import { Coordinate } from "ol/coordinate";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { MapContext } from "@/MapPage/MapPage";


export const OlRouteLayer = ({
   map,
   mapContext,
   onDrawEnd,
   order
}: {
   mapContext: MapContext,
   onDrawEnd: (feature: Feature, layer: VectorLayer) => void;
} & OlLayerProp) => {
   const redMarker = useRef<HTMLImageElement>();
   const blueMarker = useRef<HTMLImageElement>();
   const greenMarker = useRef<HTMLImageElement>();

   const [newFeatures, setNewFeatures] = useState<Feature[]>();
   const drawRef = useRef<Draw>();
   const layer = useRef<VectorLayer>();

   useEffect(() => {
      if (newFeatures) {
         newFeatures.forEach(feature => onDrawEnd(feature, layer.current!));
         setNewFeatures(undefined);
      }
   }, [newFeatures])

   useEffect(() => {
      {
         const image = new Image();
         image.src = '/marker-icon-green.svg';

         greenMarker.current = image;
      }
      {
         const image = new Image();
         image.src = '/marker-icon-red.svg';

         redMarker.current = image;
      }
      {
         const image = new Image();
         image.src = '/marker-icon-blue.svg';

         blueMarker.current = image;
      }
   }, []);


   useEffect(() => {
      const features: Feature<Geometry>[] = [];

      const source = new VectorSource<Feature<Geometry>>({
         features: features
      });

      const style = new Style({
         stroke: new Stroke({
            width: 5
         })
      });

      const layer_ = new VectorLayer({
         source: source,
         style: (feature: FeatureLike) => {
            const geom = feature.getGeometry();
            if (geom?.getType() == 'MultiLineString') {
               return [new Style({
                  renderer: (coords, state) => {
                     const context = state.context;
                     const renderContext = toContext(context, {
                        pixelRatio: 1,
                     });
                     renderContext.setFillStrokeStyle(new Fill(), new Stroke({
                        width: 5
                     }));

                     const geometry = state.geometry.clone() as SimpleGeometry;
                     geometry.setCoordinates(coords);
                     renderContext.drawGeometry(geometry);

                     if (geometry.getType() == 'MultiLineString') {
                        const coords_ = (coords as Coordinate[][])[0];

                        for (const coord of coords_) {
                           if (coord == coords_[0]) {
                              if (greenMarker.current) {
                                 context.drawImage(greenMarker.current, coord[0] - 25, coord[1] - 50, 50, 50);
                              }
                           } else if (coord == coords_[coords_.length - 1]) {
                              if (redMarker.current) {
                                 context.drawImage(redMarker.current, coord[0] - 25, coord[1] - 50, 50, 50);
                              }
                           } else {
                              if (blueMarker.current) {
                                 context.drawImage(blueMarker.current, coord[0] - 25, coord[1] - 50, 50, 50);
                              }
                           }
                        }
                     }
                  }
               })]
            }

            return [style];
         }
      });

      layer.current = layer_;
      if (order !== undefined) {
         layer.current?.setZIndex(order);
      }

      const modify = new Modify({ source: source });
      const snap = new Snap({ source: source });

      mapContext.addNavRef.current = () => {
         if (drawRef.current) {
            map?.removeInteraction(drawRef.current);
         }

         const draw = new Draw({
            type: 'MultiLineString',
            source: source
         });

         drawRef.current = draw;
         map?.addInteraction(drawRef.current);

         draw.on('drawend', e => {
            map?.removeInteraction(draw);
            drawRef.current = undefined;

            setNewFeatures(features => ([...(features ?? []), e.feature]));
         });

      };
      mapContext.cancelRef.current = () => {
         if (drawRef.current) {
            map?.removeInteraction(drawRef.current);
            drawRef.current = undefined;
         }
      };
      mapContext.addFeatureRef.current = (feature: Feature) => {
         if (!source.hasFeature(feature)) {
            source.addFeature(feature);
         }
      };
      mapContext.removeFeatureRef.current = (feature: Feature) => {
         source.removeFeature(feature);
      };

      map?.addInteraction(modify);
      map?.addInteraction(snap);
      map?.addLayer(layer_);

      return () => {
         map?.removeInteraction(modify);
         map?.removeInteraction(snap);
         if (drawRef.current) {
            map?.removeInteraction(drawRef.current);
         }
         map?.removeLayer(layer_);
      };
   }, [map]);

   useEffect(() => {
      if (order != undefined) {
         layer.current?.setZIndex(order);
      }
   }, [order]);

   // create and add vector source layer

   return <></>;
};