'use client'

import MouseContextProvider from '@/Events/MouseContext';

import "./ol.css";
import '@/app/page.css'
import { MapPage } from '@/MapPage/MapPage';
import { Menu } from '@/app/Menu';
import { useState } from 'react';
import Image from "next/image";

import mapImg from '@/../public/map.svg';
import navlogImg from '@/../public/navlog.svg';
import settingsImg from '@/../public/settings.svg';
import creditsImg from '@/../public/credits.svg';

export class Page {
  public readonly type: string = 'page';
  public readonly name: string;
  public readonly icon: JSX.Element;
  public readonly elem: JSX.Element;
  public readonly disabled?: boolean;

  constructor({ name, icon, elem, disabled }: {
    name: string,
    icon: JSX.Element,
    elem: JSX.Element,
    disabled?: boolean
  }) {
    this.name = name;
    this.icon = icon;
    this.elem = elem;
    this.disabled = disabled ?? false;
  }
};

export class Space {
  public readonly type: string = 'space';
  public readonly elem: JSX.Element = <></>;
};

export const App = () => {
  const [page, setPage] = useState<string>("map");
  const pages: (Page | Space)[] = [
    new Page({
      name: "map",
      icon: <Image src={mapImg} alt='map' />,
      elem: <MapPage key="map" active={page === "map"} />
    }),
    new Page({
      name: "navlog",
      icon: <Image src={navlogImg} alt='nav log' />,
      elem: <div key="nvlog" />,
      disabled: true
    }),
    new Page({
      name: "settings",
      icon: <Image src={settingsImg} alt='settings' />,
      elem: <div key="settings" />,
      disabled: true
    }),
    new Space(),
    new Page({
      name: "credits",
      icon: <Image src={creditsImg} alt='credits' />,
      elem: <div key="credits" />,
      disabled: true
    })
  ];

  return (
    <MouseContextProvider>
      <div className='Home'>
        <Menu pages={pages} setPage={page => setPage(page)} activePage={page} />
        {pages.map(elem => elem.elem)}
      </div>
    </MouseContextProvider>
  );
};
