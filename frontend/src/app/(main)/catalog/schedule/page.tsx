'use server'

import axios from "@/api/axios";
import { getItemsRate, schedule } from "@/components/catalog/item/item.logic";
import ScheduleComponent from "@/components/catalog/schedule/ScheduleCatalog";
import { cookies } from "next/headers";

export default async function ScheduleCatalog(){
    const scheduleData = await axios.get('/catalog/schedule/date');
    
    const remasteredSchedule = scheduleData.data.map((item:any)=>({...item,day:new Date(item.NextEpisodeTime).getDay(),opened:new Date().getDay() === new Date(item.NextEpisodeTime).getDay()}));
    const itemsRate = await getItemsRate(scheduleData.data.map((item:any)=>item.SeriesName),cookies().get('accessToken')?.value);
    const userListItems = cookies().get("accessToken")?.value && await axios.get('/user/userList/schedule',{
        params:{
            seriesNames:remasteredSchedule.map((item:any)=>item.SeriesName)
        },
        headers:{
            'Authorization':`Bearer ${cookies().get("accessToken")?.value}`
        }
    });
    const existingDays = new Set(remasteredSchedule.map((item: any) => item.day));

    // Find missing days
    const missingDays = schedule
        .map((day) => day.value)
        .filter((day) => !existingDays.has(day))
        .map((day) => ({ day, opened: false }));

    // Merge with remasteredData
    const finalRemasteredData = [...remasteredSchedule, ...missingDays];
    return(
        <div className="flex w-full min-h-screen bg-gray-200 justify-center">
            <div className="flex flex-col mt-[3rem] w-[80%]">
                <div className="flex w-full p-2 rounded-t-custom-sm items-center border-b-green-400 border-b-[3px] justify-center bg-gray-1B text-white text-[1rem] uppercase font-normal">
                    <p>Schedule of new Episodes</p>
                </div>
                <ScheduleComponent todayData={finalRemasteredData} itemsRate={itemsRate} userListItems={userListItems && userListItems.data}/>
            </div>
        </div>
    )
}