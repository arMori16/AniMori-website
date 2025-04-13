'use server'
import Announcements from '@/components/mainPageComponent/announcement/AnnouncementComponent';
import CarouselWrapper from '@/components/mainPageComponent/carouselWrapper/carouselWrapper';
import TabsComponent from '@/components/mainPageComponent/tabs-content/tabs';
import SearchBar from '@/components/navbar-components/search-bar/search-bar';
import getSeriesInfo, { getPageCount, getSeasonedCatalog } from '@/utils/getSeriesInfo';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function Home({searchParams}:{searchParams:{page:number}}) {
  
  const seriesInfo = await getSeriesInfo({page:searchParams.page - 1,skipPage:16,take:16});
  const counts = await getPageCount({divideNumber:16}) || 1;
  const data = await getSeasonedCatalog();
  if(searchParams.page > counts){
    notFound()
  }
  return (
      <div className='max-w-full relative min-h-[100vh] h-auto bg-[#242424] shadow-[0px_-5px_10px_black]'>
        <div className='flex relative flex-col items-center mx-2'>
          <div className={`custom-md-lg:flex mt-[3rem] hidden w-full relative ml-auto items-center justify-center`}>
              <SearchBar isAdmin={false} model='catalog'/>
          </div>
          <div className='block w-full flex-grow max-w-[1300px]'>
            <CarouselWrapper seasonedAnime={data.data}/>
          </div>
          <div className='flex relative my-4 w-full max-w-[70.25rem]'>
            <Announcements />
          </div>
          <div className='flex relative flex-wrap'>
             <TabsComponent seriesData={seriesInfo}/>
          </div>
          <div className='flex mb-[10rem] max-w-[70.25rem] h-[2.5rem] p-1 gap-x-2 font-medium text-white'>
            {Array.from({length:counts <= 7?counts:7},(value,index)=>(
              <Link key={index} href={`http://localhost:3000/?page=${index + 1}`} className='flex bg-gray-300 h-full w-[2rem] items-center justify-center rounded-md'>
                <p>{index + 1}</p>
              </Link>
            ))}
            <p>...</p>
            <Link href={`http://localhost:3000/?page=${counts}`} className='flex bg-gray-300 h-full w-[2rem] items-center justify-center rounded-md'>{counts}</Link>
          </div>
        </div>
      </div>
  );
}
