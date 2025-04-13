'use client'
import { getCommentById, handleDeleteComment } from "@/components/comments/comments.logic";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { handleCommentDelete, handleUserCommentsHitory } from "@/utils/admin.logic";
import { CommentsDto } from "@/utils/dto/adminDto/comments.dto";
import { formatDate } from "@/utils/formattDate";
import InfiniteScroll from "@/utils/infiniteScroll";
import { create } from "lodash";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const View = ({params}:{params:{commentId:number}})=>{
    const {page,getPage,setPage} = usePageCounter();
    const divRef = useRef<HTMLDivElement>(null);
    const hasFetchedRef = useRef(false);
    const [showHistory,setShowHistory] = useState<boolean>(false);
    const [filteredData,setFilteredData] = useState<CommentsDto[]>([]);
    const [commentData,setCommentData] = useState<CommentsDto | null>(null);
    
    const handleShowHistory = async()=>{
        setShowHistory((prev)=>!prev);
        if(!hasFetchedRef.current){
            const data = commentData?.UserName && await handleUserCommentsHitory(commentData?.UserName,getPage());
            setFilteredData(data);
        };
    }
    const handleDeleteComment = (commentId:number)=>{
        try{
            handleCommentDelete(commentId);
            setCommentData(filteredData[filteredData.length - 2]);
            setFilteredData((prev) => prev.filter((comment) => comment.Id !== commentId));
        }catch(err){
            console.error('Error when trying to delete comment!');
            console.error(err)
        }
    }
    useEffect(()=>{
        const fetchCommentData = async()=>{
            const commentData = await getCommentById(params.commentId);
            commentData ? setCommentData({...commentData,createdAt:formatDate(commentData.createdAt)}) : setCommentData(null);
        };
        fetchCommentData();
    },[])
    useEffect(()=>{
        if(showHistory){
            const fetchHistoryData = async()=>{
                const data = commentData?.UserName && await handleUserCommentsHitory(commentData?.UserName,getPage());
                setFilteredData((prev)=>{
                    const newArray = [...prev,...data];
                    const filteredArray = Array.from(new Map(newArray.map(item=>[item.Id,item])).values());
                    return filteredArray.map((item:any)=>(
                        {...item,createdAt:formatDate(item.createdAt)}
                    ));
                })
            }
            fetchHistoryData()
        }
    },[page])
    if(!commentData){
        return (
            <div className={`text-3xl flex text-rose-50 w-full h-full justify-center mt-[2rem] ${commentData === null ? 'bg-red-button rounded-md p-5':'bg-gray-300 p-5 rounded-custom-sm'}`}>{commentData === null ? 'No such comment!' : 'Loading...'}</div>
        )
    }
    return(
        <div className="flex min-w-full min-h-[10rem] flex-col">
            <div className="block max-w-full min-h-[5rem] bg-gray-300 rounded-md items-center relative text-white p-5">
                <div className="block float-left w-[5rem] h-[5rem] relative custom-lg:max-w-[2.65rem] custom-lg:mt-[0.33rem] custom-lg:h-[2.65rem] overflow-hidden rounded-md mr-2">
                    <Image src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${commentData?.UserId}`} fill className="block w-full h-full" alt="" />
                </div>
                {/* TODO: Link that sends the admin to user page view,when it was clicked */}
                <div className="block relative w-full ">
                    <div className="flex flex-col relative">
                        <div className="relative flex justify-between">
                            <p className="font-medium  text-[1.25rem]">{commentData?.UserName}</p>
                            <div className="flex">
                                <button onClick={()=>handleDeleteComment(commentData?.Id)} className="flex items-center justify-center w-[1.75rem] h-[1.75rem] bg-red-button rounded-custom-sm">
                                    <i className="fa fa-trash text-[1rem]"></i>
                                </button>
                            </div>
                        </div>
                        <div className="flex font-normal mb-1">
                            <div className="flex rounded-md h-[1.25rem] items-center justify-center relative bg-[#629377] min-w-[5rem] w-[5.5rem] max-w-[6rem] text-[11px] px-1">
                                {commentData?.createdAt}
                            </div>
                            <div className="flex bg-[#402D9F] px-[6px] ml-1 rounded-md min-h-[1.25rem] items-center justify-center text-[0.8rem]">
                                {commentData?.SeriesName}
                            </div>
                        </div>
                    </div>

                </div>
                <div className="block w-full">
                    <div className="font-light relative max-w-[88%] break-words overflow-hidden">
                        {commentData?.CommentText}
                    </div>

                </div>
            </div>
            {/* TODO: Show history button */}
            <div className="flex w-full font-medium text-[1rem] my-5 items-center justify-center text-white">
                <button onClick={handleShowHistory}>
                    History
                </button>
            </div>
            <div ref={divRef} className={`flex ${showHistory ? 'translate-y-0 opacity-100':'translate-y-[10rem] opacity-0'} transition-all ease-out duration-500 h-full overflow-hidden w-full bg-gray-300 rounded-[0.25rem]`}>
                <InfiniteScroll type="comments" isWindow={true} fetchedData={filteredData} componentRef={divRef} styles={`flex flex-col w-full h-full overflow-hidden`}>
                    {filteredData.map((item,index)=>(
                        <div key={index} className="flex w-full h-[4rem] border-b-2 border-white text-white">
                            <div className="flex min-w-[8rem] w-[10rem] h-full p-[6px]">
                                <div className="flex min-w-[3rem] relative overflow-hidden rounded-md custom-xs:min-w-[2.65rem] custom-xs:mt-[0.33rem] h-[3rem]">
                                    <Image src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${commentData?.UserId}`} fill alt="" />
                                </div>
                                <div className="flex flex-col min-w-[7rem] max-w-[10rem] ml-2 h-full">
                                    <Link href={`http://localhost:3000/admin/comments/view/${item.UserId}/${encodeURIComponent(item.UserName)}/${encodeURIComponent(String(item.createdAt))}/${encodeURIComponent(item.CommentText)}/${item.SeriesName}`} className={`flex w-full overflow-x-scroll hover:text-[#b5536d]`}>
                                        {item.UserName}
                                    </Link>
                                    <div className="flex w-full">
                                        {item.createdAt}
                                    </div>
                                </div>
                            </div>
                            <div className={`flex min-w-[18rem] scrollbar-hide max-w-[25rem] overflow-y-scroll overflow-x-scroll ml-auto ${item.CommentText.length <100?'items-center justify-center':''}`}>
                                {item.CommentText}
                            </div>
                            <div className="flex w-[8rem] items-center justify-center ml-auto">
                                <div className="flex w-full h-[1.75rem] scrollbar-hide overflow-x-scroll overflow-y-hidden whitespace-nowrap">
                                    {item.SeriesName}
                                </div>
                            </div>
                            <div className="flex w-[1.7rem] h-full ml-[1rem] items-center justify-center ">
                                <button onClick={async()=>{await handleCommentDelete(item.Id);setFilteredData((prev) => prev.filter((comment) => comment.Id !== item.Id));
                                    }} className="flex w-full h-[1.7rem] rounded-md pb-[2px] items-center justify-center font-bold">
                                    <span className="rotate-45">+</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </InfiniteScroll>
                
            </div>
        
            
        </div>
    )
}
export default View;