
import '@/app/(main)/catalog/item/[seriesName]/page.css'
import axios from '@/api/axios';
import defaultAxios from "axios";
import { getSeriesData, getSeriesRate, getShikimoriRating, getUserRate } from '@/components/catalog/item/item.logic';
import Rating from '@/components/catalog/item/rating';
import UserList from '@/components/catalog/item/userList';
import Comments from '@/components/comments/comments';
import MediaPlayerSection from '@/components/player/MediaPlayerSection/MediaPlayerSection';
import { cookies } from 'next/headers';
import Poster from '@/Images/Posters';
import { differenceInMilliseconds, intervalToDuration } from 'date-fns';
import { formatDate, formatToStandard } from '@/utils/formattDate';
import CountDown from '@/components/catalog/item/CountDown';
import Link from 'next/link';

const ItemPage = async({params}:{params:{seriesName:string}})=>{
    const atToken = cookies().get('accessToken')?.value;
    const seriesData = await getSeriesData(params.seriesName,atToken);
    const userRate = atToken ? await getUserRate(params.seriesName,atToken) : undefined;
    if(!seriesData){
        return(
            <div>
                SERIES DATA UNDEFINED!
            </div>
        )
    }
    const shikimoriRating = await getShikimoriRating(seriesData.data.Shikimori);
    const initializeRemainingTime = seriesData.data.NextEpisodeTime && new Date(seriesData.data.NextEpisodeTime).getTime() - new Date().getTime();
    const timeLeft = seriesData.data.NextEpisodeTime ? initializeRemainingTime > 0 ? intervalToDuration({ start: 0, end: initializeRemainingTime}) : null : null;
    let initializeTimeLeft = timeLeft;
    console.log(`SHIKIMORI: `,shikimoriRating?.data);
    
    return(
        <div className="flex flex-col items-center justify-center w-full h-full bg-[#242424]">
            <div className='w-[68rem] max-w-full flex flex-col items-center  h-full shadow-[0px_-3px_12px_black]'>
                <div className='flex relative p-5 w-[68rem] max-w-[96%] mt-[3rem] h-auto bg-gray-300 text-rose-50 rounded-lg flex-wrap'>
                    <div className='flex flex-col shadow-image rounded-br-md rounded-t-lg rounded-bl-md relative mr-5 custom-image:mr-0 w-[15.62rem] max-h-[24rem] custom-image:h-auto'>
                        <Poster conteainerClass='flex max-h-[21.87rem] w-full rounded-t-lg object-cover' src={`${process.env.NEXT_PUBLIC_API}/media/${params.seriesName}/images`} alt={seriesData.data.SeriesName}/>
                        <UserList seriesName={params.seriesName} seriesViewName={seriesData.data.SeriesViewName} userList={seriesData.userListItem}/>
                    </div>
                    <div className='flex flex-col'>
                        <h1 className='text-3xl custom-xs:mt-0 break-words flex flex-wrap'>{seriesData?.data.SeriesViewName}</h1>
                        <div className='flex items-center text-white'>
                            <i className='fa-regular fa-eye text-[0.85rem] mr-1'></i>
                            <p>{seriesData.Views} views</p>
                            <i className='fa-solid fa-star text-[0.85rem] ml-2 mr-1'></i>
                            <p>{seriesData.count}</p>
                        </div>
                        <div className='flex my-1'>
                            {seriesData.data.AlternitiveNames?.map((item:string,index:number)=>(
                                <div key={index} className='flex rounded-lg min-h-[1.75rem] font-light py-[2px] px-2 bg-gray-100 items-center justify-center'>
                                    {item}
                                </div>
                            ))}
                        </div>
                        <div className='flex items-center border-y-[1px] border-gray-400'>
                            <Rating seriesName={params.seriesName} initialRate={seriesData?.seriesRate ? seriesData.seriesRate : 0} initialUserRate={userRate}/>
                            {shikimoriRating?.data && (
                                <a href={`https://shikimori.one/${shikimoriRating.data[0].url}`} className='flex items-center justify-center font-medium min-w-[4rem] bg-white text-black h-[76%] rounded-md p-1'>
                                    <img src={`${process.env.NEXT_PUBLIC_API}/media/shikimori-svg.svg/icons`} className='w-[1rem] h-[1rem] mr-1' alt="" />
                                    {shikimoriRating.data && shikimoriRating.data[0].score}
                                </a>

                            )}
                        </div>
                        <ul className='flex flex-col mt-3'>
                            <li>
                                <div className='w-[6rem]'>Status:</div>
                                <div className='ml-5'>{seriesData.data.Status}</div></li>
                            <li>
                                <div className='w-[6rem]'>Type:</div> 
                                <div className='ml-5'>{seriesData.data.Type}</div></li>
                            <li>
                                <div className='w-[6rem]'>Release:</div> 
                                <div className='ml-5'>{seriesData.data.ReleaseYear}</div></li>
                            <li>
                                <div className='w-[6rem]'>Genre:</div> 
                                <div className='flex gap-1 ml-5 flex-wrap'>{seriesData.data.Genre.map((item:string,index:number)=>(
                                    <Link href={`/catalog?page=1&category=${item}`} key={index} className='flex border-2 border-gray-500 hover:border-rose-50 cursor-pointer rounded-md break-words font-medium text-[0.85rem] py-[2px] px-[4px] items-center justify-center'>
                                        {item}
                                    </Link>
                                    ))}
                                </div>
                            </li>
                            <li>
                                <div className='w-[6rem]'>Studio:</div> 
                                <div className='ml-5'>{seriesData.data.Studio.join(', ')}</div>
                            </li>
                            <li>
                                <div className='w-[6rem]'>Episodes:</div> 
                                <div className='flex ml-5'>
                                    {seriesData.data.Status === 'ongoing' && (
                                        <p>{seriesData.data.CurrentEpisode} of</p>
                                    )}
                                    <p className='ml-1 mr-2'>{seriesData.data.AmountOfEpisode}</p>
                                </div>
                            </li>
                            {seriesData.data.Status === 'ongoing' && seriesData.data.NextEpisodeTime !== null && (
                                <li>
                                    <div className='w-[7rem]'>Next episode:</div>
                                    <div className='flex'>
                                        <p className='mr-2'>{formatDate(seriesData.data.NextEpisodeTime)}</p>
                                        <span> | </span>
                                        <p className='text-white mx-2'>Time Left:</p>
                                        <CountDown remainingTime={seriesData.data.NextEpisodeTime} initializeTimeLeft={initializeTimeLeft}/>
                                    </div>
                                </li>
                            )}
                            <li>
                                <div className='w-[6rem]'>Voice:</div>
                                {seriesData.data.VoiceActing && (
                                    <div className='ml-5 flex gap-1 flex-wrap'>{seriesData.data.VoiceActing.map((item:string,index:number)=>(
                                        <div key={index} className='flex bg-[#4eb997] hover:bg-[#43a083] rounded-md font-medium text-[0.85rem] py-[2px] px-[4px] items-center justify-center'>
                                            {item}
                                        </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        </ul>
                    </div>
                    <div className='flex relative break-words w-[43.75rem] ml-auto mr-auto h-auto mt-7'>
                        <p className='flex items-center'>{seriesData.data.Description}</p>
                    </div>
                </div>
                    <MediaPlayerSection AmountOfEpisode={seriesData.data.AmountOfEpisode} seriesName={params.seriesName} seriesViewName={seriesData.data.SeriesViewName}/>
                <div className='bg-[#242424] h-[100px]'>

                </div>
                <div className='w-[68rem] max-w-[96%]'>
                    <div className="relative flex bg-[#3C3C3C] overflow-hidden w-[100%] h-[40px] rounded-t-lg text-rose-50">
                        <div className='bg-[#222222] flex relative w-[100px] p-2 rounded-br-lg h-full'>Comments</div>
                    </div>
                    <Comments seriesName={params.seriesName}/>
                </div>
            </div>
        </div>
    )
}

export default ItemPage;