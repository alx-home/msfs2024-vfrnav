import { Collection, Map, View } from "ol";
import BaseLayer from "ol/layer/Base";
import { fromLonLat } from "ol/proj";
import { Children, isValidElement, PropsWithChildren, useEffect, useRef, useState } from "react";

export const OlMap = ({ children, id, className }: PropsWithChildren<{ id: string, className: string }>) => {
   const [center,] = useState(fromLonLat([1.5911241345835847, 48.104707368204686]));
   const [zoom,] = useState(10);

   // set intial state
   const [map, setMap] = useState<Map>();

   // pull refs
   const mapElement = useRef<HTMLDivElement | null>(null);

   // initialize map on first render - logic formerly put into componentDidMount
   useEffect(() => {
      const layers = new Collection<BaseLayer>();

      // create map
      const initialMap = new Map({
         layers: layers,
         target: mapElement.current ?? undefined,
         view: new View({
            center: center,
            zoom: zoom,
         }),
      });

      setMap(initialMap);
   }, [center, zoom]);

   return <>
      <div ref={mapElement} id={id} className={className}></div>
      {Children.map(children, (child) => {
         if (!isValidElement(child)) return child;

         return {
            ...child, props: {
               ...child.props, map: map
            }
         };
      })}
   </>;
}