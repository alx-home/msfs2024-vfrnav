import { Scroll } from "@/Utils/Scroll";
import { PropsWithChildren, useEffect, useState } from "react";

const Section = ({ children, title }: PropsWithChildren<{
   title: string
}>) => {
   return <ul className="transition transition-std flex flex-col gap-2 [&>*]:text-center hover:bg-white hover:text-slate-700 p-12 px-20 first:pt-20 last:pb-20">
      <h1 className="mb-4">{title}</h1>
      {children}
   </ul>;
};

export const CreditsPage = ({ active }: {
   active: boolean
}) => {
   const [opacity, setOpacity] = useState(' opacity-0');

   useEffect(() => {
      if (active) {
         setOpacity(' opacity-100');
      } else {
         setOpacity(' opacity-0');
      }
   }, [active]);

   return <div className="flex grow p-12 align-middle justify-center max-h-full " style={active ? {} : { display: 'none' }}>
      <div className={"flex flex-col m-auto max-h-full transition transition-std shadow-md rounded-sm border-2 bg-gray-700 border-gray-900 hocus:border-msfs"
         + opacity
      }>
         <Scroll>
            <Section title='OpenLayer'>
               <li>
                  © <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md" target="_blank" rel="noreferrer">openlayers</a>.
               </li>
            </Section>
            <Section title='OpenLayer Layers'>
               <li>
                  © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors.
               </li>
               <li>
                  © 2024 Microsoft Corporation.
               </li>
               <li>
                  Microsoft <a className="ol-attribution-bing-tos" href="https://www.microsoft.com/maps/product/terms.html" target="_blank" rel="noreferrer">Terms of Use</a>.
               </li>
               <li>
                  Earthstar Geographics  SIO.
               </li>
               <li>
                  © 2024 TomTom.
               </li>
            </Section>
            <Section title='MSFS2024 VFRNav'>
               <li>
                  © <a href="https://github.com/alx-home/msfs2024-vfrnav/blob/master/LICENSE" target="_blank" rel="noreferrer">MSFS2024 VFRNav&apos;</a>.
               </li>
            </Section>
         </Scroll>
      </div>
   </div >;
}