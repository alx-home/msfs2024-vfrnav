import { PropsWithChildren, Children, useState, useRef, isValidElement, useMemo } from 'react';

import { AnimatedOrder } from './AnimatedOrder';

class Box {
   constructor(public min: number, public max: number) {
   }

   public Collapse(pos: number) {
      return pos <= this.max && pos > this.min;
   }
}

export const Draggable = ({ children, vertical, onOrdersChange, className, active }: PropsWithChildren<{
   vertical: boolean,
   className?: string,
   onOrdersChange?: (orders: number[]) => void,
   active?: boolean
}>) => {
   const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
   const ref = useRef<HTMLDivElement | null>(null);
   const [boundings, setBoundings] = useState<Box[]>();
   const dragRef = useRef<HTMLDivElement | null>();

   const childs = useMemo(() => Children.toArray(children).filter(child => isValidElement(child)), [children]);
   const orders = useMemo<number[]>(() => childs.map(child => child.props.order) ?? [], [childs]);

   const getOrder = (index: number, orders_: number[] | undefined = orders) => orders_?.[index] ?? index;
   const getIndex = (order: number, orders_: number[] | undefined = orders) => orders_?.findIndex((value) => value === order) ?? order;
   const getRef = (order: number) => itemsRef.current[getIndex(order)];

   const updateBoundings = () => {
      if (!itemsRef.current) {
         return undefined;
      }

      const boundings: Box[] = [];
      for (let order = 0; order < itemsRef.current.length; ++order) {
         const elem = getRef(order);

         if (vertical) {
            boundings[order] = new Box(elem!.offsetTop + window.scrollY, elem!.offsetTop + elem!.offsetHeight + window.scrollY);
         } else {
            boundings[order] = new Box(elem!.offsetLeft + window.scrollX, elem!.offsetLeft + elem!.offsetWidth + window.scrollX);
         }
      }

      setBoundings(boundings);
      return boundings;
   };

   const onDragStart = (mousePos: number) => {
      const boundings = updateBoundings();

      if (boundings) {
         for (let order = 0; order < boundings.length; ++order) {
            const bounding = boundings[order];

            if (vertical) {
               console.log(ref.current?.scrollTop)
               if (bounding.Collapse(mousePos + (vertical ? window.scrollY + (ref.current?.scrollTop ?? 0) : window.scrollX + (ref.current?.scrollLeft ?? 0)))) {
                  dragRef.current = getRef(order);
                  dragRef.current?.focus()
                  break;
               }
            }
         }
      }
   };

   const onDragEnd = () => {
      dragRef.current?.blur()
      dragRef.current = undefined;
      setBoundings(undefined);
   };

   const onDrag = (mousePos: number) => {
      if (dragRef.current && boundings) {
         const newOrder = boundings.findIndex((box) => box.Collapse(mousePos + (vertical ? window.scrollY + (ref.current?.scrollTop ?? 0) : window.scrollX + (ref.current?.scrollLeft ?? 0))));

         if (newOrder < 0) {
            return;
         }

         if (getRef(newOrder) !== dragRef.current) {
            const index = itemsRef.current.findIndex((ref) => ref === dragRef.current);
            const newOrders = orders ? [...orders] : [...itemsRef.current.keys()];
            const oldOrder = getOrder(index, orders);

            if (newOrder > oldOrder) {
               for (let order = oldOrder + 1; order <= newOrder; ++order) {
                  --newOrders[getIndex(order, orders)];
               }
            } else {
               for (let order = newOrder; order < oldOrder; ++order) {
                  ++newOrders[getIndex(order, orders)];
               }
            }

            newOrders[index] = newOrder;

            onOrdersChange?.(newOrders);
         }
      }
   };

   return <div ref={ref} className={className ?? 'flex flex-col'}
      onDragOver={e => {
         e.preventDefault();
         onDrag(vertical ? e.pageY : e.pageX);
      }}>
      <AnimatedOrder orders={orders} itemsRef={itemsRef} vertical={vertical}>
         {
            childs.map((child, index) => {
               return <div role="menuitem"
                  draggable={active ?? true}
                  key={child.key}
                  tabIndex={-1}
                  ref={el => { itemsRef.current[index] = el; }}
                  onDragStart={e => onDragStart(vertical ? e.pageY : e.pageX)}
                  onDragEnd={onDragEnd}
                  {...((itemsRef.current[index] === dragRef.current) ? { style: { opacity: 0 } } : {})}
               >
                  {child}
               </div>;
            })
         }
      </AnimatedOrder>
   </div>;
};