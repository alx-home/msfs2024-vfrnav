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
import { useEffect, useRef } from "react";


export const OlRouteLayer = ({
   map
}: {
} & OlLayerProp) => {
   const redMarker = useRef<HTMLImageElement>();
   const blueMarker = useRef<HTMLImageElement>();
   const greenMarker = useRef<HTMLImageElement>();

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

      const layer = new VectorLayer({
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

      // const draw = new Draw({
      //    type: 'MultiLineString',
      //    source: source
      // });

      // const modify = new Modify({ source: source });

      // const snap = new Snap({ source: source });

      // map?.addInteraction(draw);
      // map?.addInteraction(modify);
      // map?.addInteraction(snap);
      map?.addLayer(layer);

      return () => {
         // map?.removeInteraction(draw);
         // map?.removeInteraction(modify);
         // map?.removeInteraction(snap);
         map?.removeLayer(layer);
      };
   }, [map]);

   // create and add vector source layer

   return <></>;
};