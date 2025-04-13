'use server'

import axios from "@/api/axios";
import Poster from "@/Images/Posters";
import Link from "next/link";

import { notFound } from "next/navigation";

export default async function SearcPage({searchParams}:{searchParams:{page:number,seriesName:string}}){
    const req = async()=>{
        try{
            return await axios.get(`/catalog/search`,{
                params:{
                    param:decodeURIComponent(searchParams.seriesName),
                    skip:searchParams.page - 1
                }
            });
        }catch(err){
            console.error(err);
            return null
        }

    }
    const seriesInfo = await req();
    
    const counts = (seriesInfo?.data && seriesInfo.data.length >= 1) ? Math.ceil(seriesInfo.data.length / 24) : 1;
    if(searchParams.page > counts){
        notFound()
        
    }
    return(
        <div className="flex flex-col w-full bg-gray-200 min-h-screen h-full items-center">
            {seriesInfo?.data.length >= 1 ? (
            <div className="flex flex-col w-full bg-gray-200 min-h-screen h-full items-center">
                <div className="flex w-full flex-col h-full items-center mt-[3rem] ">
                    <div className="flex w-[70%] custom-1024:w-[calc(100%_-_40px)] custom-1024:mx-5 custom-s-200:mx-5 custom-s-200:w-[calc(100%_-_40px)] bg-gray-2E h-full flex-wrap p-5 pr-0 rounded-tr-[0.25rem] rounded-br-[0.25rem]">
                        <div className="w-full mb-2">
                            <p className="text-white text-[1.45rem]">Anime search results for your query: «{searchParams.seriesName}»</p>
                        </div>
                        {seriesInfo?.data.map((item:any,index:number)=>(
                            <div key={index} className="flex-1 flex flex-col mr-5 mb-3 max-w-[14rem] hover:scale-105 group transition-transform duration-500 ease-in-out">
                                <Link href={`/catalog/item/${item.SeriesName}`} className="flex flex-col
                                " >
                                    <Poster 
                                        src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} 
                                        alt="poster" 
                                        conteainerClass="object-cover group-hover:shadow-poster transition-shadow duration-1000 ease-in-out w-full
                                        aspect-[250/350]  /* Controls the aspect ratio */
                                        max-w-[14rem] min-w-[12rem] 
                                        max-h-[19rem] min-h-[12rem] /* Height control */
                                        custom-1024:max-w-[14rem] custom-1024:min-w-[11rem] 
                                        custom-1024:max-h-[20rem] custom-1024:min-h-[12rem] 
                                        custom-s-200:min-h-[8rem] custom-s-200:min-w-[8rem] 
                                        "
                                    />
                                </Link>

                                <span className="w-full overflow-hidden text-ellipsis text-center">
                                    <p className="line-clamp-2 text-white font-normal">{item.SeriesViewName}</p>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='flex mb-[10rem] w-full mt-2 justify-center h-[2.5rem] p-1 gap-x-2 font-medium text-white'>
                    {Array.from({length:counts <= 7?counts:7},(value,index)=>(
                        <Link key={index} href={`/catalog/?page=${index + 1}`} className='flex bg-gray-300 h-full w-[2rem] items-center justify-center rounded-md'>
                            <p>{index + 1}</p>
                        </Link>
                    ))}
                    <p>...</p>
                    <Link href={`/?page=${counts}`} className='flex bg-gray-300 h-full w-[2rem] items-center justify-center rounded-md'>{counts}</Link>
                </div>
            </div>
            ):(
                <div className="flex flex-col w-[80%] p-2 min-h-[10rem] bg-gray-300 rounded-sm mt-[3rem]">
                     <div className="flex w-full">
                        <p className="text-white text-[1.45rem]">Anime search results for your query: «{searchParams.seriesName}»</p>
                     </div>
                     <div className="flex flex-col text-center w-full text-white justify-center items-center">
                        <img src="/images/thinking3.png" className="w-[12rem] h-[12rem] rounded-sm" alt="" />
                        <p>Nothing founded!</p>
                        <p>try to check if it&apos;s a valid series name?</p>
                     </div>
                </div>
            )}
        </div>
    )
}