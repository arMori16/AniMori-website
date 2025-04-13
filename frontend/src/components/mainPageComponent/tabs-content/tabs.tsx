
import { getUserRates } from '@/components/catalog/item/item.logic';
import Rating from '@/components/catalog/item/rating';
import '@/components/mainPageComponent/tabs-content/tabs.css';
import Poster from '@/Images/Posters';
import { cookies } from 'next/headers';
import Link from 'next/link';


const TabsComponent = async({seriesData}:{seriesData:any[]})=>{
    const atToken = cookies().get('accessToken')?.value;
    const seriesNames = seriesData.map((item:any)=>(item.SeriesName));
    const userRates = await getUserRates(atToken,seriesNames);
    return(
        <div className='flex relative flex-wrap max-w-[70.25rem] h-auto'>
            <div className="flex flex-col relative border-b-[#FFD04B] text-[1.25rem] font-medium border-b-[3px] bg-gray-1B rounded-t-lg min-w-[3rem] w-full text-rose-50 p-2 pl-4">
                What&apos;s new on the site
            </div>
            <div className='flex relative flex-wrap w-[100%] gap-x-5'>
                {seriesData.map((item,index)=>{
                const userRate = userRates?.find((items:any) => items.SeriesName === item.SeriesName);
                return(
                    <div key={index} className={`flex mb-3 relative custom-s:h-[13.75rem] flex-grow h-[16.25rem] w-[30rem] custom-xl2:w-[100%]`}>
                        <div className={`flex bg-[#3C3C3C] ${index >= 2 ? 'rounded-md':'rounded-b-md'} overflow-hidden relative max-w-full w-full h-full`}>
                            <div className='flex relative w-[11.5rem] custom-s:w-[9.4rem] max-w-[11.5rem] shrink-0'>
                                <Poster src={`${process.env.NEXT_PUBLIC_API}/media/${item.SeriesName}/images`} alt='image' conteainerClass='w-full h-full object-cover'/>
                            </div>
                            <div className='block overflow-auto max-w-full w-[18.5rem] custom-xl2:w-[100%] relative text-rose-50 p-[10px] pb-0 h-full'>
                                <Link href={`${process.env.NEXT_PUBLIC_FRONT_API}/catalog/item/${seriesNames[index]}`} className='inline-block duration-500 transition-colors ease-in-out hover:text-green-400 uppercase absolute ml-[10px] left-0 right-0 text-[14px] max-w-full font-semibold truncated-text'>{item.SeriesViewName}</Link>
                                <p className='flex flex-wrap relative mt-5'>Genre: {item?.Genre.join(', ')}</p>
                                <Rating seriesName={seriesNames[index]} initialRate={item.Rate ? item?.Rate : 0} initialUserRate={userRate ? userRate.Value : null}/>
                            </div>
                        </div>

                    </div>
                )
                })}
            </div>
        </div>
    )
}
export default TabsComponent;