import { Page, Space } from "@/app/App";
import { useRef } from "react";

export const Menu = ({ setPage, pages, activePage }: { pages: (Page | Space)[], setPage: (page: string) => void, activePage: string }) => {
   const refs = useRef<(HTMLButtonElement | null)[]>([]);

   return <div className={'px-3 w-[60px] bg-menu flex h-full flex-col gap-y-3 overflow-hidden py-3'}>
      {pages.map((_page, index) => {
         if (_page.type === 'page') {
            const page = (_page as Page);
            return <button key={page.name}
               disabled={page.disabled}
               className={'border-x-2 border-r-transparent transition-colors group flex h-12 min-w-16  items-center gap-x-3.5 p-1 pl-[12px] text-left text-xl bg-item border-l-2 border-l-msfs'
                  + (page.disabled ? ' opacity-30' : (' hocus:bg-white hocus:text-gray-600 [&>*]:hocus:invert-0 hocus:border-white')
                     + (page.name === activePage ? ' bg-active-item border-r-white' : ''))}
               onClick={() => setPage(page.name)}
               ref={e => { refs.current[index] = e }}
               onMouseUp={() => refs.current[index]?.blur()}>
               {{
                  ...page.icon, props: {
                     ...page.icon.props,
                     className: ('w-6 shrink-0 block ' + (page.name === activePage ? '' : 'invert ') + (page.icon.props.className ?? ''))
                  }
               }}
            </button>;
         } else {
            return _page.elem;
         }
      }
      )}
   </div>;
}