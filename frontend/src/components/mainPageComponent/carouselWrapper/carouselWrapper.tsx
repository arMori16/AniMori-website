'use client'

import "@/components/mainPageComponent/carouselWrapper/carousel.css"
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react'
import ClientPoster from '@/Images/ClientPoster';
import React from "react";
import Image from 'next/image';

export type SeasonedSeries = { 
  SeriesName: string; 
  SeriesViewName: string; 
}
type SeasonedSeriesWithPosition = SeasonedSeries & {
  position: number;
};
/* import { useEffect, useState } from 'react'; */
const CarouselWrapper = ({seasonedAnime,seasonedSeriesRate}:{ seasonedAnime: SeasonedSeries[] | null,seasonedSeriesRate:any[] })=>{
  const [seriesInfo, setSeriesInfo] = useState<SeasonedSeries[] | null>(seasonedAnime);
  const [isFocused,setIsFocused] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<SeasonedSeriesWithPosition | null>(null);
  const rateMap = React.useMemo(
    () =>
      new Map<string, number>(
        seasonedSeriesRate.map(({ SeriesName, avgValue }) => [SeriesName, Number(avgValue)])
      ),
    [seasonedSeriesRate]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: false, 
    duration: 45,
  });
  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      const currentIndex = emblaApi.selectedScrollSnap(); // Текущий индекс
      const viewportWidth = emblaApi.rootNode().getBoundingClientRect().width;
      const slidesToScroll = (viewportWidth / 184) % 1 >= 0.94 ? Math.ceil(viewportWidth / 184):Math.floor(viewportWidth / 184)
      const newIndex = currentIndex - slidesToScroll; // Новый индекс (не меньше 0)
  
      emblaApi.scrollTo(newIndex); // Скроллим к новому индексу
    }
  }, [emblaApi])
  
  const scrollNext = useCallback(() => {
    if (emblaApi) {
      const currentIndex = emblaApi.selectedScrollSnap();
      const viewportWidth = emblaApi.rootNode().getBoundingClientRect().width; // Ширина видимой области
      const emblaSlide = document.querySelectorAll(`.embla__slide`);
      const slidesToScroll = (viewportWidth / 184) % 1 >= 0.94 ? Math.ceil(viewportWidth / 184):Math.floor(viewportWidth / 184) 
      
      const newIndex = currentIndex + slidesToScroll;
      emblaApi.scrollTo(newIndex); // Скроллим к новому индексу
    }
  }, [emblaApi]);
  const scrollNextRef = useRef(scrollNext);

  useEffect(() => {
    scrollNextRef.current = scrollNext; // Update ref when scrollNext changes
  }, [scrollNext]);

  useEffect(() => {
    if(!isFocused){
      const interval = setInterval(() => {
        scrollNextRef.current(); // Always use the latest scrollNext
      }, 8000);

      return () => clearInterval(interval); // Cleanup interval on unmount
    }
  }, [isFocused]);

  const handleMouseEnter = () => setIsFocused(true); 
  const handleMouseLeave = () => setIsFocused(false); 

  return(
      <div className='flex flex-col h-full w-full relative mt-[3rem] custom-md-lg:mt-5 max-w-full embla'>
        <div className='flex rounded-t-lg justify-center border-b-2 border-green-400 text-[0.95rem] items-center max-w-full h-[2.25rem] bg-gray-1B text-rose-50 uppercase font-normal'>
            spring season anime
        </div>
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`flex group carousel-wrapper w-full relative p-4 bg-gray-1B`} /* style={{ transform: `translateX(${-currentIndex}px)` }} */>
           <div className='embla__buttons'>
             <button onClick={scrollPrev} className='flex pr-1 embla__button embla__button--prev left items-center justify-center absolute rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out left-0 top-[45%] bg-gray-2E z-10 w-[1.25rem] h-[2.25rem]'>
               <ChevronLeft color='white' className='w-[0.9rem] h-[1rem]'/>
             </button>
             <button onClick={scrollNext} className='flex embla__button embla__button--next pl-1 right items-center justify-center absolute rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out right-0 top-[45%] bg-gray-2E z-10 w-[1.25rem] h-[2.25rem]'>
               <ChevronRight color='white' className='w-[0.9rem] h-[1rem]'/>
             </button>
           </div>
            <div className='w-full h-[16.25rem] overflow-hidden' ref={emblaRef}>
              <div className='flex gap-x-[10.5px]'>
                {seriesInfo?.map((item:any,index:number)=>{
                const rate = rateMap.get(item.SeriesName) || 0;
                return(
                  <div key={index} className='flex embla__slide carousel-cell h-[16.25rem] relative flex-none rounded-custom-sm flex-col w-[11.5rem]'>
                    <Link href={`catalog/item/${item.SeriesName}`} className='flex relative flex-none flex-col overflow-hidden rounded-custom-sm w-full h-full z-0'>
                      <ClientPoster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt='poster' containerClass='w-[11.5rem] object-cover h-full z-0' />
                      <div className="flex items-center rounded-custom-sm justify-center absolute top-[0.5rem] left-[0.5rem] px-2" style={{backgroundColor: rate >= 7 ? '#5DC090' : rate >= 4 && rate < 7 ? '#F7CA4C':'#FD384C'}}>
                        <Image src={`/icons/star.white.svg`} alt='star' width={13} height={13}/>
                        <p className="text-white font-medium text-[1rem] ml-1">{rate.toFixed(2)}</p>
                      </div>
                      <div className="flex absolute peer right-[0.5rem] items-center justify-center top-[0.5rem] px-2 py-1 bg-gray-1B bg-opacity-80 rounded-custom-sm">
                        <i className="fa fa-info text-[0.85rem] text-white"></i>
                      </div>
                      <div className='block absolute text-white left-0 h-[3.15rem] bottom-0 bg-overlay-black text-center py-[5px] px-1 w-full overflow-hidden text-ellipsis'>
                        <span className="line-clamp-2">
                            {item.SeriesViewName}
                        </span>
                      </div>
                    <div className="flex flex-col p-3 scale-y-0 bg-gray-1B bg-opacity-90 z-10 absolute inset-0 transition-transform peer-hover:scale-y-100 duration-300 origin-bottom ease-in-out">
                      <p className="text-white font-medium text-[1rem]">{item.SeriesViewName}</p>
                    </div>
                    </Link>
                  </div>
                )})}
              </div>
            </div>
        </div>
      </div>
  )
}


export default CarouselWrapper;