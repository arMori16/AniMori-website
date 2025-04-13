'use server'
import axios from '@/api/axios';
import { list } from '@/components/catalog/item/item.logic';
import ProfileUserList from '@/components/navbar-components/profile/profile';
import UserAvatar from '@/components/navbar-components/profile/userAvatar';
import UserWarn from '@/components/navbar-components/profile/userWarn';
import { formatDate } from '@/utils/formattDate';
import Poster from '@/Images/Posters';
import { cookies } from 'next/headers';
import Link from 'next/link';
import React from 'react';
const fetchData = async (userId: number) => {
    const accessToken = cookies().get("accessToken")?.value;
  
    const profileRequest = await axios.get("/user/profile/info", {
        params:{
            userId:userId
        },
        headers: { Authorization: `Bearer ${accessToken}` },
    });
    return {
      profile: profileRequest.data.userInfo,
      lastViewed: profileRequest.data.userLastViewedSeries,
      owner: profileRequest.data.Owner
    };
  };
  
  const Page = async ({ params }: { params: { userId: number } }) => {
    const { profile, lastViewed, owner } = await fetchData(params.userId);
    const remasteredLastViewed = Array.from(new Map(lastViewed.userLastViewedSeries.map((item:any) => [item.SeriesName, item])).values());
    console.log(`USER:::`,lastViewed);
    
    
    profile.createdAt = formatDate(profile.createdAt);
    return(
        <div className='flex flex-col w-full min-h-screen bg-gray-200 pt-[3rem] items-center shadow-[0px_-2px_10px_black]'>
            <div className={`flex w-[90%] h-[2rem] shadow-[0px_5px_8px_black] rounded-t-lg bg-[url("http://localhost:3001/media/profile-bg/images")] relative bg-repeat-x bg-auto overflow-hidden`}>
                <span className='absolute top-0 left-[1rem] text-white font-semibold text-[1.25rem]'>Profile</span>
            </div>
            <div className='flex min-h-[28rem] w-[87%] rounded-b-md bg-gray-2E p-5 custom-xs:flex-wrap'>
                <UserAvatar initialUserAvatar={`${process.env.NEXT_PUBLIC_API}/user/avatar/${params.userId}`} owner={owner}/>
                <div className='flex flex-col max-w-full min-w-[6rem] custom-xs:ml-0 ml-2 '>
                    <div className='text-white text-[1rem] max-w-full mt-2  font-semibold flex flex-col'>
                        <div className='inline-flex w-fit px-1 bg-green-400 rounded-sm'>
                            <p>{profile.firstName}</p>
                        </div>
                        <span className='inline-flex px-[6px] bg-gray-100 w-fit max-w-[6rem] text-[0.8rem] rounded-md mt-1 whitespace-nowrap'>{profile.createdAt}</span>
                        {owner && profile.warn >= 1 && Number(cookies().get('warn')?.value) !== profile.warn && (
                            <UserWarn userWarn={profile.warn}/>
                        )}
                    </div>
                    {remasteredLastViewed.length !== 0 && (
                        <div className='flex flex-col max-w-full h-full mt-[1rem] custom-xs:ml-0 ml-[1rem] overflow-x-auto scrollbar-hide'>
                            <p className='text-[1.15rem] text-white font-semibold'>Last Viewed</p>
                            <div className='flex mt-2 ml-2 max-w-full h-full'>
                                {remasteredLastViewed.map((item:any,index:number)=>{
                                const itemRate = lastViewed.rates?.find((seriesName:any) => seriesName.SeriesName === item.SeriesName);
                                return(
                                    <a href={`${process.env.NEXT_PUBLIC_FRONT_API}/catalog/item/${item.SeriesName}`} key={index} className='flex mr-2 relative flex-col w-[10rem] transition-transform hover:scale-105 duration-500 ease-in-out overflow-hidden flex-shrink-0'>
                                        <Poster src={`${process.env.NEXT_PUBLIC_API}/media/${item?.SeriesName}/images`} conteainerClass='object-cover w-full h-[15rem] rounded-md' alt="" />
                                        <div className='flex text-ellipsis overflow-hidden text-center'>
                                            <p className='text-white font-medium line-clamp-2'>{item.SeriesViewName}</p>
                                            <span className='flex items-center justify-center absolute top-3 after:content-[""] after:absolute after:right-[-0.97rem] after:border-[#F5C543] after:border-t-[0.75rem] after:border-b-[0.75rem] after:border-r-[1rem] after:border-r-transparent text-[1rem] text-white font-medium bg-orange-yellow h-[1.5rem]'>
                                                <img src={`/icons/star.white.svg`} className="w-[1rem] h-[1rem] ml-1" alt="" />
                                                <p className='pl-1 pr-2'>{(itemRate ? Number(itemRate.avgValue) : 0).toFixed(2)}</p>
                                                {/* <span className='h-full border-t-[0.75rem] border-[#F5C543] absolute right-[-0.98rem] border-r-[1rem] border-b-[0.75rem] border-r-transparent bg-orange-yellow'></span> */}
                                            </span>
                                        </div>
                                    </a>
                                )})}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <ProfileUserList userId={params.userId} isOwner={owner}/>
        </div>
    )
}
export default Page;