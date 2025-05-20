'use client'

import axios from "@/api/axios";
import { formatDate } from "@/utils/formattDate";
import ClientPoster from "@/Images/ClientPoster";
import Link from "next/link";
import { useEffect, useState } from "react";
import Rating from "../item/rating";
import CountDown from "../item/CountDown";
import { intervalToDuration } from "date-fns";
import { list, schedule } from "../item/item.logic";


export default function ScheduleComponent({todayData,itemsRate,userListItems}:{todayData:any[],itemsRate:any[],userListItems:string[] | null}){
    const [daysData,setDaysData] = useState<any[]>(todayData);
    const today = new Date().getDay();
    const handleOpenClose = (value:number)=>{
        setDaysData((prev)=>{
            return prev.map((item:any)=>{
                if(item.day === value){
                    return {...item,opened:!item.opened}
                }
                else{
                    return item;
                }
            });
        })
    }
    const remasteredData = daysData.map((item: any) => {
        const rate = itemsRate.find((rateItem:any)=>rateItem.SeriesName === item.SeriesName);
        const episodeDate = new Date(item.NextEpisodeTime);
        const today = new Date();
        const returnData = rate ? { ...item, Rate: rate.avgValue, UserRate: rate.userValue } : item;
        if (episodeDate < today) {
            // Calculate next occurrence of the same weekday
            let nextDate = new Date(episodeDate);
            nextDate.setDate(episodeDate.getDate() + 7); // Move episodeDate, not today
            while(nextDate <= today){
                nextDate.setDate(nextDate.getDate() + 7);
            }
            return { ...returnData, NextEpisodeTime: nextDate.getTime() }; // Store as timestamp
        }
        return returnData;
    });
    return (
        <div className="flex w-full flex-col p-2 bg-gray-300">
            {schedule.map((day:any,index:number)=>(
                <div key={index} className={`flex flex-col w-full mb-3 bg-gray-100 border-l-2 border-green-400 ${daysData.find((item:any)=>item.day === day.value && item.opened) && 'pb-2'}`}>
                    <button onClick={()=>handleOpenClose(day.value)} className={`flex flex-col w-full h-[2.5rem] justify-center pl-2 text-white text-[1rem] font-medium ${daysData.find((item:any)=>item.opened && day.value === item.day) ? 'rounded-tr-custom-sm' : 'rounded-r-custom-sm'}`}> 
                        <div className={`flex items-center ${daysData.find((item:any)=>item.opened && day.value === item.day) && 'border-b-[1px] border-b-gray-500'}`}>
                            <p>{day.day}</p>
                            {index + 1 === today && <p className="ml-1">«Today»</p>}
                        </div>
                    </button>
                    <div className={`grid transition-all duration-500 ease-in-out 
                        ${remasteredData.find((item: any) => item.opened && day.value === item.day)
                        ? "grid-rows-[1fr]"
                        : "grid-rows-[0fr]"
                        }`}>
                        <div className="flex flex-col w-full overflow-hidden">
                            {remasteredData.map((items:any) => !items.SeriesName && items.day === day.value && (
                                <div key={index} className={`w-full h-[5rem] bg-gray-100 items-center justify-center transition-all duration-500 ease-in-out flex flex-col ${items.opened ? "opacity-100" : "opcaity-0"}`}>
                                    <img src="/images/thinking3.png" className="w-[3rem] h-[3rem]" alt="" />
                                    <p className="text-[1.2rem] text-white">No items here :(</p>
                                </div>
                            ))}
                            {remasteredData.map((item:any,index:number)=> day.value === item.day && item.SeriesName && (
                                <div key={index} className={`flex w-full relative p-2 bg-gray-100 group transition-all duration-500 ease-in-out
                                    ${item.opened ? "opacity-100" : "opcaity-0"}`}>
                                    <Link onClick={(e:any) => {
                                        if (e.target.closest("button")) {
                                            e.preventDefault(); // ОТМЕНЯЕМ ПЕРЕХОД ТОЛЬКО ЕСЛИ КЛИК ПО КНОПКЕ
                                        }
                                        }} href={`/catalog/item/${item.SeriesName}`} key={index} className={`flex border-b-[1px] border-b-gray-300 text-white w-full py-2 px-[2px] div-animation`}>
                                        <ClientPoster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt="poster" containerClass="min-w-[4.5rem] group-hover:scale-[1.03] transition-transform duration-500 flex-shrink-0 h-[6.25rem]"/>
                                        <div className="flex flex-col w-full px-2">
                                            <p className="font-medium">{item.SeriesViewName}</p>
                                            <div className="flex items-center text-gray-500">
                                                <i className="fa fa-eye text-[0.7rem] mr-1"></i>
                                                <p className="text-[0.8rem]">{item._count.views}</p>
                                            </div>
                                            <div className="mt-auto z-20">
                                                {<Rating initialRate={Number(item.Rate) || 0} initialUserRate={item.UserRate} seriesName={item.SeriesName}/>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end pr-2">
                                            <p className="whitespace-nowrap">{formatDate(item.NextEpisodeTime)}</p>
                                            <div className="mt-2 whitespace-nowrap">
                                                <CountDown remainingTime={item.NextEpisodeTime} initializeTimeLeft={intervalToDuration({start:0,end:new Date(item.NextEpisodeTime).getDate() - new Date().getDate()})} classProps="text-gray-500"/>
                                            </div>
                                            {userListItems?.map((items:any,listIndex:number)=>items.SeriesName === item.SeriesName && (
                                                <div key={listIndex} className="flex mt-2 items-center">
                                                    <div className={` p-1 rounded-custom-sm`} style={{backgroundColor:`${list.find((listItem:any)=>listItem.key.split(" ").join("") === items.Status)?.color}`}}>
                                                        <i className={`fa-solid fa-${list.find((listItem:any)=>listItem.key.split(" ").join("") === items.Status)?.value} text-[0.9rem] mr-2`}></i>
                                                        {items.Status === 'OnHold' ? 'On Hold' : items.Status}
                                                    </div>
                                                </div>

                                            ))}
                                        </div>
                                    </Link>
                                </div>
                            ))}

                        </div>

                    </div>
                </div>
            ))}
        </div>
    )
}