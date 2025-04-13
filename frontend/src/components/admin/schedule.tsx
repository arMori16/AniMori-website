'use client'

import InfiniteScroll from "@/utils/infiniteScroll";
import { useEffect, useRef, useState } from "react";
import usePageCounter from "../useZustand/zustandPageCounter";
import ClientPoster from "@/Images/ClientPoster";
import axios from "../../api/axios";
import { formatToStandard } from "@/utils/formattDate";
import Link from "next/link";
import dynamic from "next/dynamic";
const CountDown = dynamic(() => import("../catalog/item/CountDown"), { ssr: false });
import { intervalToDuration } from "date-fns";


const ScheduleItems = ({initialExpiredItems,initialOngoingSeries,initialActiveAnime,lessThanOneDaySeriesInitial}:{initialExpiredItems:any[],initialOngoingSeries:any[],initialActiveAnime:any[],lessThanOneDaySeriesInitial:any[]})=>{
    const [expiredItems,setExpiredItems] = useState<any[]>(initialExpiredItems);
    const [ongoingSeries,setOngoingSeries] = useState<any[]>(initialOngoingSeries);
    const [filteredData,setFilteredData] = useState<any[]>(initialActiveAnime);
    const [lessThanOneDaySeries,setLessThanOneDaySeries] = useState<any[]>(lessThanOneDaySeriesInitial);
    const [toggleTimeVisibility,setToggleTimeVisibility] = useState(false);
    const {page,getPage} = usePageCounter();
    const divRef = useRef<HTMLDivElement>(null);
    
    useEffect(()=>{
        const fetchData = async()=>{
            const {data} = await axios.get('/catalog/items/time',{
                params:{
                    skip:getPage()
                }
            });
            setFilteredData((prev)=>{
                const combined = [...prev, ...data];
                const uniqueItems = Array.from(
                    new Map(combined.map((item) => [item.SeriesName, item])).values()
                );
                const items = uniqueItems.filter((item:any)=>(item.NextEpisodeTime ? ((new Date(item.NextEpisodeTime).getTime() - new Date().getTime()) > 0) : {...item}));
                console.log(`ITEMS: `,items);
                
                return items;
            });
            setExpiredItems((prev)=>{
                const expiredTimeAnime = data.filter((item:any)=>(item.NextEpisodeTime && (new Date(item.NextEpisodeTime).getTime() - new Date().getTime()) < 0));
                const uniqueItems = Array.from(
                    new Map(expiredItems.map((item) => [item.SeriesName, item])).values()
                );
                return uniqueItems;
            });
            setOngoingSeries(data);
        }
        fetchData();
    },[page])
    console.log(`toggleTimeVisibility`,toggleTimeVisibility);
    
    return(
        <div className="flex flex-col w-full" ref={divRef}>
            {expiredItems.length >= 1 && (
                <h1 className="text-[#de3838] text-[1rem] font-medium mb-2">Time Expired Anime!</h1>
            )}
            <InfiniteScroll fetchedData={ongoingSeries} isWindow={true} type="series" componentRef={divRef} styles="flex w-full h-full">
                <div className={`flex flex-col w-full`}>
                    <div className="flex w-full flex-wrap gap-x-2">
                        {expiredItems.map((item:any,index:number)=>(
                            <Link key={index} href={`/admin/series/view/${item.SeriesName}`} className="flex flex-col w-[10rem] hover:scale-105 transition-transform ease-in-out duration-500">
                                <ClientPoster containerClass="w-full h-[15rem] rounded-sm" src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt="poster"/>
                                <span className="w-full text-ellipsis text-white text-center overflow-hidden font-medium">
                                    <p className="line-clamp-2">{item.SeriesViewName}</p>
                                </span>
                            </Link>
                        ))}
                    </div>
                    <div className="flex my-2 items-center">
                        <p className="text-green-400 text-[1.15rem] font-medium mr-5">Time & Anime</p>
                        <p className="text-white text-[1rem] mr-1">show time as hover</p>
                        <input type="checkbox" id='check' defaultChecked={true} onChange={(e:any)=>setToggleTimeVisibility(!e.target.checked)} className="hidden peer"/>
                        <label htmlFor="check" className="cursor-pointer w-[2.25rem] h-[1rem] bg-black rounded-2xl relative 
                        before:absolute before:left-0 before:w-[0.75rem] mt-[2px] before:h-[0.75rem] before:m-[2px] before:rounded-[50%] before:bg-white
                        peer-checked:bg-green-400 peer-checked:before:translate-x-[1.30rem] transition-colors before:transition-transform before:duration-700 duration-500 ease-in-out"></label>
                    </div>
                    <div className="flex w-full gap-x-2">
                        {filteredData.map((item:any,index:number)=>(
                            <Link href={`/admin/series/view/${item.SeriesName}`} key={index} className="flex group relative flex-col h-[18rem] max-h-[18rem] w-[10rem] hover:scale-105 transition-transform ease-in-out duration-500">
                                <ClientPoster containerClass={`w-full max-h-[15rem] h-[15rem] rounded-sm overflow-hidden`} src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt="poster">
                                    {(toggleTimeVisibility && item.NextEpisodeTime || (item.NextEpisodeTime && lessThanOneDaySeries.find((items)=>items.SeriesName === item.SeriesName))) && (
                                        <CountDown remainingTime={item.NextEpisodeTime} initializeTimeLeft={item.NextEpisodeTime && intervalToDuration({start:0,end:new Date(item.NextEpisodeTime).getTime() - new Date().getTime()})}
                                            classProps="flex absolute top-0 bottom-[16.6%] rounded-sm left-0 right-0 z-10 bg-gray-300 bg-opacity-80 items-center justify-center text-[0.9rem] whitespace-nowrap text-white font-medium"
                                        />
                                    )}
                                    {!toggleTimeVisibility && lessThanOneDaySeries.find((items)=>items.SeriesName === item.SeriesName) === undefined && (
                                        <CountDown remainingTime={item.NextEpisodeTime} initializeTimeLeft={item.NextEpisodeTime && intervalToDuration({start:0,end:new Date(item.NextEpisodeTime).getTime() - new Date().getTime()})}
                                                classProps={`opacity-0 group-hover:opacity-100 flex transition-all duration-500 ease-in-out absolute top-0 bottom-[16.6%] rounded-sm left-0 right-0 z-10 bg-gray-300 bg-opacity-80 items-center justify-center text-[0.9rem] whitespace-nowrap text-white font-medium`}
                                        />
                                    )}
                                </ClientPoster>
                                <span className="w-full text-ellipsis text-white text-center overflow-hidden font-medium">
                                    <p className="line-clamp-2">{item.SeriesViewName}</p>
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
                    
            </InfiniteScroll>
        </div>
    );
}
export default ScheduleItems;