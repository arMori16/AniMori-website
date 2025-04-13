'use client'

import "@/components/mainPageComponent/carouselWrapper/carousel.css"
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react'
import ClientPoster from '@/Images/ClientPoster';



/* import { useEffect, useState } from 'react'; */
const CarouselWrapper = ({seasonedAnime}:{ seasonedAnime: { 
  SeriesName: string; 
  SeriesViewName: string; 
}[] | null })=>{
  const [seriesInfo, setSeriesInfo] = useState<{
    SeriesName: string;
    SeriesViewName: string;
  }[] | null>(seasonedAnime);
  const [isFocused,setIsFocused] = useState(false);
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
      <div className='block h-full w-full relative mt-[3rem] custom-md-lg:mt-5 max-w-[80.469rem] embla'>
        <div className='flex rounded-t-lg justify-center text-[0.95rem] items-center max-w-[80.469rem] h-[2.25rem] bg-gray-1B text-rose-50'>
            SEASON&apos;S ANIME
        </div>
        {seriesInfo && seriesInfo.length <= 1? (
           <div className='flex bg-gray-2E w-full items-center justify-center h-[16.25rem]'>
              <Loader className='w-[2rem] h-[2rem] transition-transform animate-rotate' color='white'/>
           </div>
        ) : (
          <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className={`flex group carousel-wrapper w-full relative`} /* style={{ transform: `translateX(${-currentIndex}px)` }} */>
           <div className='embla__buttons'>
             <button onClick={scrollPrev} className='flex pr-1 embla__button embla__button--prev left items-center justify-center absolute rounded-r-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out left-0 top-[45%] bg-gray-2E z-10 w-[1.25rem] h-[2.25rem]'>
               <ChevronLeft color='white' className='w-[0.9rem] h-[1rem]'/>
             </button>
             <button onClick={scrollNext} className='flex embla__button embla__button--next pl-1 right items-center justify-center absolute rounded-l-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out right-0 top-[45%] bg-gray-2E z-10 w-[1.25rem] h-[2.25rem]'>
               <ChevronRight color='white' className='w-[0.9rem] h-[1rem]'/>
             </button>
           </div>
               <div className='w-full h-[16.25rem] overflow-hidden' ref={emblaRef}>
                 <div className='flex'>
                   {seriesInfo?.map((item:any,index:number)=>(
                     <div key={index} className='flex embla__slide carousel-cell h-[16.25rem] relative flex-none overflow-hidden bg-red-950 flex-col w-[11.5rem]'>
                       <Link href={`catalog/item/${item.SeriesName}`} className='flex relative flex-none overflow-hidden bg-red-950 flex-col w-full h-full'>
                         <ClientPoster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt='poster' containerClass='w-[11.5rem] object-cover h-full' />
                         <div className='block absolute text-white left-0 h-[3.15rem] bottom-0 bg-[rgba(0,0,0,0.6)] text-center py-[5px] px-1 w-full overflow-hidden text-ellipsis'>
                           <span className="line-clamp-2">
                               {item.SeriesViewName}
                           </span>
                         </div>
                       </Link>
                     </div>
                   ))}
                 </div>
               </div>
           </div>
        )}
     
      </div>
  )
}


export default CarouselWrapper;