'use client'

import { Draggable } from "@/Utils/Draggable";
import { useEffect, useRef, useState } from "react";

import Image from "next/image";

export class Layer {
   constructor(public src: string, public alt: string, public order: number) { }
};

const LayerComp = ({ src, alt, onActiveChange }: Layer & { onActiveChange: (active: boolean) => void }) => {
   const [active, setActive] = useState<boolean>(true);
   const [transition, setTransition] = useState(false);
   const ref = useRef<HTMLButtonElement | null>(null);

   useEffect(() => onActiveChange(active), [active]);
   useEffect(() => {
      setTransition(false);
      setTimeout(() => setTransition(true), 10);
   }, []);

   return <button className={'group transition-[filter] transition-std border-l-4' + (active ? ' border-l-msfs' : ' border-l-gray-600')}
      ref={ref}
      onClick={e => setActive(active => !active)}
      onMouseUp={e => ref.current?.blur()}>
      <Image width={200} height={200} src={src} alt={alt}
         className={'block ml-auto mr-auto group-hocus:brightness-75 group-hocus:contrast-150 '
            + (transition ? ' transition-[width]' : '')
            + ' w-28 @lg:border-l-2'
            + ' @[150px]:w-52 @lg:border-l-4'
            + ' @[200px]:w-72 @lg:border-l-8'
         } />
   </button>;
};

export type OnLayerChange = (layers: { index: number, order?: number, active?: boolean }[]) => void;

export const Layers = ({ layers, onLayerChange }: { layers: Layer[], onLayerChange: OnLayerChange }) => {
   return <>
      <div className="flex min-h-12 shrink-0 items-center justify-between ps-1 text-2xl font-semibold">
         Layers
      </div>
      <Draggable className='@container flex flex-col p-4 gap-2 w-full overflow-hidden'
         vertical={true}
         onOrdersChange={(orders: number[]) => {
            onLayerChange(orders.map((order, index) => ({ index: index, order: order })));
         }}>
         {layers.map((layer, index) =>
            <LayerComp order={layer.order} key={layer.alt} src={layer.src} alt={layer.alt}
               onActiveChange={active => onLayerChange([{ index: index, active: active }])} />
         )}
      </Draggable>
   </>;
};