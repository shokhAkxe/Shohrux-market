import { useEffect } from 'react';

export const useScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      // Skrollni qulflash
      document.body.style.overflow = 'hidden';
      
      // Brauzer o'ng tomonidagi skroll chizig'i (scrollbar) yo'qolganda 
      // sahifa chapga sakrab ketmasligi uchun padding qo'shamiz
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // Skrollni asl holiga qaytarish
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Komponent ekrandan yo'qolganda (unmount) skroll mantiqan ochilib ketishi shart
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isLocked]);
};