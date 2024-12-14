import { MapMenu, Menu } from "@/MapPage/MapMenu/MapMenu";
import { NavData } from '@/MapPage/MapMenu/Menus/Nav';
import { OlBingLayer } from "@/Ol/layers/OlBingLayer";
import { OlOSMLayer } from "@/Ol/layers/OlOSMLayer";
import { OlRouteLayer } from "@/Ol/layers/OlRoute";
import { OlWMTSLayer } from "@/Ol/layers/OlWMTSLayer";
import { OlMap } from "@/Ol/OlMap";
import { getTopLeft, getWidth } from 'ol/extent.js';
import { get as getProjection } from 'ol/proj.js';
import { Dispatch, MutableRefObject, SetStateAction, useMemo, useRef, useState } from "react";

import flightPlanImg from '@/../public/flight-plan.svg';
import layersImg from '@/../public/layers.svg';
import Image from "next/image";

import { Feature } from "ol";
import VectorLayer from "ol/layer/Vector";
import { StaticImport } from "next/dist/shared/lib/get-img-props";

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

export class MapContext {
   constructor(
      public readonly addNavRef: MutableRefObject<(() => void) | undefined>,
      public readonly cancelRef: MutableRefObject<(() => void) | undefined>,
      public readonly addFeatureRef: MutableRefObject<((feature: Feature) => void) | undefined>,
      public readonly removeFeatureRef: MutableRefObject<((feature: Feature) => void) | undefined>,
      public readonly setNavData: Dispatch<SetStateAction<NavData[]>>,
      public readonly setCounter: Dispatch<SetStateAction<number>>,
      public readonly navData: NavData[],
      public readonly counter: number,
      public readonly flash: boolean,
      public readonly setFlash: Dispatch<SetStateAction<boolean>>,
      public readonly flashKey: number,
      public readonly setFlashKey: Dispatch<SetStateAction<number>>,
      public readonly aircraftSpeed: number,
      public readonly setAircraftSpeed: Dispatch<SetStateAction<number>>
   ) { }

   public triggerFlash(value?: boolean) {
      if (value ?? true) {
         this.setFlashKey(key => key + 1);
      }
      this.setFlash(value ?? true);
   }

   public addNav() {
      this.addNavRef?.current?.();
   }

   public cancel() {
      this.cancelRef?.current?.();
   }

   public editNav(name: string, newName: string) {
      this.setNavData(items => {
         const newItems = [...items];
         const item = newItems.find((item) => item.name === name);
         if (item) {
            item.name = newName;
         }
         return newItems;
      })
   }
   public activeNav(name: string, active: boolean) {
      this.setNavData(items => {
         const newItems = [...items];
         newItems.find((item) => item.name === name)!.active = active;
         return newItems;
      });
   }

   public removeNav(name: string) {
      this.setNavData(items => {
         const newItems = [...items];
         newItems.splice(newItems.findIndex((item) => item.name === name), 1);
         return newItems;
      });
   }

   public addFeature(feature: Feature) {
      this.addFeatureRef?.current?.(feature);
   }

   public removeFeature(feature: Feature) {
      this.removeFeatureRef?.current?.(feature);
   }

   static readonly use = () => {
      const addNav = useRef<() => void>();
      const cancel = useRef<() => void>();
      const addFeature = useRef<(feature: Feature) => void>();
      const removeFeature = useRef<(feature: Feature) => void>();
      const [navData, setNavData] = useState<NavData[]>([]);
      const [counter, setCounter] = useState(0);
      const [flash, setFlash] = useState(false);
      const [flashKey, setFlashKey] = useState(0);
      const [aircraftSpeed, setAircraftSpeed] = useState(95);

      const context = useMemo<MapContext>(() => new MapContext(addNav, cancel, addFeature, removeFeature, setNavData, setCounter, navData, counter, flash, setFlash, flashKey, setFlashKey, aircraftSpeed, setAircraftSpeed), [navData, counter, flash, flashKey, aircraftSpeed]);

      return context;
   };
};

const OverlayItem = ({ menu, setMenu, setOpen, image, alt, currentMenu }: {
   menu: Menu,
   setMenu: Dispatch<SetStateAction<Menu>>,
   setOpen: Dispatch<SetStateAction<boolean>>,
   image: string | StaticImport,
   alt: string,
   currentMenu: Menu
}) => {
   return <button className='p-2 h-9 w-full bg-overlay hocus:bg-highlight'
      onClick={() => {
         setOpen(open => menu !== currentMenu ? true : !open);
         setMenu(currentMenu);
      }}
      onMouseUp={e => e.currentTarget.blur()}>
      <Image src={image} alt={alt} />
   </button>;
};

const Overlay = ({ menu, setMenu, setOpen }: {
   menu: Menu,
   setMenu: Dispatch<SetStateAction<Menu>>,
   setOpen: Dispatch<SetStateAction<boolean>>
}) => {
   return <div className='flex flex-col justify-end m-2 w-9 pointer-events-auto'>
      <OverlayItem menu={menu} setMenu={setMenu} setOpen={setOpen} currentMenu={Menu.layers} alt='layers' image={layersImg} />
      <OverlayItem menu={menu} setMenu={setMenu} setOpen={setOpen} currentMenu={Menu.nav} alt='flight plan' image={flightPlanImg} />
   </div>;
};

const SpinAnimation = ({ mapContext }: {
   mapContext: MapContext
}) => {
   return <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center" >
      <span key={mapContext.flashKey}
         className={"animate-ping-1 m-auto inline-flex aspect-square w-2/4 rounded-full bg-sky-400 opacity-75 justify-center"
            + (mapContext.flash ? '' : ' hidden')}
         onAnimationIteration={() => mapContext.triggerFlash(false)}
      >
         <h1 className="flex justify-center text-[2vw] m-auto">
            Start Drawing !
         </h1>
      </span>
   </div>;
}

export const MapPage = ({ active }: {
   active: boolean
}) => {
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
   const mapContext = MapContext.use();

   return <div className='relative grow h-100' style={active ? {} : { display: 'none' }}>
      <OlMap id='map' className='absolute w-full h-full top-0 left-0' mapContext={mapContext}>
         {layers.map(layer => ({ ...layer.olLayer, props: { ...layer.olLayer.props, order: layer.order, active: layer.active } }))}
         <OlRouteLayer
            mapContext={mapContext}
            order={layers.length}
            onDrawEnd={(feature: Feature, layer: VectorLayer) => {
               mapContext.setNavData(items => {
                  const { counter } = mapContext;
                  return [...items, { id: counter, active: active, name: `New Nav ${counter}`, shortName: `${counter}`, feature: feature, layer: layer }];
               });
               mapContext.setCounter(counter => counter + 1);
            }} />
      </OlMap>
      <div className="absolute z-10 pointer-events-none flex grow justify-end w-full h-full top-0 left-0">
         <div className={"relative flex grow justify-end h-full overflow-hidden"} >
            <SpinAnimation mapContext={mapContext} />
            <Overlay menu={menu} setMenu={setMenu} setOpen={setOpen} />
         </div>
         <div className="flex flex-row pointer-events-auto">
            <MapMenu open={open} setOpen={setOpen} menu={menu} layers={layers}
               mapContext={mapContext}
               onLayerChange={(values) =>
                  setLayers(layers => {
                     const newLayers = [...layers];

                     values.forEach(elem => {
                        if (elem.order !== undefined) {
                           newLayers[elem.index].order = elem.order;
                        }
                        if (elem.active !== undefined) {
                           newLayers[elem.index].active = elem.active;
                        }
                     });

                     return newLayers;
                  })
               } />
         </div>
      </div>
   </div>;
}