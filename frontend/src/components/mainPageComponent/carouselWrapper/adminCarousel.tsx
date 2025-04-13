"use client"

import usePageCounter from "@/components/useZustand/zustandPageCounter";
import InfiniteScroll from "@/utils/infiniteScroll";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { debounce } from "lodash";
import { Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";

const AdminCarousel = ({carouselItemsData}:{carouselItemsData:{
    SeriesName:string,
    SeriesViewName:string
}[] | null})=>{
    const [isFocus,setIsFocus] = useState(false);
    const [text,setText] = useState('');
    const [carouselItems,setCarouselItems] = useState(carouselItemsData);
    const componentRef = useRef<HTMLDivElement>(null);
    const {getSearchAdminPage} = usePageCounter();
    const [getIsShow,updateIsShow] = useState(false);
    const [result,setResult] = useState<any[]>([]);
    const handleOnFocus = ()=>{
        setIsFocus(true);
        updateIsShow(true);
    }
    const handleOnBlur = ()=>{
        if(text === ''){
            setIsFocus(false);
        }
    }
    useEffect(()=>{
        if(!getIsShow){
            setResult([]);
        }
    },[isFocus]);
    useEffect(()=>{
        if (!text.trim()) {
            setResult([]); 
            return;
        }
        const fetchedData = async()=>{
            try{
                const req = await axios.get('/catalog/search',{
                    params:{
                        param:text,
                        skip:getSearchAdminPage()
                    }
                });
                setResult(req.data);
            }catch(err){
                console.error(`Error!${err}`);
            }
        }
        const debouncedFunc = debounce(fetchedData,400);
        debouncedFunc();
        
        return () => debouncedFunc.cancel();
    },[text]);
    const addNewCarouselItem = (seriesName:string,seriesViewName:string)=>{
        if(carouselItems?.find((item)=>item.SeriesName === seriesName)){
            return toast.info('You have alredy selected this one ')
        }
        setCarouselItems((prev)=>{
            const item = {SeriesName:seriesName,SeriesViewName:seriesViewName};
            const newCarouselItems = (prev ? [...prev,item] : [item]);
            return newCarouselItems;
        })
    }
    const removeCarouselItem = (seriesName:string)=>{
        setCarouselItems((prev)=>{
            const newCarouselItems = prev && prev?.filter((item:any)=>item.SeriesName !== seriesName);
            return newCarouselItems;
        })
    }
    const confirmCarouselItemsChange = ()=>{
        if(!carouselItems) return;
        if(carouselItems.length % 7 === 0){
            axios.put('/catalog/carousel/items',{
                carousel:carouselItems
            })
            toast.success('Successfully');
        }else{
            toast.info(`Make sure there are amount of element that divides by 7 without a remainder,now you have ${carouselItems.length}`)
        }
    }
    return(
        <div className="flex flex-col w-full min-h-full">
            <div className="flex w-full flex-wrap bg-gray-2E gap-x-4 p-2 pl-7 rounded-md">
                {carouselItems?.map((item:any,index:number)=>(
                    <button onClick={()=>removeCarouselItem(item.SeriesName)} key={index} className='flex relative flex-col w-[10rem] transition-transform hover:scale-105 duration-500 ease-in-out overflow-hidden'>
                        <img src={`${process.env.NEXT_PUBLIC_API}/media/${item?.SeriesName}/images`} className='w-full h-[15rem] rounded-md' alt="" />
                        <div className='flex text-ellipsis overflow-hidden text-center'>
                            <p className='text-white font-medium line-clamp-2'>{item.SeriesViewName}</p>
                            {/* <span className='flex items-center justify-center absolute top-3 after:content-[""] after:absolute after:right-[-0.97rem] after:border-[#F5C543] after:border-t-[0.75rem] after:border-b-[0.75rem] after:border-r-[1rem] after:border-r-transparent text-[1rem] text-white font-medium bg-orange-yellow h-[1.5rem]'>
                                <img src={`${process.env.NEXT_PUBLIC_API}/media/star.white.svg/icons`} className="w-[1rem] h-[1rem] ml-1" alt="" />
                                <p className='pl-1 pr-2'>{(itemRate ? itemRate._avg.Value : 0).toFixed(2)}</p>
                            </span> */}
                        </div>
                    </button>
                ))}
            </div>
            <div className="flex w-full h-[1.75rem] gap-x-2 mt-2 justify-end font-medium text-[0.9rem]">
                <button onClick={()=>setCarouselItems(carouselItemsData)} className="flex w-[6rem] h-full bg-red-button justify-center items-center rounded-md">
                    cancel
                </button>
                <button onClick={confirmCarouselItemsChange} className="flex w-[4.5rem] h-full bg-green-400 justify-center items-center rounded-md">
                    confirm
                </button>
            </div>
            <div className="flex w-full h-[1.75rem] mt-2">
                <div className="flex items-center w-[40%] h-full bg-gray-300 rounded-md">
                    <textarea onFocus={handleOnFocus} onBlur={handleOnBlur} onClick={()=>updateIsShow(true)} value={text} onChange={(e) => {setText(e.target.value)}} className='pt-1 pb-[6px] bg-transparent overflow-y-hidden overflow-x-scroll scrollbar-hide whitespace-nowrap flex-nowrap outline-none pr-[0.3125rem] pl-10 max-w-full w-full h-[2rem] bg-[#D1D1D1] rounded-[20px]' placeholder={`${isFocus && text === ''? '':'Search...'}`} ></textarea>
                    <div className='flex justify-end items-center relative mr-4'>
                        <svg viewBox='0 0 20 20' width={16} height={16} fill='white'>
                            <path d="M19.5 18.616 14.985 14.1a8.528 8.528 0 1 0-.884.884l4.515 4.515.884-.884ZM1.301 8.553a7.253 7.253 0 1 1 7.252 7.253 7.261 7.261 0 0 1-7.252-7.253Z"></path>
                        </svg>
                    </div>
                </div>
            </div>
            <div className="flex w-full mt-2" ref={componentRef}>
                <InfiniteScroll type="series" componentRef={componentRef} fetchedData={result} styles="flex" isWindow={true}>
                    <div className="flex w-full flex-wrap gap-x-4">
                        {result.map((item:any,index:number)=>(
                            <button onClick={()=>addNewCarouselItem(item.SeriesName,item.SeriesViewName)} key={index} className={`flex relative flex-col w-[10rem] transition-transform hover:scale-105 duration-500 ease-in-out overflow-hidden`}>
                                <div className="relative w-full h-[15rem] rounded-md overflow-hidden">
                                <img
                                    src={`${process.env.NEXT_PUBLIC_API}/media/${item?.SeriesName}/images`}
                                    className="w-full h-full object-cover"
                                    alt=""
                                />
                                {carouselItems?.find(
                                    (carouselItem) => carouselItem.SeriesName === item.SeriesName
                                ) && (
                                    <div className="flex items-center justify-center absolute inset-0 bg-[#3fe8ad] bg-opacity-35 z-20">
                                        <img src={`${process.env.NEXT_PUBLIC_API}/media/badge-check.svg/icons`} className="w-[2.5rem] h-[2.5rem] z-20 text-[1.25rem]"/>
                                    </div>
                                )}
                                </div>
                                <div className='flex text-ellipsis overflow-hidden text-center'>
                                    <p className='text-white font-medium line-clamp-2'>{item.SeriesViewName}</p>
                                    {/* <span className='flex items-center justify-center absolute top-3 after:content-[""] after:absolute after:right-[-0.97rem] after:border-[#F5C543] after:border-t-[0.75rem] after:border-b-[0.75rem] after:border-r-[1rem] after:border-r-transparent text-[1rem] text-white font-medium bg-orange-yellow h-[1.5rem]'>
                                        <img src={`${process.env.NEXT_PUBLIC_API}/media/star.white.svg/icons`} className="w-[1rem] h-[1rem] ml-1" alt="" />
                                        <p className='pl-1 pr-2'>{(itemRate ? itemRate._avg.Value : 0).toFixed(2)}</p>
                                    </span> */}
                                </div>
                            </button>
                        ))}
                    </div>
                </InfiniteScroll>
            </div>
        </div>
    )
}
export default AdminCarousel;