'use client'
import SearchBar from "@/components/navbar-components/search-bar/search-bar";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { deleteSeries, getAllCounts, getSeries } from "@/utils/admin.logic";
import ClientPoster from "@/Images/ClientPoster";
import InfiniteScroll from "@/utils/infiniteScroll";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { it } from "node:test";
import { useState, useEffect, useRef, RefObject } from "react";


const Series = ()=>{
    const divRef = useRef<HTMLDivElement>(null)
    const {getPage,setPage} = usePageCounter();
    const page = getPage();
    const [seriesInfo,setSeriesInfo] = useState<{
        SeriesName:string,
        SeriesViewName:string
    }[]>([]);
    const [seriesShowInfo,setSeriesShowInfo] = useState<any[]>([]);
    useEffect(() => {
        console.log("Pathname or Component changed, resetting page...");
        setPage(0);
    }, []);
    useEffect(()=>{
        const fetchedData = async()=>{
            const seriesInfoData = await getSeries(getPage());
            setSeriesInfo(seriesInfoData);
            setSeriesShowInfo((prevSeries) => 
                {const newSeries = [...prevSeries, ...seriesInfoData];
                // Remove duplicates by `SeriesName` (or other unique identifiers)
                const uniqueSeries = Array.from(new Map(newSeries.map(item => [item.SeriesName, item])).values());
                return uniqueSeries;}
            )
        }
        fetchedData()
    },[page])
    return(
        <div className="flex max-w-full flex-col w-full h-full">
            <div className="flex w-full justify-center mb-5">
                <SearchBar isAdmin={true} model={'catalog'}/>
            </div>
            <div className="flex max-w-full w-full h-[35rem] p-5 bg-[#352877] rounded-md">
                <div className="flex overflow-scroll w-full h-full max-w-full bg-[#352877] p-5 rounded-lg text-[1rem] text-rose-50 font-medium" ref={divRef}>
                    <InfiniteScroll type={'series'} componentRef={divRef} styles={'flex flex-col w-full h-full'} fetchedData={seriesInfo}>
                        {seriesShowInfo.map((item,index)=>(
                            <div key={index} className="flex w-full h-[3.5rem] items-center border-b-2 border-white p-1">
                                <ClientPoster  src={`http://localhost:3001/media/${item.SeriesName}/images`} divClass="overflow-hidden h-full" containerClass="rounded-sm w-[2rem] h-full mr-2" alt=""/>
                                <p>{item.SeriesViewName}</p>
                                <div className="flex min-h-[3.5rem] w-[8rem]  gap-2 items-center ml-auto mr-4 text-[0.85rem]">
                                    <div className="flex w-[50%] h-[1.50rem]">
                                        <Link href={`series/view/${seriesShowInfo[index].SeriesName}`} className="flex bg-[#5DC090] justify-center items-center w-full rounded-sm">view</Link>
                                    </div>
                                    <div className="flex w-[50%] h-[1.50rem]">
                                        <button onClick={()=>{deleteSeries(seriesShowInfo[index].SeriesName);
                                            setSeriesShowInfo((prev)=>prev.filter((item)=>item.SeriesName !== seriesShowInfo[index].SeriesName))
                                            }} className="flex bg-[#B32C25] justify-center items-center w-full rounded-sm">delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </InfiniteScroll>
                </div>
            </div>
            <div className="flex max-w-full w-full h-[3.50rem] justify-end items-center mt-5 mb-[4rem]">
                <Link href={'series/add-new-series'} className="flex h-full w-[3.50rem] items-center justify-center rounded-[50%] bg-gray-300 overflow-hidden mr-5">
                    <i className="fa-solid fa-plus text-[2rem] text-white"></i>
                </Link>
            </div>
        </div>
    )
}
export default Series;