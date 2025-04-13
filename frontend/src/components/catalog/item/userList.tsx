'use client'

import { useState } from "react"
import { deleteUserListItem, list, updateUserList } from "./item.logic"
import Cookies from "js-cookie"
import { toast } from "react-toastify"


const UserList = ({seriesName,seriesViewName,userList}:{seriesName: string,seriesViewName: string,userList?: any})=>{
    const [currentUserList,setCurrentUserList] = useState(userList?.Status);
    const handleSubmitUserList = async(item:any)=>{
        const atToken = Cookies.get('accessToken');
        const rtToken = Cookies.get('refreshToken');
        if(!atToken && !rtToken){
            return toast.info('Make sure you are registered!')
        }
        await updateUserList(seriesName,item.key.split(" ").join(""),seriesViewName);
        setCurrentUserList(item.key.split(" ").join(""))
    }
    const handleDeleteUserListItem = async()=>{
        await deleteUserListItem(seriesName);
        setCurrentUserList(null);
    }
    return(
        <div className='flex w-full h-[2rem] rounded-bl-md rounded-br-md gap-x-[2px] bg-gray-300 border-b-[1px] py-[1px] border-transparent'>
            {list.map((item:any,index:number)=>(
                <div key={index} className={`flex group relative w-[3.15rem] h-full items-center justify-center`}>
                    <button onClick={()=>currentUserList === item.key.split(" ").join("")? handleDeleteUserListItem() : handleSubmitUserList(item)} className={`flex ${index === 0?'rounded-bl-md':''} ${index === 4?'rounded-br-md':''} relative w-full hover:bg-gray-100 duration-300 h-full items-center justify-center bg-[#292929]`}
                        style={{ backgroundColor: currentUserList === item.key.split(" ").join("") ? item.color : '' }}
                        >
                        <i className={`fa fa-${item.value} ${item.key === 'Dropped'?'mr-1':''} w-[1rem] h-[1rem]`}></i>
                    </button>
                    <span className="absolute after:content-['']  after:absolute after:top-full after:border-t-[0.4rem] after:border-r-[0.5rem] after:border-t-black after:border-l-[0.5rem] after:left-[42%] after:border-x-transparent after:right-[44%] whitespace-nowrap pointer-events-none rounded-md py-1 px-2 bottom-[100%] mb-3 opacity-0 bg-black group-hover:opacity-100 transition-all delay-150 duration-500 z-10 translate-y-[6px] group-hover:translate-y-0  ease-out">
                        {item.key}
                    </span>
                </div>
            ))}
        </div>
    )
}
export default UserList;