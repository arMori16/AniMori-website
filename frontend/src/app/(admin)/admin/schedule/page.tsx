'use server'

import ScheduleItems from "@/components/admin/schedule";
import axios from "@/api/axios";
import { formatToStandard } from "@/utils/formattDate";
import { intervalToDuration } from "date-fns";
import { cookies } from "next/headers";



const Schedule = async()=>{
    const ongoingSeries = await axios.get('/catalog/items/time',{
        headers:{
            'Authorization':`Bearer ${cookies().get('accessToken')?.value}`
        }
    });
    /* ongoingSeries.data = ongoingSeries.data.map((item:any)=>(item.NextEpisodeTime ? {...item,NextEpisodeTime:formatToStandard(item.NextEpisodeTime)}:{...item})); */
    const expiredTimeAnime = ongoingSeries.data.filter((item:any)=>item.NextEpisodeTime && ((new Date(item.NextEpisodeTime).getTime() - new Date().getTime()) < 0));
    const initialActiveAnime = ongoingSeries.data.filter((item:any)=>(item.NextEpisodeTime ? ((new Date(item.NextEpisodeTime).getTime() - new Date().getTime()) > 0) : {...item}));
    const filteredData = [...initialActiveAnime].sort((a: any, b: any) => {
        const timeA = a.NextEpisodeTime ? new Date(a.NextEpisodeTime).getTime() : Infinity;
        const timeB = b.NextEpisodeTime ? new Date(b.NextEpisodeTime).getTime() : Infinity;
        
        return timeA - timeB;
    });
    const lessThanOneDaySeries = filteredData.filter((item:any)=>item.NextEpisodeTime ? intervalToDuration({start:0, end: (new Date(item.NextEpisodeTime).getTime() - new Date().getTime()) }).days === undefined : item.NextEpisodeTime && {...item} )
    return (
        <div className="flex flex-col w-full h-full">
            <h1 className="text-white text-[1.25rem] font-medium">Schedule</h1>
            <ScheduleItems initialExpiredItems={expiredTimeAnime} initialOngoingSeries={ongoingSeries.data} initialActiveAnime={filteredData} lessThanOneDaySeriesInitial={lessThanOneDaySeries}/>
        </div>
    )
};

export default Schedule;