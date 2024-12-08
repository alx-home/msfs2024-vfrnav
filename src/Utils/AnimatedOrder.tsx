import { Children, isValidElement, MutableRefObject, PropsWithChildren, useEffect, useRef, useState } from "react";

export const AnimatedOrder = ({ children, orders, itemsRef, vertical }: PropsWithChildren<{ orders: number[], itemsRef: MutableRefObject<(HTMLDivElement | null)[]>, vertical: boolean }>) => {
   const [currentOrders, setCurrentOrders] = useState<number[]>();
   const [transforms, setTransforms] = useState<string[]>();

   const getIndex = (order: number, orders_: number[] = orders) => orders_.findIndex(value => value == order);

   useEffect(() => {
      setTimeout(() => {
         setTransforms(undefined);
      }, 1);
   }, [transforms]);

   useEffect(() => {
      setCurrentOrders((_oldOrders) => {
         const oldOrders = _oldOrders ?? orders;

         const getOffsets = () => {
            const sizes = itemsRef.current.map((value) => (vertical ? value?.offsetHeight : value?.offsetWidth) ?? 0);

            let newOffset = 0;
            let oldOffset = 0;

            const newOffsets: number[] = [];
            const oldOffsets: number[] = [];

            console.assert(itemsRef.current.length == orders.length);

            for (let order = 0; order < itemsRef.current.length; ++order) {
               const oldIndex = getIndex(order, oldOrders);
               const newIndex = getIndex(order, orders);

               newOffsets[newIndex] = newOffset;
               oldOffsets[oldIndex] = oldOffset;

               newOffset += sizes[newIndex];
               oldOffset += sizes[oldIndex];
            }

            return { new: newOffsets, old: oldOffsets };
         };

         const offsets = getOffsets();

         const newTransforms: string[] = [];


         for (let index = 0; index < itemsRef.current.length; ++index) {
            const element = itemsRef.current[index];
            if (element) {
               const oldOffset = offsets.old[index];
               const newOffset = offsets.new[index];
               newTransforms[index] = `translate3d(${vertical ? 0 : oldOffset - newOffset}px,${vertical ? oldOffset - newOffset : 0}px,0px)`;
            }
         }

         setTransforms(newTransforms);
         return orders;
      })
   }, [orders]);

   return <>{Children.map(children, (child, index) => {
      if (!isValidElement(child)) {
         console.assert(false);
         return child;
      }

      const order = (currentOrders ?? [...orders.keys()])[index] + 1;

      const style = {
         ...child.props.style,
         ...(transforms?.[index] ?
            { transform: transforms[index] } :
            { transform: "translate3d(0px,0px,0px)", transition: "transform 200ms" })
      };

      return {
         ...child, props: {
            ...child.props,
            style: { ...style },
            order: order
         }
      };
   })?.sort((left, right) => isValidElement(left) && isValidElement(right) ? (left.props as any).order - (right.props as any).order : 0)}</>
};