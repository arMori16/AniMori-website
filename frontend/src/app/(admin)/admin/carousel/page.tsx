"use server"

import axios from "@/api/axios";
import AdminCarousel from "@/components/mainPageComponent/carouselWrapper/adminCarousel";
import { cookies } from "next/headers";

const Carousel = async()=>{
    const carouselItems = await axios.get("/catalog/carousel/items",{
        headers:{
            'Authorization':`Bearer ${cookies().get("accessToken")?.value}`
        }
    }) || null;
    console.log(`Carousel items: `,carouselItems.data);
    
    return(
        <div className={`flex px-5 pb-5 w-full min-h-full rounded-md `}>
            <div className="flex flex-col w-full h-full text-white">
                <p className="font-medium text-[1.25rem]">Carousel</p>
                <AdminCarousel carouselItemsData={carouselItems.data}/>
            </div>
        </div>
    )
}
export default Carousel;