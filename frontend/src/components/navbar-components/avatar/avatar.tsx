"use client"
import React, { useState,useEffect,useRef } from 'react';
import '../avatar/avatar.css'
import axios from '../../../api/axios';
import { useDispatch } from 'react-redux';
import { logout } from '@/components/redux/userSlice';
import Cookies from 'js-cookie';
import Link from 'next/link';
import showProfileZustand from '@/components/useZustand/profile/zustandProfile';

const Avatar = ({user}:{user:any})=> {
    const divRef = useRef<HTMLDivElement>(null);
    const {getIsShowProfile,showProfile,updateIsShowProfile} = showProfileZustand();
    const handleClickOutside = (event:MouseEvent)=>{
        if(divRef.current && !divRef.current.contains(event.target as Node)){
            document.removeEventListener('mousedown',handleClickOutside)
            updateIsShowProfile(false);
        };
    }
    const handleAvatarClick = (e:React.MouseEvent<HTMLButtonElement>)=>{
        e.stopPropagation();
        updateIsShowProfile(true);
        document.addEventListener('mousedown',handleClickOutside)
    }
    const handleLogout = async()=>{
        const atToken = await Cookies.get('accessToken');
        try{
            await axios.post('/logout',{},{
                headers:{
                    'Authorization':`Bearer ${atToken}`
                }
            });
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            updateIsShowProfile(false);
            Cookies.remove('state');
            window.location.href = '/'
        }catch(err){
            console.log(err);
            
        }
    }
    return (
        <div className="flex relative w-[3rem] custom-md-lg:w-full custom-md-lg:h-full h-auto custom-md-lg:justify-center">
            <button onClick={handleAvatarClick} className='w-[3rem] h-[3rem] custom-md-lg:text-[0.85rem] custom-md-lg:duration-300 custom-md-lg:transition-colors custom-md-lg:ease-in-out custom-md-lg:hover:bg-green-400 custom-md-lg:rounded-md custom-md-lg:w-full custom-md-lg:h-full custom-md-lg:border-none overflow-hidden border-green-400 border-[1px] rounded-[50%] z-[1000]'>
                <img className='rounded-[50%] custom-md-lg:hidden h-full object-cover' src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${user.id}`}/>
                <div className='hidden flex-col custom-md-lg:flex'>
                    <i className='fa-solid fa-user'></i>
                    <p>Profile</p>
                </div>
            </button>
            {showProfile===true && (
                    <div className='absolute top-[3.5rem] custom-md-lg:top-[-7.25rem] right-0 flex z-30 flex-col px-4 py-1 gap-y-1 text-white w-[16rem] shadow-[0px_1px_8px_black] rounded-lg bg-gray-400' ref={divRef}>
                        <Link prefetch={true} href={`/users/${user?.id}`} onClick={()=>{document.removeEventListener('mousedown',handleClickOutside);updateIsShowProfile(false)}} className='flex w-full h-[3rem] mt-1  hover:text-green-400 duration-500 ease-in-out items-center'>
                            <div className='w-[2.5rem] h-[2.5rem] '>
                                <img src={`${process.env.NEXT_PUBLIC_API}/user/avatar/${user.id}`} className='w-full object-cover h-full rounded-[50%]' alt="" />
                            </div>
                            <div className='flex h-full ml-2 font-medium items-center'>
                                <span>{user?.firstName}</span>
                            </div>
                        </Link>
                        <button onClick={handleLogout} className='flex w-full h-[2rem] mb-3 items-center '>
                            <div className='flex h-[1rem] w-[1rem] ml-3'>
                                <img src="http://localhost:3001/media/logout.svg/icons" className='w-full h-full'/>
                            </div>
                            <span className='view-profile-text-2'>
                                Log Out
                            </span>
                        </button>
                    </div>
                )}
        </div>
    );

}

export default Avatar;