'use client'
import { useEffect, RefObject } from 'react';

type UseOutsideProps = {
  refs: RefObject<HTMLElement>[];
  onOutsideClick: () => void;
  eventType?: keyof DocumentEventMap; 
};

const useOutsideCommon = ({ refs, onOutsideClick, eventType = 'click' }: UseOutsideProps) => {
  useEffect(() => {
    const handleEvent = (e:Event) => {
      const clickedOutside = refs.every(ref => {
        return !ref.current || !ref.current.contains(e.target as Node);
      });
      if (clickedOutside) {
        onOutsideClick();
      }
    };

    document.addEventListener(eventType, handleEvent, true);
    return () => {
      document.removeEventListener(eventType, handleEvent, true);
    };
  }, [refs, onOutsideClick, eventType]);
};

export default useOutsideCommon;
