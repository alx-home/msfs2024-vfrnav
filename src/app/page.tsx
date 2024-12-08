'use client'


import { get as getProjection } from 'ol/proj.js';
import { getTopLeft, getWidth } from 'ol/extent.js';

import { OlMap } from '../Ol/OlMap';
import { OlWMTSLayer } from '@/Ol/layers/OlWMTSLayer';
import { OlRouteLayer } from '@/Ol/layers/OlRoute';

import "./ol.css";
import { MapMenu, Menu } from '@/MapMenu/MapMenu';
import { useState } from 'react';

import '@/app/page.css'
import MouseContextProvider from '@/Events/MouseContext';
import { OlOSMLayer } from '@/Ol/layers/OlOSMLayer';
import { OlBingLayer } from '@/Ol/layers/OlBingLayer';
import { OlEmptyLayer } from '@/Ol/layers/OlEmpty';

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

export default function Home() {
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

  return (
    <MouseContextProvider>
      <div className='Home'>
        <div className='menu'>
          <img src='/map.svg' alt='map' />
          <img src='/map.svg' alt='map' />
          <img src='/map.svg' alt='map' />
        </div>
        <div className='map-container'>
          <OlMap id='map' className='map'>
            {layers.map(layer => ({ ...layer.olLayer, props: { ...layer.olLayer.props, order: layer.order, active: layer.active } }))}
            <OlRouteLayer />
          </OlMap>
          <div className='map-overlay'>
            <div className='map-menu'>
              <div onClick={() => { setOpen(open => menu != Menu.layers ? true : !open); setMenu(Menu.layers); }}>
                <img src='/layers.svg' alt='layers' />
              </div>
              <div onClick={() => { setOpen(open => menu != Menu.nav ? true : !open); setMenu(Menu.nav); }}>
                <img src='/flight-plan.svg' alt='flight plan' />
              </div>
            </div>
            <MapMenu open={open} setOpen={setOpen} menu={menu} layers={layers}
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
        </div>
      </div>
    </MouseContextProvider>
  );
} 
