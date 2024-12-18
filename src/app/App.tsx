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
import { CreditsPage } from '@/CreditsPage/CreditsPage';
import { SettingsPage } from '@/SettingsPage/SettingsPage';
import SettingsContextProvider from '@/Settings';

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
  constructor(public readonly index: number) { }
  public readonly type: string = 'space';
  public readonly elem: JSX.Element = <div className='my-1' key={'space_' + this.index}></div>;
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
      elem: <SettingsPage key="settings" active={page === "settings"} />
    }),
    new Space(1),
    new Page({
      name: "credits",
      icon: <Image src={creditsImg} alt='credits' />,
      elem: <CreditsPage key="credits" active={page === "credits"} />
    })
  ];

  return (
    <MouseContextProvider>
      <SettingsContextProvider>
        <div key='home' className='Home'>
          <Menu pages={pages} setPage={page => setPage(page)} activePage={page} />
          {pages.map(elem => elem.elem)}
        </div>
      </SettingsContextProvider>
    </MouseContextProvider>
  );
};
