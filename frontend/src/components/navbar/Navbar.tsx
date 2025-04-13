'use client'
import AuthWindow from '../auth-window/auth-window';
import "@/components/navbar/Navbar.css"
import "@/components/auth-window/auth-window.css"
import Avatar from '../navbar-components/avatar/avatar';
import NavbarLogin from './navbar-login';
import SearchBar from '../navbar-components/search-bar/search-bar';
import Link from 'next/link';
import axios from '../../api/axios';
import { Home } from 'lucide-react';
import { useState, useEffect } from 'react';
import showProfileZustand from '../useZustand/profile/zustandProfile';
import { useTranslation } from 'react-i18next';


const Navbar = ({user,userFirstName}:{user:any,userFirstName?:any | null}) => {
    const [isFixed, setIsFixed] = useState(false);
    const { t, i18n } = useTranslation();
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 274) { // Фиксировать при прокрутке на 50px
                setIsFixed(true);
            } else {
                setIsFixed(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    return (
        <nav className='flex relative flex-col items-center bg-gray-300'>
            <div className='flex fixed top-0 left-0 w-full h-[80%] bg-[url("http://localhost:3001/media/main3.jpeg/images")] bg-cover z-[-1]' style={{ backgroundPosition: "center -14rem",aspectRatio: "12/4" }}>
            </div>
            <div className={`custom-md-lg:flex hidden fixed top-[94%] w-full h-[3rem] bg-[rgb(34,34,34)] border-t-2 bg-opacity-90 border-green-400 z-50`}>
                <div className={`flex h-full w-full justify-around`}>
                    <div className={`flex h-full w-[32%] text-[0.8rem] font-medium text-white`}>
                        <Link href={`/`} className={`flex flex-col h-full w-full relative justify-center items-center rounded-md duration-500 ease-in-out hover:bg-green-400`}>
                            <i className={`fa fa-home mr-1 group-hover:text-green-400`} aria-hidden="true"></i>
                            <p className={`block`}>{t('home')}</p>
                        </Link>
                    </div>
                    <div className='flex h-full w-[32%] text-[0.8rem] font-medium text-white relative'>
                        <Link href={`/catalog`} className={`flex flex-col h-full w-full rounded-md justify-center items-center duration-500 ease-in-out hover:bg-green-400`}>
                            <i className={`fa-solid fa-newspaper pt-[2px] mr-1`} aria-hidden="true"></i>
                            <p className={`block`}>Catalog</p>
                        </Link>
                        <div className='flex absolute top-full z-50 flex-col px-2 bg-gray-300 text-white h-[5rem]'>
                            <Link href={'/catalog/top'} className='flex items-center justify-center w-full h-[1.5rem]'>
                                <i className='fa-solid fa-chart-simple text-[0.75rem]'></i>
                                <p>TOP-100</p>
                            </Link>
                        </div>
                    </div>
                    {user === 'registered' ? (
                        <div className='flex relative w-[32%] h-full items-center font-medium text-white '>
                            <Avatar user={userFirstName}/>
                        </div>
                    ):(
                        <div className='flex h-full w-[32%] justify-center items-center font-medium text-white'>
                            <NavbarLogin navbar={false}/>
                        </div>
                    )}
                </div>
            </div>
            <div className={`flex ${isFixed ? 'custom-md-lg:hidden fixed top-0 w-full h-[3rem] bg-[rgb(34,34,34)] border-b-2 bg-opacity-90 border-green-400' : 'absolute bottom-[-2rem] w-[80%] h-[3.50rem] rounded-lg bg-gray-300 shadow-[0px_3px_10px_black]'} custom-xs:justify-between gap-x-2 z-20`}>
                <div className={`flex ml-5 custom-image:ml-3 relative h-full items-center`}>
                    <div className='flex relative justify-items-center items-center h-full'>
                        <div className='flex relative w-[2.50rem] h-[2.50rem]'>
                            <Link href="/"> <img src={`/icons/leafsvg.svg`}/> </Link>
                        </div>
                        <div className='flex relative items-center text-[1.75rem] custom-image:text-[1.35rem] font-inknut ml-3 custom-image:ml-2 font-bold'>
                            <Link href='/' className='text-rose-50'>AniMori</Link>
                        </div>
                    </div>
                </div>
                <div className={`flex w-[80%] relative ml-auto items-center justify-center custom-md-lg:hidden`}>
                    <SearchBar isAdmin={false} model='catalog'/>
                </div>
                <div className={`flex h-full ${isFixed ? 'mr-2' : 'mr-[2rem] ml-auto gap-x-4'} custom-s-200:hidden`}>
                    <div className={`flex h-full mx-2 gap-x-4 items-center text-[1rem] font-medium text-white custom-md:hidden`}>
                        <Link href={`/`} className={`flex relative group items-center duration-300 ease-in-out ${!isFixed && 'hover:text-green-400 uppercase'}`}>
                            <i className={`fa fa-home text-[0.85rem] mr-1 ${isFixed && 'group-hover:text-green-400'}`} aria-hidden="true"></i>
                            {isFixed && (
                                <span className="absolute after:content-[''] right-[-0.85rem] text-[0.85rem] after:absolute after:bottom-full after:border-b-[0.4rem] after:border-r-[0.5rem] after:border-b-black after:border-l-[0.5rem] after:left-[38%] after:border-x-transparent after:right-[38%] whitespace-nowrap pointer-events-none translate-y-0 rounded-md py-1 px-2 top-[100%] opacity-0 bg-black group-hover:opacity-100 transition-all delay-150 duration-500 z-30 group-hover:translate-y-[6px]  ease-out">
                                    Home
                                </span>
                            )}
                            <p className={`${isFixed && 'hidden'}`}>Home</p>
                        </Link>
                    </div>
                    <div className='flex h-full mx-2 gap-x-4 items-center relative group text-[1rem] font-medium text-white'>
                        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out w-[7rem] rounded-b-sm opacity-100 absolute right-[-0.5rem] top-full z-50 bg-gray-2E text-white">
                            <div className="overflow-hidden flex flex-col">
                                <Link href={'/catalog/top'} className="flex border-b border-gray-500 hover:text-green-400 items-center whitespace-nowrap justify-center w-full h-[2rem]">
                                    <i className="fa-solid fa-chart-simple text-[0.85rem] mr-1"></i>
                                    <p>TOP-100</p>
                                </Link>
                            </div>
                        </div>

                        <Link href={`/catalog`} className={`flex group items-center relative duration-300 ease-in-out ${!isFixed && 'hover:text-green-400 uppercase'}`}>
                            <i className={`fa-solid ${isFixed && 'group-hover:text-green-400'} fa-newspaper pt-[2px] text-[0.85rem] mr-1`} aria-hidden="true"></i>
                            <p className={`${isFixed && 'hidden'}`}>Catalog</p>
                            {isFixed && (
                                <span className="absolute custom-md-lg:hidden after:content-[''] right-[-1.15rem] text-[0.85rem] after:absolute after:bottom-full after:border-b-[0.4rem] after:border-r-[0.5rem] after:border-b-black after:border-l-[0.5rem] after:left-[38%] after:border-x-transparent after:right-[38%] whitespace-nowrap pointer-events-none translate-y-0 rounded-md p-1 top-[100%] opacity-0 bg-black group-hover:opacity-100 transition-all delay-150 duration-500 z-30 group-hover:translate-y-[6px]  ease-out">
                                    Catalog
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
                <div className='flex items-center'>
                    {user === 'registered' ? 
                    <div className={`flex relative mr-7 custom-md-lg:hidden`}>
                        {isFixed ? (
                            <div className='flex h-full items-center text-[1rem] font-medium text-white uppercase'>
                                <Link href={`/users/${userFirstName.id}`} className='flex items-center hover:text-green-400 duration-300 ease-in-out'><i className="fa-solid fa-user pt-[2px] text-[0.85rem] mr-1" aria-hidden="true"></i><p className={`${isFixed && 'hidden'}`}>Catalog</p></Link>
                            </div>
                        ):(
                            <Avatar user={userFirstName}/>
                        )}
                    </div>:<NavbarLogin navbar={true}/>
                    }
                </div>
            </div>
        </nav>
    );
};


export default Navbar;