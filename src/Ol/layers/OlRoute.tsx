'use client'

import { OlLayerProp } from "./OlLayer";
import VectorSource from "ol/source/Vector";
import { Feature, Map } from "ol";
import { Geometry, LineString, MultiLineString, SimpleGeometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import Draw from "ol/interaction/Draw";
import Modify from "ol/interaction/Modify";
import Snap from "ol/interaction/Snap";
import { doubleClick } from 'ol/events/condition';
import { FeatureLike } from "ol/Feature";
import Style from "ol/style/Style";
import Stroke from "ol/style/Stroke";
import { getLength } from 'ol/sphere';
import { toContext } from "ol/render";
import Fill from "ol/style/Fill";
import { Coordinate } from "ol/coordinate";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { MapContext } from "@/MapPage/MapPage";
import { SettingsContext } from "@/Settings";

const useMap = (map?: Map) => {
   const [, setNextId] = useState(1);
   const sourceRef = useRef<VectorSource<Feature<Geometry>>>();
   const modifyRef = useRef<Modify>();
   const snapRef = useRef<Snap>();
   const layerRef = useRef<VectorLayer>();
   const [modified, setModified] = useState<Feature[]>();
   const [newFeatures, setNewFeatures] = useState<Feature[]>();

   const removeRefs = useCallback(() => {
      if (layerRef.current) {
         map?.removeLayer(layerRef.current);
         layerRef.current = undefined;
      }
      if (modifyRef.current) {
         map?.removeInteraction(modifyRef.current);
         modifyRef.current = undefined;
      }
      if (snapRef.current) {
         map?.removeInteraction(snapRef.current);
         snapRef.current = undefined;
      }

      sourceRef.current = undefined;
   }, [map]);

   useEffect(() => {
      removeRefs();

      const features: Feature<Geometry>[] = [];

      const source = new VectorSource<Feature<Geometry>>({
         features: features
      });
      sourceRef.current = source;
      source.on('addfeature', e => {
         if (e.feature && e.feature.getId() === undefined) {
            setNextId(id => {
               e.feature!.setId(id);

               setNewFeatures(newFeatures => {
                  const result = ([...(newFeatures ?? [])]);
                  const index = result.findIndex(elem => elem.getId() === e.feature!.getId());

                  if (index === -1) {
                     result[result.length] = e.feature!;
                  } else {
                     result[index] = e.feature!;
                  }

                  return result;
               });
               return id + 1;
            });
         }
      });

      const layer_ = new VectorLayer({
         source: source
      });
      layerRef.current = layer_;

      map?.addLayer(layer_);

      const modify = new Modify({
         source: source,
         deleteCondition: doubleClick
      });
      const snap = new Snap({ source: source });

      modify.on('modifyend', e => {
         setModified(features => {
            const newFeatures = [...(features ?? [])];
            e.features.forEach(feature => {
               const index = newFeatures.findIndex((elem) => elem.getId() === feature.getId());

               if (index !== -1) {
                  newFeatures[index] = feature;
               } else {
                  newFeatures[newFeatures.length] = feature;
               }
            });

            return newFeatures;
         });
      });

      modifyRef.current = modify;
      snapRef.current = snap;

      map?.addInteraction(modify);
      map?.addInteraction(snap);

      return () => {
         removeRefs();
      };
   }, [map, removeRefs, setNewFeatures, setNextId]);

   useEffect(() => {
      if (modified) {
         setModified(undefined);
      }
   }, [modified]);

   useEffect(() => {
      if (newFeatures) {
         setNewFeatures(undefined);
      }
   }, [newFeatures, setNewFeatures]);

   return {
      source: sourceRef.current,
      modify: modifyRef.current,
      snap: snapRef.current,
      layer: layerRef.current,
      modified: modified,
      newFeatures: newFeatures
   };
};

const useDraw = (mapContext: MapContext, layer?: VectorLayer, map?: Map, source?: VectorSource<Feature<Geometry>>) => {
   const drawRef = useRef<Draw>();
   useEffect(() => {
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
         mapContext.triggerFlash();

         draw.on('drawend', () => {
            map?.removeInteraction(draw);
         });
      };
   }, [map, mapContext, source]);

   useEffect(() => () => {
      if (drawRef.current) {
         map?.removeInteraction(drawRef.current);
         drawRef.current = undefined;
      }
   }, [map]);

   return { draw: drawRef.current };
}

export const OlRouteLayer = ({
   map,
   mapContext,
   onAddFeature,
   order,
   zIndex
}: {
   mapContext: MapContext,
   onAddFeature: (feature: Feature, layer: VectorLayer) => void,
   zIndex: number
} & OlLayerProp) => {
   const redMarker = useRef<HTMLImageElement>();
   const blueMarker = useRef<HTMLImageElement>();
   const greenMarker = useRef<HTMLImageElement>();

   const settings = useContext(SettingsContext);
   const { source, layer, modified, newFeatures } = useMap(map);
   const { draw } = useDraw(mapContext, layer, map, source);

   useEffect(() => {
      newFeatures?.forEach(feature => {
         onAddFeature(feature, layer!)
      });
   }, [newFeatures, onAddFeature, layer]);

   const navRenderer = useMemo(() => (feature: FeatureLike) => {
      const geom = feature.getGeometry();

      if (geom?.getType() === 'MultiLineString') {
         const geoCoords = (geom as MultiLineString).getCoordinates();

         return [new Style({
            renderer: (coords, state) => {
               const context = state.context;
               const renderContext = toContext(context, {
                  pixelRatio: 1,
               });

               const geometry = state.geometry.clone() as SimpleGeometry;
               geometry.setCoordinates(coords);


               renderContext.setFillStrokeStyle(new Fill(), new Stroke({
                  width: 5,
                  color: 'white'
               }));
               renderContext.drawGeometry(geometry);

               renderContext.setFillStrokeStyle(new Fill(), new Stroke({
                  width: 4,
                  color: '#1f2937'
               }));
               renderContext.drawGeometry(geometry);

               if (geometry.getType() === 'MultiLineString') {
                  const coords_ = (coords as Coordinate[][])[0];

                  // Draw markers
                  //------------------------------
                  coords_.forEach((coord, index) => {
                     if (index === 0) {
                        // First Coord
                        if (greenMarker.current) {
                           context.drawImage(greenMarker.current, coord[0] - 25, coord[1] - 50, 50, 50);
                        }
                     } else if (index === coords_.length - 1) {
                        // Last Coord
                        if (redMarker.current) {
                           context.drawImage(redMarker.current, coord[0] - 25, coord[1] - 50, 50, 50);
                        }
                     } else {
                        // Coord in between
                        if (blueMarker.current) {
                           context.drawImage(blueMarker.current, coord[0] - 25, coord[1] - 50, 50, 50);
                        }
                     }
                  });

                  // Draw Distance/cap
                  //------------------------------
                  coords_.forEach((coord, index) => {
                     if (index !== coords_.length - 1) {
                        const nextCoord = coords_[index + 1];

                        const vector = [nextCoord[0] - coord[0], nextCoord[1] - coord[1]];
                        let angle = Math.atan2(vector[1], vector[0]);
                        let mag = -angle * 180 / Math.PI;

                        if (mag < 0) {
                           mag += 360;
                        }

                        if ((angle * 2 < -Math.PI) || (2 * angle > Math.PI)) {
                           angle = angle - Math.PI;
                        }

                        const distance = Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1]);

                        const geoDistance = (getLength((new LineString([geoCoords[0][index], geoCoords[0][index + 1]]))) * 0.0005399568);
                        const text = mag.toFixed(0) + "°  " + geoDistance.toFixed(0) + " nm  " + (geoDistance * 60 / settings.speed).toFixed(0) + "'";
                        context.font = Math.min(distance * 2 / text.length, 24).toFixed(0) + "px Inter, sans-serif";

                        const center = [(coord[0] + nextCoord[0]) / 2, (coord[1] + nextCoord[1]) / 2];
                        context.save();
                        context.fillStyle = '#1f2937';
                        context.strokeStyle = 'white';
                        context.lineWidth = 1;
                        context.textAlign = "center";
                        context.translate(center[0], center[1]);
                        context.rotate(angle);
                        context.translate(0, -5);
                        context.strokeText(text, 0, 0);
                        context.fillText(text, 0, 0);
                        context.restore();
                     }
                  });
               }
            }
         })]
      }

      return [];
   }, [settings.speed]);

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
      layer?.setZIndex(zIndex);
   }, [zIndex, layer]);

   useEffect(() => {
      if (layer) {
         layer.setStyle(navRenderer);
      }
   }, [navRenderer, layer]);

   useEffect(() => {
      if (order !== undefined) {
         layer?.setZIndex(order);
      }
   }, [order, layer]);

   useEffect(() => {
      mapContext.cancelRef.current = () => {
         if (draw) {
            map?.removeInteraction(draw);
         }
      };
   }, [map, mapContext.cancelRef, draw]);

   useEffect(() => {
      if (modified) {
         modified.forEach((feature) => {
            const data = mapContext.navData.find(elem => elem.feature.getId() === feature.getId());
            console.assert(data);
            data!.feature = feature
         });
      }
   }, [modified, mapContext.navData]);

   useEffect(() => {
      if (source) {
         const features = mapContext.navData.filter(data => data.active).toSorted((left, right) => left.order - right.order).map(data => {
            const feature = data.feature.clone();
            feature.setId(data.feature.getId());
            return feature;
         });
         source.clear();
         source.addFeatures(features);
      }
   }, [mapContext.navData, source]);


   useEffect(() => {
      if (order !== undefined) {
         layer?.setZIndex(order);
      }
   }, [order, layer]);

   // create and add vector source layer

   return <></>;
};