'use client'
import { deleteUserListItem, list, updateUserList } from "@/components/catalog/item/item.logic";
import useProfileListItems from "@/components/useZustand/profile/zustandProfileUserList";
import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import axios from "@/api/axios";
import Link from "next/link";
import { toast } from "react-toastify";
import ClientPoster from "@/Images/ClientPoster";

const ProfileUserList = ({userId,isOwner}:{userId:number,isOwner:boolean})=>{
    const {listItem,getUserListItem,setUserListItem} = useProfileListItems();
    const [itemsInfo,setItemsInfo] = useState<any[]>([]);
    const [currentItems,setCurrentItems] = useState<any[]>([]);
    const [openItemSettings,setOpenItemSettings] = useState<any[]>([]);
    const [counts,setCounts] = useState<any[]>([]);
    const handleToggleListItems = (item:any)=>{
        setUserListItem(item.key);
    }
    useEffect(()=>{
        const fetchData = async()=>{
            const data = await axios.get('/user/profile/userList/info',{
                params:{
                    userId:userId
                },
                headers:{
                    'Authorization':`Bearer ${Cookies.get('accessToken')}`
                }
            })
            setCounts(data.data.counts);
            setItemsInfo(data.data.userListItemsInfo);
            setCurrentItems(data.data.userListItemsInfo.filter((item:any)=>item.Status === listItem.split(" ").join("")));
        }
        fetchData();
    },[]);
    useEffect(()=>{
        setCurrentItems(itemsInfo.filter((item:any)=>item.Status === listItem.split(" ").join("")));
    },[listItem])
    const handleOpenCloseSettings = (seriesName:string)=>{
        setOpenItemSettings((prev) => {
            const existingItem = prev.find((item) => item.SeriesName === seriesName);
            if (existingItem) {
                return prev.map((item) =>
                    item.SeriesName === seriesName ? { ...item, opened: !item.opened, SeriesName: seriesName } : item
                );
            } else {
                return [...prev, { opened: true, SeriesName: seriesName }];
            }
        });
    }
    const handleUpdateUserList = (item:any,userListItem:string)=>{
        setCounts((prev:any) => {
            const nextStatus = userListItem.split(" ").join("");
        
            // Check if nextStatus exists
            const exists = prev.some((counts: any) => counts.Status === nextStatus);
        
            // Update counts
            const updatedCounts = prev.map((counts: any) => {
                if (counts.Status === item.Status) {
                    return { ...counts, _count: { Status: counts._count.Status - 1 } };
                } 
                if (counts.Status === nextStatus) {
                    return { ...counts, _count: { Status: counts._count.Status + 1 } };
                }
                return counts;
            });
        
            // If `nextStatus` was missing, add it manually
            if (!exists) {
                updatedCounts.push({ Status: nextStatus, _count: { Status: 1 } });
            }
        
            console.log(`Updated Counts: `, updatedCounts);
            return updatedCounts;
        });
        
        setOpenItemSettings((prev:any)=>{
            const newItems = [...prev.filter((items:any)=>items.SeriesName !== item.SeriesName)];
            console.log(`NE ITEMS: `,newItems);
            
            return newItems;
        });
        setCurrentItems((prev:any)=>{
            const newItems = prev.filter((items:any)=>(items.SeriesName !== item.SeriesName && items.Status !== userListItem.split(" ").join("")));
            return newItems;
        })
        setItemsInfo((prev:any)=>{
            const newItems = prev.map((items:any)=>items.SeriesName === item.SeriesName ? {...items,Status:userListItem.split(" ").join("")} : {...items});
            return newItems;
        })
        updateUserList(item.SeriesName,userListItem.split(" ").join(""),item.SeriesViewName);
    }
    const handleDelete = (item:any)=>{
        setOpenItemSettings((prev:any)=>{
            return [...prev.filter((items:any)=>items.SeriesName !== item.SeriesName)];
        });
        setCounts((prev:any)=>{
            const counts = prev.map((items:any)=>items.Status === item.Status ? {...items,_count:{Status:items._count.Status - 1}} : {...items});
            return counts;
        });
        setCurrentItems((prev:any)=>{
            const newItems = prev.filter((items:any)=>(items.SeriesName !== item.SeriesName));
            return newItems;
        })
        deleteUserListItem(item.SeriesName);
        toast.info('Removed successffully from your list :)');
    }
    return(
        <div className={`flex mt-[2rem] w-[87%] flex-col rounded-t-md`}>
             <div className="flex w-full h-[3.15rem] bg-gray-2E border-b-4 overflow-x-scroll overflow-y-hidden" style={{borderColor: list.find(item => item.key === getUserListItem())?.color}}>
                {list.map((item:any,index:number)=>(
                    <button key={index} onClick={()=>handleToggleListItems(item)} className={`flex hover:bg-[rgba(255,255,255,0.1)] h-full min-w-[6rem] rounded-t-lg transition-color duration-500 ease-in-out items-center flex-col  justify-center text-white text-[0.8rem]`} style={{backgroundColor:getUserListItem() === item.key?`${item.color}`:''}}>
                        <div className="flex">
                            <i className={`fa fa-${item.value} p-1 rounded-md flex text-white gap-x-2 mr-2`} style={{backgroundColor: item.color}}>
                            </i>
                            <span>{counts.find(countsItem=>countsItem.Status === (item.key).split(" ").join(""))?._count.Status || 0}</span>
                        </div>      
                        <p>{item.key}</p>
                    </button>
                ))}
             </div>
            {currentItems.map((item:any,index:number)=>(
                <Link onClick={(e:any) => {
                    if (e.target.closest("button")) {
                        e.preventDefault(); // ОТМЕНЯЕМ ПЕРЕХОД ТОЛЬКО ЕСЛИ КЛИК ПО КНОПКЕ
                    }
                    }} key={index} href={`${process.env.NEXT_PUBLIC_FRONT_API}/catalog/item/${item.SeriesName}`} className="flex relative justify-between w-full h-[2.8rem] bg-gray-2E border-b-[1px] z-10 border-gray-300 text-white items-center pl-2 font-medium">
                    <div className="flex py-2 items-center ">
                        <ClientPoster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} containerClass="object-cover w-[1.5rem] h-full mr-2 rounded-sm" alt="" />
                        <p>{item.SeriesViewName}</p>
                    </div>
                    {isOwner && (
                        <div className="flex h-full absolute right-0 z-20 max-w-[20rem] flex-grow justify-end text-white overflow-hidden">
                            <div className={`flex transition-transform duration-700 ease-out overflow-hidden origin-right`} 
                                style={openItemSettings.find((items:any)=>items.SeriesName === item.SeriesName && items.opened) 
                                    ? { transform:'translateX(0%)'} 
                                    : { transform:'translateX(100%)' }}
                            >
                                {list.map((items:any,index:any)=>(
                                    <button onClick={()=>handleUpdateUserList(item,items.key)} key={index} className={`flex w-[2.8rem] items-center duration-500 ease-in-out transition-colors justify-center h-full border-r-[1px] bg-gray-100 border-r-gray-2E `} style={{backgroundColor:listItem === items.key ? `${items.color}`: ''}}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = items.color)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = listItem === items.key ? items.color : '')}
                                    >
                                        <i className={`fa fa-${items.value} p-1 rounded-md flex text-[0.8rem] `} ></i>
                                    </button>
                                )) }
                                <button onClick={()=>handleDelete(item)} className={`flex w-[2.8rem] items-center justify-center h-full border-r-[1px] hover:bg-red-button duration-500 ease-in-out transition-colors bg-gray-100 border-r-gray-2E `}>
                                    <i className={`fa-solid fa-trash p-1 rounded-md flex text-[0.8rem] `} ></i>
                                </button>
                            </div>
                            <div className="flex w-[2.9rem] h-full z-20 bg-gray-100">
                                <button type="button" onClick={()=> handleOpenCloseSettings(item.SeriesName)} className="flex w-full h-full items-center justify-center">
                                    <i className="fa fa-cog text-[0.8rem]"></i>
                                </button>
                            </div>
                        </div>
                    )}
                </Link>
            ))}
        </div>
    )
}
export default ProfileUserList;