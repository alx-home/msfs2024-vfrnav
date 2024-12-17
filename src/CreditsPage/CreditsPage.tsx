import { PropsWithChildren, useEffect, useState } from "react";

const Section = ({ children, title }: PropsWithChildren<{ title: string }>) => {
   return <ul className="transition transition-std flex flex-col gap-2 [&>*]:text-center hover:bg-white hover:text-slate-700 p-12">
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

   return <div className="flex grow justify-center m-12 p-2" style={active ? {} : { display: 'none' }}>
      <div className={"transition transition-std max-w-2xl m-auto bg-gray-700 shadow-md flex text-left rounded-sm border-2 border-gray-900 flex-col hocus:border-msfs"
         + opacity
      }>
         <Section title='OpenLayer'>
            <li>
               © <a href="https://github.com/openlayers/openlayers/blob/main/LICENSE.md" target="_blank">openlayers</a>.
            </li>
         </Section>
         <Section title='OpenLayer Layers'>
            <li>
               © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors.
            </li>
            <li>
               © 2024 Microsoft Corporation.
            </li>
            <li>
               Microsoft <a className="ol-attribution-bing-tos" href="https://www.microsoft.com/maps/product/terms.html" target="_blank">Terms of Use</a>.
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
               © <a href="https://github.com/alx-home/msfs2024-vfrnav/blob/master/LICENSE" target="_blank">MSFS2024 VFRNav&apos;</a>.
            </li>
         </Section>
      </div>
   </div >;
}