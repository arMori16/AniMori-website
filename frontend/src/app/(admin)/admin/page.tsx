"use client"
import SearchBar from "@/components/navbar-components/search-bar/search-bar";
import useCommentsCounter from "@/components/useZustand/zustandCommentsCounter";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { getAllCounts, getCommentsData, getSeries } from "@/utils/admin.logic";
import { CommentsDto } from "@/utils/dto/adminDto/comments.dto";
import ClientPoster from "@/Images/ClientPoster";
import InfiniteScroll from "@/utils/infiniteScroll";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";






const AdminPage = ()=>{
    const {getPage,setPage} = usePageCounter();
    const {commentPage,getCommentPage,setCommentPage} = useCommentsCounter();
    const page = getPage();
    const seriesRef = useRef<HTMLDivElement>(null);
    const commentRef = useRef<HTMLDivElement>(null);
    const [commentData,setCommentData] = useState<CommentsDto[]>([]);
    const [commentsFilteredData,setComemntsFilteredData] = useState<CommentsDto[]>([]);
    const [counts,setCounts] = useState<{
        comments:number,
        series:number,
        users:number,
    }>({ comments: 0, users: 0, series: 0 });
    const [seriesInfo,setSeriesInfo] = useState<{
        SeriesName:string,
        SeriesViewName:string
    }[]>([]);

    useEffect(() => {
        console.log("Pathname or Component changed, resetting page...");
        setPage(0); 
        setCommentPage(0); // Reset the page state
    }, []);
    useEffect(()=>{
        const fetchedData = async()=>{
            const commentInfo = await getCommentsData(getCommentPage());
            setCommentData(commentInfo);
            setComemntsFilteredData((prev) => 
                {const newSeries = [...prev, ...commentInfo];
                // Remove duplicates by `SeriesName` (or other unique identifiers)
                const uniqueSeries = Array.from(new Map(newSeries.map(item => [item.Id, item])).values());
                return uniqueSeries;});
        }
        fetchedData()
    },[commentPage])
    useEffect(()=>{
        const fetchedData = async()=>{
            const countsData = await getAllCounts();
            const seriesInfoData = await getSeries(getPage());
            setCounts(countsData);
            setSeriesInfo((prevSeries) => 
                {const newSeries = [...prevSeries, ...seriesInfoData];
                // Remove duplicates by `SeriesName` (or other unique identifiers)
                const uniqueSeries = Array.from(new Map(newSeries.map(item => [item.SeriesName, item])).values());
                return uniqueSeries;});
        }
        fetchedData()
    },[page])
    return(
        <div className="flex flex-col w-full min-h-full px-5">
            <div className="flex items-end w-[85%] justify-center ml-auto mr-auto flex-shrink">
                <SearchBar isAdmin={true} model="catalog"/>
            </div>
            <div className="flex font-medium text-[1.5rem] h-[3rem] ml-4 text-rose-50">
                Analytics
            </div>
            {/* {`3labels`} */}
            <div className="flex custom-xl2:flex-wrap custom-xl2:items-stretch custom-xl2:justify-center w-full min-h-[30rem] items-start gap-4">
                {/* SeriesInfo */}
                <div className="flex w-[50%] custom-xl2:w-full h-full max-h-[30rem]">
                    <div ref={seriesRef} className="flex w-full max-w-full bg-[#352877] p-5 rounded-lg text-[1rem] text-rose-50 font-medium overflow-y-scroll">
                            <div className="flex flex-col max-w-[2.5rem] w-[2.5rem] h-full items-center">
                            {Array.from({length:seriesInfo.length},(_,index)=>(
                                    <div key={index} className="flex p-1 w-[2.5rem] min-h-[3.5rem] border-b-2 border-white">
                                        <ClientPoster src={`${process.env.NEXT_PUBLIC_API}/media/${seriesInfo[index].SeriesName}/images`} alt="poster" divClass="overflow-hidden w-full h-full object-cover rounded-sm"/>
                                    </div>
                            ))}
                            </div>
                        <InfiniteScroll type="series" componentRef={seriesRef} styles="flex w-full h-full" fetchedData={seriesInfo}>
                            <div className="flex flex-col w-full h-full">
                                {Array.from({length:seriesInfo.length},(_,index)=>(
                                    <div key={index} className="flex pl-2 w-full min-h-[3.5rem] items-center border-b-2 border-white">
                                        {seriesInfo[index].SeriesViewName}
                                    </div>
                                ))}
                            </div>
                        </InfiniteScroll>
                    </div>
                </div>
                {/* SeriesInfo */}
                <div className="flex flex-col w-[48%] max-h-[30rem] custom-xl2:w-full h-full text-[1.25rem] text-rose-50 font-light">
                    <div className="flex w-full h-[9rem] items-center justify-between custom-xl2:justify-around mb-2">
                        <button className="flex flex-col max-w-[32%] w-[12rem] p-3 h-[4.75rem] bg-[#352877] rounded-lg">
                            <div className="flex">
                                Comments
                            </div>
                            <div className="flex w-full justify-center max-w-full text-[1rem] text-rose-50 font-medium">
                                {counts.comments}
                            </div>
                        </button>
                        <button className="flex flex-col max-w-[32%] w-[10rem] p-3 h-[4.75rem] bg-[#352877] rounded-lg">
                            <div className="flex">
                                Series
                            </div>
                            <div className="flex w-full justify-center max-w-full text-[1rem] text-rose-50 font-medium">
                                {counts.series}
                            </div>
                        </button>
                        <button className="flex flex-col  max-w-[32%] w-[11rem] p-3 h-[4.75rem] bg-[#352877] rounded-lg">
                            <div className="flex">
                                Users
                            </div>
                            <div className="flex text-[1rem] w-full justify-center max-w-full text-rose-50 font-medium">
                                {counts.users}
                            </div>
                        </button>
                    </div>
                    <div className="flex w-full h-full bg-[#352877] rounded-lg overflow-y-scroll" ref={commentRef}>
                        <InfiniteScroll type="comments" fetchedData={commentData} componentRef={commentRef} styles="flex w-full h-full flex-col">
                            {commentsFilteredData.map((item,index)=>(
                                <div key={index} className="flex w-full h-[3rem] border-b-2 border-white text-white">
                                <div className="flex min-w-[4rem] w-[8rem] h-full p-[6px]">
                                    <div className="flex overflow-hidden rounded-md w-[2.25rem] relative h-[2.25rem] mr-2">
                                        <Image src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${item.UserId}`} fill alt="" />
                                    </div>
                                    <div className="flex flex-col min-w-[3rem] h-full text-[12px] font-medium">
                                        <Link href={`/admin/comments/view/${encodeURIComponent(item.UserName)}/${encodeURIComponent(String(item.createdAt))}/${encodeURIComponent(item.CommentText)}/${item.SeriesName}`} className={`flex w-full overflow-x-scroll hover:text-[#b5536d]`}>
                                            {item.UserName}
                                        </Link>
                                        <div className="flex w-full text-[8px]">
                                            {item.createdAt}
                                        </div>
                                    </div>
                                </div>
                                <div className={`flex scrollbar-hide max-w-[18rem] mr-2 text-[10px] scrollbar-hide overflow-y-scroll whitespace-wrap overflow-x-scroll ${item.CommentText.length <100?'items-center justify-center':''}`}>
                                    {item.CommentText}
                                </div>
                            </div>
                            ))}
                        </InfiniteScroll>
                    </div>
                </div>
            </div>
            {/* {`label1`} */}
            <div className="flex flex-col relative w-full h-[20rem] mt-5 p-5  max-w-full  bg-[#352877] rounded-lg">
                <div className="flex max-w-full w-full h-[3rem] border-b-2 text-[1.25rem] text-rose-50 font-normal items-end">
                    <div className="flex">
                        User
                    </div>
                    <div className="flex ml-auto max-w-[14rem] mr-4 w-[14rem] justify-between">
                        <div className="flex">
                            Id
                        </div>
                        <div className="flex">
                            Comments
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminPage;