'use server'

import axios from "@/api/axios"
import CountDown from "@/components/catalog/item/CountDown";
import { formatDate } from "@/utils/formattDate";
import Poster from "@/Images/Posters";
import { intervalToDuration } from "date-fns";
import Link from "next/link"

export default async function Announcements(){
    const scheduleItems = await axios.get('/catalog/items/time',{
        params:{
            take:6
        }
    });
    const announcements = await axios.get('/catalog/items/announcement');
    const remasteredScheduleItems = scheduleItems.data.filter((item:any)=>new Date(item.NextEpisodeTime).getTime() - new Date().getTime() > 0);
    const timeLeft = remasteredScheduleItems.map((item:any)=>intervalToDuration({start:0,end:new Date(item.NextEpisodeTime).getTime() - new Date().getTime()}));
    return(
        <div className="flex w-full custom-1024-max:flex-col  justify-between">
            <div className="flex flex-col w-[49%] max-h-[21rem] custom-1024-max:w-full">
                <Link href={'/catalog/schedule'} className="flex max-h-[2.5rem] flex-col group w-full items-center group-hover:pb-0 p-2 uppercase justify-center rounded-t-custom-sm bg-gray-1B text-white text-[0.95rem] font-normal">
                    <p>Schedule</p>
                    <span className="group-hover:w-[5.4rem] w-0 h-[1px] rounded-sm bg-white opacity-0 origin-left transition-all duration-[400ms] ease-out group-hover:opacity-100"></span>
                </Link>
                {remasteredScheduleItems.map((item:any,index:number)=>(
                    <Link key={index} href={`/catalog/item/${item.SeriesName}`} className={`flex text-white w-full border-b-[1px] border-b-gray-400 h-[2.8rem] items-center ${remasteredScheduleItems.length === index+1 && 'rounded-b-custom-sm'} hover:shadow-[inset_4px_0px_0px] hover:shadow-green-400 transition-shadow duration-500 ease-in-out`} style={{backgroundColor:index % 2 === 1 ? '#2E2E2E' : '#3C3C3C'}}>
                        <p className="break-words flex flex-shrink-0 max-w-[3.75rem] custom-s-200:hidden text-center text-[0.9rem]">{formatDate(item.NextEpisodeTime)}</p>
                        <Poster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} conteainerClass="w-[2rem] flex-shrink-0 custom-md-2:hidden h-full p-[2px] rounded-[3px]"  alt="poster"/>
                        <div className="flex relative max-w-full w-full h-full items-center">
                            <p className="text-[0.9rem] absolute left-0 overflow-hidden whitespace-nowrap truncated-text w-full font-medium ml-1">{item.SeriesViewName}</p>
                        </div>
                        <CountDown remainingTime={item.NextEpisodeTime} classProps="whitespace-nowrap text-[0.9rem] mr-1 text-gray-700" initializeTimeLeft={timeLeft[index]}/>
                    </Link>
                ))}
                {remasteredScheduleItems.length === 0 && (
                    <div className="flex w-full h-full bg-gray-2E items-center justify-center rounded-b-custom-sm">
                        <p className="text-white text-medium text-[1.15rem]">There are no items to show :(</p>
                    </div>
                )}
            </div>
            <div className="flex flex-col w-[49%] max-h-[21rem] custom-1024-max:mt-2 custom-1024-max:w-full">
                <Link href={`/catalog/?page=1&status=announcement`} className="flex group flex-col w-full max-h-[2.55rem] items-center justify-center uppercase p-2 bg-gray-1B rounded-t-custom-sm text-white text-[0.95rem] font-normal">
                    <p>Announcements</p>
                    <span className="group-hover:w-[9.25rem] w-0 h-[1px] rounded-sm bg-white opacity-0 origin-left transition-all duration-[400ms] ease-out group-hover:opacity-100"></span>
                </Link>
                {announcements.data.length > 0 ? announcements.data.map((item:any,index:number)=>(
                    <Link key={index} href={`/catalog/item/${item.SeriesName}`} className={`flex text-white border-b-[1px] border-b-gray-400 w-full h-[2.8rem] items-center hover:shadow-[inset_4px_0px_0px] hover:shadow-green-400 transition-shadow duration-500 ease-in-out ${announcements.data.length === index+1 && 'rounded-b-custom-sm'}`} style={{backgroundColor:index % 2 === 1 ? '#2E2E2E' : '#3C3C3C'}}>
                        <p className="break-words h-full flex-shrink-0 max-w-[3.75rem] border-r-[1px] border-r-gray-400 custom-s-200:hidden text-center text-[0.9rem]">{formatDate(item.createdAt)}</p>
                        <div className="flex relative max-w-full w-full h-full items-center">
                            <p className="text-[0.9rem] absolute left-0 overflow-hidden whitespace-nowrap truncated-text w-full font-medium ml-1">{item.SeriesViewName}</p>
                        </div>
                    </Link>
                )):(
                    <div className="flex w-full h-full bg-gray-2E items-center justify-center rounded-b-custom-sm">
                        <p className="text-white text-medium text-[1.15rem]">There are no items to show :(</p>
                    </div>
                )}
            </div>
        </div>
    )
}