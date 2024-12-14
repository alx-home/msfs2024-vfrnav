import { PropsWithChildren, Children, useState, useEffect, useRef, isValidElement } from 'react';

import { AnimatedOrder } from './AnimatedOrder';

import styles from './draggable.module.sass';

class Box {
   constructor(public min: number, public max: number) {
   }

   public Collapse(pos: number) {
      return pos <= this.max && pos > this.min;
   }
}

export const Draggable = ({ children, vertical, onOrdersChange, className }: PropsWithChildren<{ vertical: boolean, onOrdersChange: (orders: number[]) => void, className?: string }>) => {
   const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
   const [boundings, setBoundings] = useState<Box[]>();
   const dragRef = useRef<HTMLDivElement | null>();
   const [orders, setOrders] = useState<number[]>(Children.map(children, (child, index) => isValidElement(child) ? child.props.order : index) ?? []);

   const getOrder = (index: number, orders_: number[] | undefined = orders) => orders_?.[index] ?? index;
   const getIndex = (order: number, orders_: number[] | undefined = orders) => orders_?.findIndex((value) => value == order) ?? order;
   const getRef = (order: number) => itemsRef.current[getIndex(order)];

   useEffect(() => {
      if (orders) {
         onOrdersChange(orders);
      }
   }, [orders]);

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
               if (bounding.Collapse(mousePos - (vertical ? window.scrollY : window.scrollX))) {
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
   };

   const onDrag = (mousePos: number) => {
      if (dragRef.current && boundings) {
         let newOrder = boundings.findIndex((box) => box.Collapse(mousePos));

         if (newOrder < 0) {
            return;
         }

         if (getRef(newOrder) != dragRef.current) {
            setOrders((oldOrders) => {
               const index = itemsRef.current.findIndex((ref) => ref == dragRef.current);
               const newOrders = oldOrders ? [...oldOrders] : [...itemsRef.current.keys()];
               const oldOrder = getOrder(index, oldOrders);

               if (newOrder > oldOrder) {
                  for (let order = oldOrder + 1; order <= newOrder; ++order) {
                     --newOrders[getIndex(order, oldOrders)];
                  }
               } else {
                  for (let order = newOrder; order < oldOrder; ++order) {
                     ++newOrders[getIndex(order, oldOrders)];
                  }
               }

               newOrders[index] = newOrder;
               return newOrders;
            });
         }
      }
   };

   return <div className={className ?? styles.drag_container}>
      <AnimatedOrder orders={orders} itemsRef={itemsRef} vertical={vertical}>
         {
            Children.map(children, (child, index) => {
               return <div role="menuitem"
                  draggable
                  tabIndex={-1}
                  ref={el => { itemsRef.current[index] = el; }}
                  onDragStart={e => onDragStart(vertical ? e.pageY : e.pageX)}
                  onDragOver={e => onDrag(vertical ? e.pageY : e.pageX)}
                  onDragEnd={onDragEnd}
                  {...((itemsRef.current[index] == dragRef.current) ? { style: { opacity: 0 } } : {})}
               >
                  {child}
               </div>;
            })
         }
      </AnimatedOrder>
   </div>;
};