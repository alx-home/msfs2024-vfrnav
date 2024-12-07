import { Draggable } from "@/Utils/Draggable";
import { useEffect, useState } from "react";

export class Layer {
   constructor(public src: string, public alt: string) { }
};

const LayerComp = ({ src, alt, onActiveChange }: Layer & { onActiveChange: (active: boolean) => void }) => {
   const [active, setActive] = useState<boolean>(true);

   useEffect(() => onActiveChange(active), [active]);

   return <button onClick={e => setActive(active => !active)}>
      <img src={src} alt={alt} {...(active ? { className: 'active-layer' } : {})} />
   </button>;
};

export type OnLayerChange = (layers: { index: number, order?: number, active?: boolean }[]) => void;

export const Layers = ({ layers, onLayerChange }: { layers: Layer[], onLayerChange: OnLayerChange }) => {
   return <>
      <h1>
         Layers
      </h1>
      <Draggable
         vertical={true}
         onOrdersChange={(orders: number[]) => {
            onLayerChange(orders.map((order, index) => ({ index: index, order: order })));
         }}>
         {layers.map((layer, index) => <LayerComp key={layer.alt} src={layer.src} alt={layer.alt} onActiveChange={active => onLayerChange([{ index: index, active: active }])} />)}
      </Draggable>
   </>;
};