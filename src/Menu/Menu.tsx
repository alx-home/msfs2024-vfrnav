import { Page } from "@/app/page";
import { useRef } from "react";

import styles from './menu.module.sass';

export const Menu = ({ setPage, pages, activePage }: { pages: Page[], setPage: (page: string) => void, activePage: string }) => {
   const refs = useRef<(HTMLButtonElement | null)[]>([]);

   return <div className={styles.menu + ' flex h-full flex-col gap-y-3 overflow-hidden py-3 max-sm:pt-0'}>
      {pages.map((page, index) =>
         <button key={page.name}
            className={'rounded-sm border-x-2 border-r-transparent transition-colors hover:bg-white hover:text-gray-600 group flex h-12 min-w-16  items-center gap-x-3.5 p-1 pl-[12px] text-left text-xl bg-gray-700' + (page.name == activePage ? ' ' + styles.active : '')}
            onClick={e => setPage(page.name)}
            ref={e => { refs.current[index] = e }}
            onMouseUp={e => refs.current[index]?.blur()}>
            {{
               ...page.icon, props: {
                  ...page.icon.props,
                  className: (page.icon.props.className + ' w-6 shrink-0')
               }
            }}
         </button>
      )}
   </div>;
}