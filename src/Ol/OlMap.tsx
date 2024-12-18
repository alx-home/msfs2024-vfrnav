import useKeyUp from "@/Events/KeyUp";
import useMouseRelease from "@/Events/MouseRelease";
import { MapContext } from "@/MapPage/MapPage";
import { Collection, Map, View } from "ol";
import BaseLayer from "ol/layer/Base";
import { fromLonLat } from "ol/proj";
import { defaults } from "ol/interaction/defaults";
import { Children, isValidElement, PropsWithChildren, useEffect, useRef, useState } from "react";

export const OlMap = ({ children, id, className, mapContext }: PropsWithChildren<{ id: string, className: string, mapContext: MapContext }>) => {
   const [center,] = useState(fromLonLat([1.5911241345835847, 48.104707368204686]));
   const [zoom,] = useState(10);
   const keyUp = useKeyUp();
   const [mouseInside, setMouseInside] = useState(false);
   const mouseRelease = useMouseRelease();

   useEffect(() => {
      if (mouseRelease) {
         if (!mouseInside) {
            mapContext.cancel();
         }
      }
   }, [mouseRelease, mapContext, mouseInside]);

   useEffect(() => {
      if (keyUp === 'Escape') {
         mapContext.cancel();
      }
   }, [keyUp, mapContext])

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
         interactions: defaults({ doubleClickZoom: false })
      });

      setMap(initialMap);
   }, [center, zoom]);

   return <div className={"flex " + className}
      onMouseLeave={() => setMouseInside(false)}
      onMouseEnter={() => setMouseInside(true)}
   >
      <div ref={mapElement} id={id} className="grow w-full" />
      {Children.map(children, (child) => {
         if (!isValidElement(child)) return child;

         return {
            ...child, props: {
               ...child.props, map: map
            }
         };
      })}
   </div>;
}