import { Page } from "@/app/page";

import './style.css';

export const Menu = ({ setPage, pages }: { pages: Page[], setPage: (page: string) => void }) => {
   return <div className='menu'>
      {pages.map(page =>
         <button key={page.name} onClick={e => setPage(page.name)}>
            {page.icon}
         </button>
      )}
   </div>;
}