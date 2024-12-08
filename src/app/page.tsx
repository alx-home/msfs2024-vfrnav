'use client'

import MouseContextProvider from '@/Events/MouseContext';

import "./ol.css";
import '@/app/page.css'
import { MapPage } from '@/MapPage/MapPage';
import { Menu } from '@/Menu/Menu';
import { useState } from 'react';
import Image from "next/image";

import mapImg from '@/../public/map.svg';
import settingsImg from '@/../public/settings.svg';

export class Page {
  constructor(public readonly name: string, public readonly icon: JSX.Element, public readonly elem: JSX.Element) { }
};

export default function Home() {
  const [page, setPage] = useState<string>("map");
  const pages: Page[] = [
    {
      name: "map",
      icon: <Image src={mapImg} alt='map' />,
      elem: <MapPage key="map" active={page == "map"} />
    },
    {
      name: "other",
      icon: <Image src={settingsImg} alt='other' />,
      elem: <div key="other" />
    }
  ];

  return (
    <MouseContextProvider>
      <div className='Home'>
        <Menu pages={pages} setPage={page => setPage(page)} />
        {pages.map(elem => elem.elem)}
      </div>
    </MouseContextProvider>
  );
} 
