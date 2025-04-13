'use server'
import Episodes from "../amountOfEpisode/amountOfEpisodeLogic"
import Player from "../player"
import { getVoicesInfo } from "../player.logic"

import Voices from "../voices/voices"



const MediaPlayerSection = async({seriesViewName,AmountOfEpisode,seriesName}:{seriesViewName:string,AmountOfEpisode:number,seriesName:string})=>{
    const initializeVoiceInfo = await getVoicesInfo(seriesName);
    console.log(`INITIALIZE VOICE INFO: `,initializeVoiceInfo);
    
    if(initializeVoiceInfo.length <= 0){
        return (
            <div className='w-[68rem] max-w-[96%] bg-gray-300 h-auto mt-5 p-5 relative flex flex-col rounded-xl'>
                <div className="flex rounded-md w-full h-[2.5rem] items-center pl-5 text-white font-semibold bg-[#28c46e]">
                    <p>There is no video :(</p>
                </div>
            </div>
        )
    }
    return(
        <div className='w-[68rem] max-w-[96%] bg-gray-300 h-auto mt-5 p-5 relative flex flex-col rounded-xl'>
            <Voices seriesName={seriesName} initializeVoiceInfo={initializeVoiceInfo}/>
            <Episodes seriesName={seriesName}/>
            <Player seriesName={seriesName} seriesViewName={seriesViewName}/>
        </div>
    )
}
export default MediaPlayerSection;