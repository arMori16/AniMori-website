"use server"

import axios from "@/api/axios";
import CategoryDropDown from "@/components/catalog/CategoryDropDown";
import getSeriesInfo, { getPageCount, getSeasonedCatalog } from "@/utils/getSeriesInfo";
import Poster from "@/Images/Posters";
import Link from "next/link";
import { notFound } from "next/navigation";

const Catalog = async({searchParams}:{searchParams:{page:number,status?:string,category?:string}})=>{
    const seriesInfo = await getSeriesInfo({page:searchParams.page - 1,take:24,category:searchParams.category,skipPage:24,status:searchParams.status});
    const counts = await getPageCount({category:searchParams.category,status:searchParams.status}) || 1;
    const categories = await axios.get('/catalog/categories');
    if(searchParams.page > counts){
        notFound()
    }
    return(
        <div className="flex flex-col w-full bg-gray-200 min-h-screen h-full items-center">
            <div className="flex w-full custom-s-200:flex-col custom-1024:flex-col h-full justify-center mt-[3rem] custom-1024-max:px-3">
                <div className="flex flex-col w-[14rem] min-h-[18rem] custom-s-200:hidden custom-1024:hidden p-2 bg-[#181818] rounded-tl-[0.25rem] rounded-bl-[0.25rem] text-white">
                    <p className=" font-semibold uppercase"><i className="fa-solid fa-sliders text-[1rem] mr-1"></i>Category</p>
                    {categories.data.map((item:any,index:number)=>(
                        <div key={index} className="flex w-full pl-5 mt-2">
                            <Link href={`/catalog/?page=1&category=${item.genre}`} className="inline-flex w-fit hover:text-green-400 transition-all hover:scale-105 duration-500">{item.genre}</Link>
                        </div>
                    ))}
                </div>
                <CategoryDropDown categories={categories.data}/>
                <div className="grid items-stretch place-items-center grid-cols-4 custom-1024-max:w-[98%] custom-920-675:grid-cols-3 custom-675:grid-cols-2 custom-675:gap-x-2 w-[70%] bg-gray-2E h-full p-5 pr-0 rounded-tr-[0.25rem] rounded-br-[0.25rem]">
                    {seriesInfo.map((item:any,index:number)=>(
                        <div key={index} className="flex-1 flex flex-col mr-5 mb-3 max-w-[14rem] hover:scale-105 group transition-transform duration-500 ease-in-out">
                            <Link href={`catalog/item/${item.SeriesName}`} className="flex flex-col
                             " >
                                <Poster 
                                    src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} 
                                    alt="poster" 
                                    conteainerClass="object-cover group-hover:shadow-poster transition-shadow duration-1000 ease-in-out w-full
                                    aspect-[250/350] 
                                    "
                                />
                            </Link>
                            <div className="w-full overflow-hidden text-ellipsis text-center">
                                <p className="line-clamp-2 text-white font-normal">{item.SeriesViewName}</p>
                            </div>
                            <div className="flex w-full justify-center items-center text-white">
                                <i className='fa-regular fa-eye text-[0.85rem] mr-1'></i>
                                <p>{item.Views}</p>
                                <i className='fa-solid fa-star text-[0.85rem] ml-2 mr-1'></i>
                                <p>{item.Count}</p>
                            </div>
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
    )
}

export default Catalog;