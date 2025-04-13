'use client'
import { CommentsDto } from "@/utils/dto/adminDto/comments.dto";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { getCommentsData, handleCommentDelete } from "@/utils/admin.logic";
import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "@/utils/infiniteScroll";
import { usePathname } from "next/navigation";
import Link from "next/link";
import useCommentsCounter from "@/components/useZustand/zustandCommentsCounter";
import Image from "next/image";

const Comments = ()=>{
    const [data,setData] = useState<CommentsDto[]>([]);
    const [filteredData,setFilteredData] = useState<CommentsDto[]>([]);
    const divRef = useRef<HTMLDivElement>(null);
    const {getCommentPage,setCommentPage,commentPage} = useCommentsCounter();

    useEffect(() => {
        setCommentPage(0);
    }, []);
    useEffect(()=>{
        const fetchCommentsData = async()=>{
            const data = await getCommentsData(getCommentPage());
            setData(data);
            setFilteredData((prev)=>{
                const newArray = [...prev,...data];
                const filteredArray = Array.from(new Map(newArray.map(item=>[item.Id,item])).values());
                return filteredArray;
            });
        }
        fetchCommentsData();
    },[commentPage]);
    if(!data){
        return (
            <div className="text-3xl flex text-rose-50 w-full h-full justify-center mt-[2rem]">Loading...</div>
        )
    }
    
    
    return(
        <div ref={divRef} className={`flex flex-col bg-[#352877] px-5 pb-5 w-full max-h-[37rem] h-full rounded-md overflow-y-scroll scrollbar-hide`}>
            <div className={`flex w-full h-[3rem] border-b-2 border-white font-medium text-[1.25rem] text-rose-50 p-1 justify-between`}>
                <div className="flex w-[6rem] h-full items-end justify-center">
                    User
                </div>
                <div className="flex w-[6rem] h-full items-end ml-[3.5rem]">
                    Content
                </div>
                <div className="flex w-[6rem] h-full items-end mr-[3rem]">
                    Series
                </div>
            </div>
            {filteredData.length === 0 && (
                <div className="flex w-full h-full items-center justify-center mt-2">
                    <p className="text-xl text-rose-50">No comments posted yet :(</p>
                </div>
            )}
            <InfiniteScroll type="comments" componentRef={divRef} fetchedData={data} styles="flex flex-col w-full h-full">
                {filteredData.map((item,index)=>(
                    <div key={index} className="flex w-full h-[4rem] border-b-2 border-white text-white">
                        <div className="flex min-w-[8rem] w-[10rem] h-full p-[6px]">
                            <div className="flex min-w-[3rem] overflow-hidden relative h-full rounded-md custom-xs:min-w-[2.65rem] custom-xs:mt-[0.33rem] custom-xs:h-[2.65rem]">
                                <Image src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${item.UserId}`} fill alt="" />
                            </div>
                            <div className="flex flex-col min-w-[7rem] max-w-[10rem] ml-2 h-full">
                                <Link href={`http://localhost:3000/admin/comments/view/${item.Id}`} className={`flex w-full overflow-x-scroll hover:text-[#b5536d]`}>
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
    )
}
export default Comments;