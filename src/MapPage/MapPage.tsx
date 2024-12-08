import { MapMenu, Menu } from "@/MapMenu/MapMenu";
import { NavData } from '@/MapMenu/Menus/Nav';
import { OlBingLayer } from "@/Ol/layers/OlBingLayer";
import { OlOSMLayer } from "@/Ol/layers/OlOSMLayer";
import { OlRouteLayer } from "@/Ol/layers/OlRoute";
import { OlWMTSLayer } from "@/Ol/layers/OlWMTSLayer";
import { OlMap } from "@/Ol/OlMap";
import { getTopLeft, getWidth } from 'ol/extent.js';
import { get as getProjection } from 'ol/proj.js';
import { useRef, useState } from "react";

import flightPlanImg from '@/../public/flight-plan.svg';
import layersImg from '@/../public/layers.svg';
import Image from "next/image";

import './style.css';
import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";

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

export const MapPage = ({ active }: { active: boolean }) => {
   const [open, setOpen] = useState(false);
   const [menu, setMenu] = useState<Menu>(Menu.layers);
   const [layers, setLayers] = useState([
      {
         olLayer: <OlWMTSLayer key="wmts"
            opacity={1.0}
            url={'https://data.geopf.fr/private/wmts?apikey=ign_scan_ws'}
            layer={'GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-OACI'}
            version={'1.0.0'}
            projection={projection}
            tileGrid={{
               origin: getTopLeft(projectionExtent),
               resolutions: resolutions,
               matrixIds: matrixIds,
            }}
         />,
         src: '/oaci.png',
         alt: 'oaci layer'
      },
      {
         olLayer: <OlOSMLayer key="osm" />,
         src: '/osm.png',
         alt: 'osm layer'
      },
      {
         olLayer: <OlBingLayer key="bing" />,
         src: '/bing.png',
         alt: 'bing layer'
      }
   ].map((elem, index) => ({
      ...elem,
      order: index,
      active: true
   })));
   const [navData, setNavData] = useState<NavData[]>([]);
   const [counter, setCounter] = useState(0);
   const addNav = useRef<() => void>();
   const addFeature = useRef<(feature: Feature) => void>();
   const removeFeature = useRef<(feature: Feature) => void>();

   return <div className='map-container' style={active ? {} : { display: 'none' }}>
      <OlMap id='map' className='map'>
         {layers.map(layer => ({ ...layer.olLayer, props: { ...layer.olLayer.props, order: layer.order, active: layer.active } }))}
         <OlRouteLayer
            addNav={addNav}
            addFeature={addFeature}
            removeFeature={removeFeature}
            order={layers.length}
            onDrawEnd={(feature: Feature, layer: VectorLayer) => {
               setNavData(items => ([...items, { id: counter, active: active, name: `New Nav ${counter}`, shortName: `${counter}`, feature: feature, layer: layer }]));
               setCounter(counter => counter + 1);
            }} />
      </OlMap>
      <div className='map-overlay'>
         <div className='map-menu'>
            <button onClick={() => { setOpen(open => menu != Menu.layers ? true : !open); setMenu(Menu.layers); }}>
               <Image src={layersImg} alt='layers' />
            </button>
            <button onClick={() => { setOpen(open => menu != Menu.nav ? true : !open); setMenu(Menu.nav); }}>
               <Image src={flightPlanImg} alt='flight plan' />
            </button>
         </div>
         <MapMenu open={open} setOpen={setOpen} menu={menu} layers={layers} navData={navData}
            addNav={() => {
               addNav.current?.();
            }}
            addFeature={feature => addFeature.current?.(feature)}
            removeFeature={feature => removeFeature.current?.(feature)}
            removeNav={(name: string) => setNavData(items => {
               const newItems = [...items];
               newItems.splice(newItems.findIndex((item) => item.name == name), 1);
               return newItems;
            })}
            editNav={((name: string, newName: string) => {
               setNavData(items => {
                  const newItems = [...items];
                  const item = newItems.find((item) => item.name == name);
                  if (item) {
                     item.name = newName;
                  }
                  return newItems;
               })
            })}

            onLayerChange={(values) =>
               setLayers(layers => {
                  const newLayers = [...layers];

                  values.forEach(elem => {
                     if (elem.order != undefined) {
                        newLayers[elem.index].order = elem.order;
                     }
                     if (elem.active != undefined) {
                        newLayers[elem.index].active = elem.active;
                     }
                  });

                  return newLayers;
               })
            } />
      </div>
   </div>;
}