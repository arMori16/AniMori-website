'use client'

import { handleUsersUpdate } from "@/utils/admin.logic";
import { useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

const AdminUsers = ({initialUsers}:{initialUsers:any[]})=>{
    const [users,setUsers] = useState<any[]>(initialUsers);
    const handleUpdateUserInfo = (item:any,operationType:string,data:boolean | number)=>{
        handleUsersUpdate(item.email,operationType,data);
    }
    return (
        <div className="flex flex-col w-full max-w-full h-full">
            {users.map((item:any,index:number)=>(
                <div key={index} className="flex w-full h-[2.75rem] border-b-2 p-1 custom-md-2:text-[0.85rem]">
                    <div className="flex h-full ml-3 items-center flex-shrink flex-grow w-[6rem] overflow-hidden">
                        <Image src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${item.id}`} alt="" width={0} height={0} sizes="100%" className="w-[2rem] object-cover rounded-sm h-full mr-2"/>
                        <p className="truncate">{item.firstName}</p>
                    </div>
                    <div className="flex h-full items-center flex-grow max-w-[10rem] mr-[3rem] overflow-x-scroll scrollbar-hide">
                        <p>{item.email}</p>
                    </div>
                    <div className="flex items-center ml-1 h-full flex-grow flex-shrink min-w-[4.5rem] overflow-y-scroll scrollbar-hide">
                        {item.id}
                    </div>
                    <div className="flex items-center h-full flex-shrink min-w-[5rem] flex-grow custom-s-200:hidden overflow-y-scroll scrollbar-hide">
                        {item.createdAt}
                    </div>
                    <div className="flex items-center ml-[1.75rem] h-full custom-lg:hidden flex-shrink flex-grow min-w-[5rem] custom-xs:hidden">
                        {item.role}
                    </div>
                    <div className="flex items-center ml-[1.75rem] h-full custom-xl2:hidden custom-md:hidden flex-grow flex-shrink min-w-[5rem]">
                        {item._count.comments}
                    </div>
                    <div className="flex h-full items-center gap-x-1">
                        <button onClick={()=>{
                            setUsers((prev:any)=>{
                                return [...prev.map((items:any)=>items.email === item.email ? {...items,isBanned:!item.isBanned} : {...items})];
                            });
                            handleUpdateUserInfo(item,'isBanned',!item.isBanned);
                        }} className={`${item.isBanned ? 'bg-red-button' : 'bg-green-400'} p-1 rounded-md min-w-[1.75rem]`}>
                            <i className="fa-solid fa-ban"></i>
                        </button>
                        <button onClick={()=>{
                            if(item.warn + 1 === 3){
                                return toast.info(`The user has already gotten 2 warns,read the rules what you'd better to do`,{autoClose:false});
                            }
                            setUsers((prev:any)=>{
                                return [...prev.map((items:any)=>items.email === item.email ? {...items,warn:Number(item.warn) + 1} : {...items})];
                            });
                            handleUpdateUserInfo(item,'warn',Number(item.warn) + 1);
                        }} className={` ${item.warn === 0 ? 'bg-green-400' : item.warn === 1 ? 'bg-[#ece13e]' : 'bg-red-button'} p-1 rounded-md min-w-[1.75rem]`}>
                            <i className="fa-solid fa-exclamation"></i>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
};
export default AdminUsers;