'use client'

import Link from "next/link";
import { useState } from "react"

export default function CategoryDropDown({categories}:{categories:any[]}){
    const [isOpen,setIsOpened] = useState(false);
    return(
        <div className="hidden flex-col group custom-s-200:flex custom-1024:flex w-full px-5 mb-3">
            <div className="flex justify-center w-full h-[2rem] bg-gray-2E">
                <button onClick={()=>setIsOpened(!isOpen)} className="flex rounded-t-sm justify-center items-center w-full h-full text-white font-medium text-[1.15rem]">
                    Categories
                </button>
            </div>
            <ul className={`grid grid-cols-3 custom-768:grid-cols-2 custom-s-200:grid-cols-2 w-full text-white flex-wrap border-t border-gray-300 
                transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
                {categories.map((item:any,index:number)=>(
                    <li key={index} className="flex min-w-[6rem] border-[1px] border-gray-300 pl-2 pt-2 p-1">
                        <Link href={`/catalog/category/${item.genre}`} className="inline-flex w-fit hover:text-green-400 transition-all hover:scale-105 duration-500">{item.genre}</Link>
                    </li>
                ))}
            </ul>
        
        
        </div>
    )
}