'use client'

import Cookies from "js-cookie"
import { useState } from "react";


export default function UserWarn({userWarn}:{userWarn:number}){
    const [closed,setCLosed] = useState(false);
    return (
        <div className={`flex bg-[#e93737] p-1 mt-1 text-white break-words w-fit rounded-[4px] items-center ${closed && 'hidden'}`}>
            <p>{userWarn === 1 ? 'You have received your first warn!Be carrefull!' : 'You have received your second and the last warn,the next move will be ban!'}</p>
            <button onClick={()=>{setCLosed(true);Cookies.set("warn",`${userWarn}`)}} className='mx-2 rounded-[50%] bg-white text-black w-[1.25rem] h-[1.25rem] items-center justify-center text-[0.7rem]'><i className="fa fa-xmark"></i></button>
        </div>                  
    )
}