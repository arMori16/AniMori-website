'use client'
import AdminUsers from "@/components/admin/usersComponent";
import axios from "@/api/axios";
import SearchBar from "@/components/navbar-components/search-bar/search-bar";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { formatDate } from "@/utils/formattDate";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";



const Users = ()=>{
    const [users,setUsers] = useState();
    const {usersPage,getUsersPage} = usePageCounter();
    useEffect(()=>{
        const fetchData = async()=>{
            const users = await axios.get('/user/users',{
                params:{
                    skip:getUsersPage()
                },
                headers:{
                    'Authorization':`Bearer ${Cookies.get("accessToken")}`
                }
            })
            const usersData = users.data.map((item:any)=> (
                {...item,createdAt:formatDate(item.createdAt)}
            ))
            console.log(`UsersData: `,usersData);
            
            setUsers(usersData);
        }
        fetchData();
    },[usersPage])
    
    return(
        <div className="flex flex-col w-full max-w-full h-full">
            <div className="flex items-end w-[85%] justify-center ml-auto mr-auto flex-shrink">
                <SearchBar isAdmin={true} model="user"/>
            </div>
            <div className="flex flex-col max-w-full h-full bg-purple-300 p-2 rounded-md mt-5 text-white">
                <div className="flex w-full h-[2.5rem] justify-between border-b-2 pr-[10%] text-[1.15rem] custom-md-2:text-[0.85rem] font-medium">
                    <div className="flex w-[8rem] flex-shrink justify-center h-full items-center">
                        Username
                    </div>
                    <div className="flex w-[8rem] flex-shrink justify-center h-full items-center">
                        Email
                    </div>
                    <div className="flex w-[7rem] flex-shrink justify-center h-full items-center">
                        Id
                    </div>
                    <div className="flex min-w-[7rem] justify-center custom-s-200:hidden h-full items-center">
                        CreatedAt
                    </div>
                    <div className="flex min-w-[6rem]  justify-center custom-lg:hidden h-full items-center">
                        Role
                    </div>
                    <div className="flex min-w-[4rem] custom-xl2:hidden justify-center h-full items-center">
                        Comments
                    </div>
                </div>
                {users && (
                    <AdminUsers initialUsers={users}/>
                )}
            </div>
        </div>
    )
}
export default Users;