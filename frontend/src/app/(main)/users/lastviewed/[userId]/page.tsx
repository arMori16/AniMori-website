'use client'
import axios from "@/api/axios";
import RowItemFormat from "@/components/differentItemFormats/rowItemFormat";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { formatToYYMMDD } from "@/utils/formattDate";
import InfiniteScroll from "@/utils/infiniteScroll";
import { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { Loader, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import * as z from "zod";

/* enum UserListStatus{
    OnHold = "OnHold",
    Completed = "Completed",
    Watching = "Watching",
    Dropped = "Dropped",
    Planned = "Planned",
} */
export type LastViewedItem = z.infer<typeof lastViewedSchema>;
export const lastViewedSchema = z.preprocess((input) => {
    if (typeof input !== "object" || input == null) return input;
    const raw = input as Record<string, any>;
    return {
        SeriesName:     raw.SeriesName,
        SeriesViewName: raw.SeriesViewName,
        Views:          raw.series._count.views,
        Rate:           raw.rating.avgrate,
        LastViewed:     raw.LastViewed,
        Episode:        raw.Episode,
        UserRate:       raw.rating.userrate,
        UserListStatus: raw.userList?.Status ?? null,
    };
    }, z.object({
    SeriesName:     z.string(),
    SeriesViewName: z.string(),
    Views:          z.number(),
    Rate:           z.number(),
    LastViewed:     z.preprocess((d) => typeof d === "string" ? new Date(d) : d, z.date()),
    Episode:        z.number(),
    UserRate:       z.number().nullable(),
    UserListStatus: z.string().nullable(),
    }));
export default function LastViewedHistory({params}:{params:{userId:number}}){
    const [unparsedNewLastViewed,setNewLastViewed] = useState<LastViewedItem[]>([]);
    const componentRef = useRef<HTMLDivElement>(null);
    const [unparsedLastViewed,unparsedSetLastViewed] = useState<LastViewedItem[]>([]);
    const {page,getPage} = usePageCounter();
    useEffect(()=>{
        const accessToken = Cookies.get('accessToken');
        const fetchData = async() =>{
            const lastViewedReq:AxiosResponse<any,null> | null = await axios.get('/user/lastViewed',{
                params:{
                    take:15,
                    skip:getPage(),
                    userId:params.userId
                },
                headers:{
                    'Authorization':`Bearer ${accessToken}`
                }
            }).catch((err)=>{
                console.error(err);
                return null;
            });   
            setNewLastViewed(lastViewedReq?.data);
            unparsedSetLastViewed((prev) => 
                {const newSeries = [...prev, ...lastViewedReq?.data];
                const uniqueSeries = Array.from(new Map(newSeries.map(item => [item.SeriesName, item])).values());
                return uniqueSeries;}
            );
        }
        fetchData();
    },[page])
    const lastViewed = z.array(lastViewedSchema).safeParse(unparsedLastViewed);
    if (!lastViewed.success) {
        console.error("Error parsing last viewed data: ",lastViewed);
    }
    return(
        <div className="flex w-full min-h-screen bg-gray-200 text-white justify-center">
            <div className="flex flex-col h-full w-[80%]" ref={componentRef}>
                <div className="flex w-full h-[2.75rem] rounded-t-custom-sm bg-gray-1B justify-center items-center pl-[0.5rem] mt-[5rem]">
                    <p className="text-[1rem] uppercase">Last viewed history</p>
                </div>
                <InfiniteScroll fetchedData={unparsedNewLastViewed} componentRef={componentRef} isWindow={true} type="series" styles="flex w-full flex-col bg-gray-300 h-full mb-5 px-1 py-1">
                    {lastViewed.success && lastViewed.data.map((item:LastViewedItem,index:number)=>(
                        <div key={index} className="flex flex-col w-full bg-gray-100">
                            {(item.LastViewed.getDay() !== lastViewed.data[index-1]?.LastViewed.getDay()) && (
                                <div className="flex w-full h-auto text-white font-semibold text-[1.25rem] px-2 pt-2">{formatToYYMMDD(item.LastViewed)}</div>
                            )}
                            <RowItemFormat item={item}/>
                        </div>
                    ))}
                </InfiniteScroll>
                {unparsedLastViewed.length === 0 && (
                    <div className="flex flex-col w-full h-[4rem] items-center justify-center bg-gray-200 text-white">
                        <img src="/images/leaf.png" className="block w-[1.75rem] h-[1.75rem] transform origin-center animate-cloverPulse"/>
                        <p className="text-[1.2rem] font-medium">Loading...</p>
                    </div>
                )}
            </div>
        </div>
    )
}