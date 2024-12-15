import { Page } from "@/app/App";
import { useRef } from "react";

export const Menu = ({ setPage, pages, activePage }: { pages: Page[], setPage: (page: string) => void, activePage: string }) => {
   const refs = useRef<(HTMLButtonElement | null)[]>([]);

   return <div className={'px-3 w-[60px] bg-menu flex h-full flex-col gap-y-3 overflow-hidden py-3 max-sm:pt-0'}>
      {pages.map((page, index) =>
         <button key={page.name}
            className={'border-x-2 border-r-transparent transition-colors group flex h-12 min-w-16  items-center gap-x-3.5 p-1 pl-[12px] text-left text-xl bg-item border-l-2 border-l-msfs hocus:bg-white hocus:text-gray-600 [&>*]:hocus:invert-0 hocus:border-white ' + (page.name === activePage ? ' bg-active-item border-r-white' : '')}
            onClick={e => setPage(page.name)}
            ref={e => { refs.current[index] = e }}
            onMouseUp={e => refs.current[index]?.blur()}>
            {{
               ...page.icon, props: {
                  ...page.icon.props,
                  className: ('w-6 shrink-0 block ' + (page.name === activePage ? '' : 'invert ') + (page.icon.props.className ?? ''))
               }
            }}
         </button>
      )}
   </div>;
}