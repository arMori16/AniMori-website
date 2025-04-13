"use client"
import "@/app/globals.css"
import axios from "@/api/axios";
import ClientRefreshToken from "@/api/clientRefreshToken";
import Avatar from "@/components/navbar-components/avatar/avatar";
import '@fortawesome/fontawesome-free/css/all.css';
import Cookies from "js-cookie";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ToastContainer } from "react-toastify";

export default function RootLayout({children}:{children: React.ReactNode}){
  const pathName = usePathname();
  const [userData,setUserData] = useState<any>();
  console.log(`PathName: `,pathName);
  useEffect(()=>{
    const fetchData = async()=>{
      const userFirstname =  await axios.get('/user/firstname',{
        headers:{
            'Authorization':`Bearer ${Cookies.get('accessToken')}`
        }
      })
      setUserData(userFirstname);
    }
    fetchData();
  },[])
  const items = [
    {section:'Dashboard',icon:'folder'},
    {section:'Users',icon:'users'},
    {section:'Series',icon:'youtube'},
    {section:'Comments',icon:'comment'},
    {section:'Carousel',icon:'images'},
    {section:'Schedule',icon:'calendar-days'}
  ]
  const isActive = (url:string) => url === pathName;
  return (
    <html lang="en">
      <body className="w-full min-h-screen bg-[#242424]">
      <ToastContainer position="bottom-right"/>
      <ClientRefreshToken/>
        <div className="flex w-full h-full bg-[#242424]">
          <div className="custom-md-lg:flex hidden fixed w-full z-50 bottom-0 h-[3.5rem] bg-gray-2E text-white justify-evenly p-1">
                  {Array.from({length:items.length},(_,index)=>(
                        <Link key={index} href={`${items[index].section === 'Dashboard'? `${process.env.NEXT_PUBLIC_FRONT_API}/admin`:`${process.env.NEXT_PUBLIC_FRONT_API}/admin/${items[index].section.toLowerCase()}`}`} className={`flex flex-col justify-center items-center ${isActive(items[index].section === 'Dashboard' ? '/admin' : `/admin/${items[index].section.toLowerCase()}`) 
                          ? 'bg-[#373737]' 
                          : ''}
                      rounded-xl hover:bg-[#373737] duration-500 p-2 transition ease-in-out w-full`}>
                          <i className={`${items[index].icon === 'youtube' ? 'fa-brands' : 'fa-solid'} fa-${items[index].icon} text-[0.75rem]`}></i>
                          <p className="custom-xs:text-[0.75rem] custom-s:hidden">{items[index].section}</p>
                        </Link>
                    ))}
                </div>
              <div className="flex custom-md-lg:hidden flex-col break-words sticky top-0 bottom-0 flex-shrink-0 min-h-screen h-full bg-[#2C2C2C] font-medium text-[1.25rem] text-rose-50 p-5 bg-opacity-50 custom-md-lg:w-[10rem] w-[18rem]">
                  <div className="flex font-bold ml-5 mb-3 text-[1.50rem] custom-md-lg:text-[1rem]">
                      Admin
                  </div>
                  {Array.from({length:items.length},(_,index)=>(
                      <Link key={index} href={`${items[index].section === 'Dashboard'? `${process.env.NEXT_PUBLIC_FRONT_API}/admin`:`${process.env.NEXT_PUBLIC_FRONT_API}/admin/${items[index].section.toLowerCase()}`}`} className={`flex mt-2 items-center ${isActive(items[index].section === 'Dashboard' ? '/admin' : `/admin/${items[index].section.toLowerCase()}`) 
                        ? 'bg-[#373737]' 
                        : ''}
                    rounded-xl pl-8 hover:bg-[#373737] duration-500 transition ease-in-out custom-md-lg:text-[0.8rem] max-w-full w-full h-[4rem]`}>
                        <i className={`${items[index].icon === 'youtube' ? 'fa-brands' : 'fa-solid'} fa-${items[index].icon} text-[0.95rem] mr-2`}></i>
                        {items[index].section}
                      </Link>
                  ))}
              </div>
  
            <div className="flex flex-col h-full w-full pt-7 relative">
              <div className="flex flex-col w-full items-end pr-[2rem]">
               
                <span className="flex text-[#D98C8C] font-semibold text-[1.25rem]">Admin</span>
              </div>
              <div className="p-5 pb-[4rem] h-full">
                {children}
              </div>
            </div>
        </div>
      </body>
    </html>
  )
}
