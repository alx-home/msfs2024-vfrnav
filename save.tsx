'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';

import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import Geometry from 'ol/geom/Geometry';
import Modify from 'ol/interaction/Modify';
import Draw, { LineCoordType, PolyCoordType, SketchCoordType } from 'ol/interaction/Draw';

import WMTS from 'ol/source/WMTS.js';
import WMTSTileGrid from 'ol/tilegrid/WMTS.js';
import { get as getProjection, transform, fromLonLat, Projection } from 'ol/proj.js';
import { getTopLeft, getWidth } from 'ol/extent.js';
import View from 'ol/View.js';
import MapBrowserEvent from 'ol/MapBrowserEvent';
import { GeometryCollection, LineString, MultiLineString, Polygon, SimpleGeometry } from 'ol/geom';
import Stroke from 'ol/style/Stroke';

import "./ol.css";

const projection = getProjection('EPSG:3857')!;
const projectionExtent = projection.getExtent();
const size = projectionExtent ? getWidth(projectionExtent) / 256 : 1;
const resolutions = new Array(19);
const matrixIds = new Array(19);

for (let z = 0; z < 19; ++z) {
   // generate resolutions and matrixIds arrays for this WMTS
   resolutions[z] = size / Math.pow(2, z);
   matrixIds[z] = z;
}

const blueMarker = new Icon({
   anchor: [0.5, 1],
   opacity: 1,
   crossOrigin: 'anonymous',
   src: '/marker-icon-blue.svg',
});

const redMarker = new Icon({
   anchor: [0.5, 1],
   opacity: 1,
   crossOrigin: 'anonymous',
   src: '/marker-icon-red.svg',
});

const greenMarker = new Icon({
   anchor: [0.5, 1],
   opacity: 1,
   crossOrigin: 'anonymous',
   src: '/marker-icon-green.svg',
});

function OlMap({ features, onClick }: Readonly<{
   features?: Feature<Geometry>[], onClick?: (coord: number[]) => void
}>) {
   const [center,] = useState(fromLonLat([1.5911241345835847, 48.104707368204686]));//[288074.8449901076, 6247982.515792289]);
   const [zoom,] = useState(10);

   // set intial state
   const [map, setMap] = useState<Map>();
   const [featuresLayer, setFeaturesLayer] = useState<VectorLayer<VectorSource<Feature<Geometry>>>>();
   const [, setSelectedCoord] = useState<number[]>();

   // pull refs
   const mapElement = useRef<HTMLDivElement | null>(null);

   // create state ref that can be accessed in OpenLayers onclick callback function
   //  https://stackoverflow.com/a/60643670
   const mapRef = useRef<Map>();
   mapRef.current = map;

   // map click handler
   const handleMapClick = useCallback((event: MapBrowserEvent<UIEvent>) => {

      // get clicked coordinate using mapRef to access current React state inside OpenLayers callback
      //  https://stackoverflow.com/a/60643670
      const clickedCoord = mapRef.current?.getCoordinateFromPixel(event.pixel);

      if (clickedCoord) {
         // transform coord to EPSG 4326 standard Lat Long
         const transormedCoord = transform(clickedCoord, 'EPSG:3857', 'EPSG:4326')

         // set React state
         setSelectedCoord(transormedCoord)

         onClick?.(transormedCoord);
         console.log(transormedCoord)
      }
   }, [onClick]);

   // initialize map on first render - logic formerly put into componentDidMount
   useEffect(() => {
      const featuresSource = new VectorSource<Feature<Geometry>>({
         features: features
      });

      // create and add vector source layer 
      const initalFeaturesLayer = new VectorLayer({
         source: featuresSource,
         style: new Style({
            stroke: new Stroke({
               color: 'rgba(34, 164, 255, 0.8)',
               width: 5
            })
         })
      });

      // create map
      const initialMap = new Map({
         layers: [
            new TileLayer({
               opacity: 1.0,
               source: new WMTS({
                  url: 'https://data.geopf.fr/private/wmts?apikey=ign_scan_ws',
                  layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI',
                  matrixSet: 'PM',
                  version: '1.0.0',
                  format: 'image/jpeg',
                  projection: projection,
                  tileGrid: new WMTSTileGrid({
                     origin: getTopLeft(projectionExtent),
                     resolutions: resolutions,
                     matrixIds: matrixIds,
                  }),
                  style: 'normal',
                  wrapX: true,
               }),
            }),
            initalFeaturesLayer
         ],
         target: mapElement.current ?? undefined,
         view: new View({
            center: center,
            zoom: zoom,
         }),
      });

      initialMap.addInteraction(
         new Modify({
            source: featuresSource,
         })
      );

      const draw = new Draw({
         type: 'MultiLineString',
         source: featuresSource,
         style: new Style({
            stroke: new Stroke({
               color: 'rgba(34, 164, 255, 0.8)',
               width: 5
            })
         })
      });

      initialMap.addInteraction(
         draw
      );

      // set map onclick handler
      // initialMap.on('click', handleMapClick);

      // save map and vector layer references to state
      setMap(initialMap);
      setFeaturesLayer(initalFeaturesLayer);
      console.log('init');
   }, [center, handleMapClick, zoom]);

   // update map if features prop changes - logic formerly put into componentDidUpdate
   useEffect(() => {

      if (features?.length && featuresLayer) { // may be null on first render

         // set features to map
         featuresLayer.setSource(
            new VectorSource<Feature<Geometry>>({
               features: features // make sure features is an array
            })
         );

         console.log(features);

         // fit map to feature extent (with 100px of padding)
         // map?.getView().fit(featuresLayer.getSource().getExtent(), {
         //   padding: [100, 100, 100, 100]
         // })

      }

   }, [features, featuresLayer]);


   return (
      <div ref={mapElement} id="map" className="map"></div>
   );
}

export default function Home() {
   const [features, setFeatures] = useState<Feature<Geometry>[]>([]);

   const onClick = useCallback((coords: number[]) => {
      const marker = new Feature(new Point(fromLonLat(coords)));

      setFeatures(oldFeatures => {
         const newFeatures = [...oldFeatures];

         if (newFeatures.length) {
            marker.setStyle(new Style({ image: redMarker }));

            if (newFeatures.length > 1) {
               newFeatures[newFeatures.length - 1].setStyle(new Style({ image: blueMarker }));
            }

            const beginMarker = newFeatures[newFeatures.length - 1];
            const line = new Feature(new LineString([(beginMarker.getGeometry()! as Point).getCoordinates(), marker.getGeometry()!.getCoordinates()]));

            line.setStyle(new Style({
               stroke: new Stroke({
                  color: 'rgba(34, 164, 255, 0.8)',
                  width: 5
               })
            }));


            newFeatures[newFeatures.length] = line;
         } else {
            marker.setStyle(new Style({ image: greenMarker }));
         }

         newFeatures[newFeatures.length] = marker;
         return newFeatures;
      });
   }, []);

   return (
      <OlMap features={features} onClick={onClick} />
   );
} 
