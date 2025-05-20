'use client'
import ClientPoster from "@/Images/ClientPoster";
import Link from "next/link";
import Rating from "../catalog/item/rating";
import { list } from "../catalog/item/item.logic";
import { LastViewedItem } from "@/app/(main)/users/lastviewed/[userId]/page";
import { formatDate } from "@/utils/formattDate";


export default function RowItemFormat({item}:{item:LastViewedItem}){

    return(
        <div className={`flex flex-col w-full relative p-2 bg-gray-100 group transition-all duration-500 ease-in-out`}>
            <Link onClick={(e:any) => {
                if (e.target.closest("button")) {
                    e.preventDefault();
                }
                }} href={`/catalog/item/${item.SeriesName}`} prefetch={false} className={`flex border-b-[1px] border-b-gray-300 text-white w-full py-2 px-[2px] div-animation`}>
                <ClientPoster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt="poster" containerClass="min-w-[4.5rem] group-hover:scale-[1.03] object-cover transition-transform duration-500 flex-shrink-0 h-[6.25rem]"/>
                <div className="flex flex-col w-full px-2">
                    <p className="font-medium">{item.SeriesViewName}</p>
                    <div className="flex items-center text-gray-500">
                        <i className="fa fa-eye text-[0.7rem] mr-1"></i>
                        <p className="text-[0.8rem]">{item.Views}</p>
                    </div>
                    <div className="mt-auto z-20">
                        {<Rating initialRate={Number(item.Rate) || 0} initialUserRate={item.UserRate} seriesName={item.SeriesName}/>}
                    </div>
                </div>
                <div className="flex flex-col items-end pr-2">
                    <div className="flex mt-2 items-center">
                        <div className={` p-1 rounded-custom-sm whitespace-nowrap`} style={{backgroundColor:`${list.find((listItem:any)=>listItem.key.split(" ").join("") === item.UserListStatus)?.color}`}}>
                            <i className={`fa-solid fa-${list.find((listItem:any)=>listItem.key.split(" ").join("") === item.UserListStatus)?.value} text-[0.9rem] mr-2`}></i>
                            {item.UserListStatus === 'OnHold' ? 'On Hold' : item.UserListStatus}
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}