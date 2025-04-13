'use server'

import axios from "@/api/axios"
import Rating from "@/components/catalog/item/rating";
import Poster from "@/Images/Posters";
import Link from "next/link";

export default async function TopPage(){
    const topCatalog = await axios.get('/catalog/top',{});
    console.log(`CATALOG: `,topCatalog.data);
    
    return (
        <div className="flex w-full min-h-screen justify-center bg-gray-100">
            <div className="flex w-[75%] custom-1024-max:w-[98%] flex-col my-[3rem]">
                <div className="flex w-full h-[2.5rem] bg-gray-1B rounded-t-custom-sm justify-center items-center text-white uppercase text-[0.95rem]">
                    <p>Top-100 Anime</p>
                </div>
                {/* IMG 14rem x 19.68rem */}
                <div className="grid items-stretch place-items-center grid-cols-4 custom-920-675:grid-cols-3 custom-675:grid-cols-2 custom-675:gap-x-2 p-5 bg-gray-2E gap-x-6">
                    {topCatalog.data.map((item:any,index:number)=>(
                        <div key={index} className="flex-1 flex relative flex-col mb-3 max-w-[16rem] hover:scale-105 group transition-transform duration-500 ease-in-out">
                            <div className="absolute top-[0.5rem] px-4 custom-s:px-1 custom-s:h-[1.15rem] h-[1.5rem] bg-orange-yellow custom-s:text-[0.85rem] text-[18px] font-medium flex items-center pl-2 text-white
                            after:content-[''] after:border-x-transparent after:right-[-0.73rem] after:border-[#F5C543] custom-s:after:border-t-[0.57rem] custom-s:after:border-b-[0.57rem] after:border-t-[0.75rem] after:border-b-[0.75rem] after:border-r-[0.75rem] after:absolute">
                                <img src={`/icons/star.white.svg`} className="w-[1rem] h-[1rem] custom-s:w-[0.75rem] custom-s:h-[0.75rem] mr-1" alt="" />
                                {(item.avgrate ?? 0).toFixed(2)}
                            </div>
                            <span className="flex items-center justify-center absolute right-0 top-[0.45rem] text-[0.85rem] p-1 pl-[6px] bg-black bg-opacity-50 text-white h-[1.35rem]">
                                <i className="fa-solid fa-location-dot text-[0.85rem] mr-1"></i>
                                {index + 1}
                            </span>
                            <Link href={`catalog/item/${item.SeriesName}`} className="flex flex-col
                            " >
                                <Poster 
                                    src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} 
                                    alt="poster" 
                                    conteainerClass="object-cover group-hover:shadow-poster transition-shadow h-full duration-1000 ease-in-out w-full
                                    aspect-[265/375] custom-675:aspect-[250/350]
                                    "
                                />
                            </Link>
                            <div className="w-full overflow-hidden text-ellipsis text-center">
                                <p className="line-clamp-2 text-white font-normal">{item.SeriesViewName}</p>
                            </div>
                            <div className="flex w-full justify-center items-center text-white">
                                <i className='fa-regular fa-eye text-[0.85rem] mr-1'></i>
                                <p>{item.viewscount}</p>
                                <i className='fa-solid fa-star text-[0.85rem] ml-2 mr-1'></i>
                                <p>{item.ratecount}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}