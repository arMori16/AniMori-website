'use client'

import { useEffect, useRef, useState } from "react";
import { getVoicesInfo } from "../player.logic";
import voiceStorage from "@/components/useZustand/player/zustandVoice";
import useOutsideCommon from "@/hooks/useOutsideCommon";

const Voices = ({seriesName,initializeVoiceInfo}:{seriesName:string,initializeVoiceInfo:any[]})=>{
    const [voiceInfo,setVoiceInfo] = useState(initializeVoiceInfo)
    const [isShow,setIsShow] = useState<boolean>(false);
    const {getVoice,setVoice,getEpisodes,setEpisodes} = voiceStorage();
    const divRef = useRef<HTMLDivElement>(null); 
    const mainRef = useRef<HTMLDivElement>(null); 
    useOutsideCommon({refs:[mainRef],onOutsideClick:()=>setIsShow(false)})
    useEffect(()=>{
      if (voiceInfo.length > 0) {
          const foundVoice = voiceInfo.find((item) => item.episodes > 0);
          setVoice(foundVoice ? foundVoice.voice : voiceInfo[0].voice);
          setEpisodes(foundVoice ? foundVoice.episodes : voiceInfo[0].episodes);
      } else {
          setVoice(null);
          setEpisodes(null);
      }
    },[]);
    return(
        <div ref={mainRef} className={`flex flex-col ${!isShow ? 'rounded-custom-sm' : 'rounded-t-custom-sm'} box-border relative max-w-[15rem] bg-gray-100 border-gray-600 border-[1px] font-normal mb-2 text-white text-[0.9rem] px-2`}>
            <button onClick={() => setIsShow((prev)=>!prev)} className="flex h-[1.75rem] relative box-border w-full items-center justify-between">
                <div className="flex h-full items-center flex-grow justify-between">
                    Voice {getVoice() || getVoice() === null && 'loading...'}
                    <div className="flex p-1 mr-2 rounded-[0.25rem] font-extrabold bg-gray-300 text-[0.5rem] justify-center items-center w-[1.5rem] text-white">
                      {getEpisodes() && getEpisodes()}
                    </div>
                </div>
                <span className="flex w-[0.1rem] h-[60%] justify-center mr-2 bg-white py-[2px]"></span><img src={`http://localhost:3001/media/down-arrow/icons`} className={`flex w-[1.25rem] transform ${isShow ? 'rotate-[180deg]' : 'rotate-0'} h-[1.25rem] ${isShow ?'animate-downArrowRotateUp':'animate-downArrowRotateDown'}`} />
            </button>
            <div className={`grid grid-rows-[0fr] transition-all duration-150 ease-in ${isShow && 'grid-rows-[1fr] border-gray-600 border-[1px]'} max-w-[15rem] w-[15rem] left-[-0.7px] mr-0 box-border max-h-[12rem] absolute p-0 m-0 top-full px-2 bg-gray-100 border-t-0 rounded-b-custom-sm z-[102] overflow-y-scroll`} ref={divRef}>
                <div className="flex flex-col w-full gap-y-2 overflow-hidden">
                    {voiceInfo.map((item:any,index:number)=>
                        <button onClick={()=>{setVoice(item.voice);setEpisodes(item.episodes);setIsShow(false)}} key={index} className={`flex w-full ${getVoice() === item.voice?'text-gray-300':''} justify-between`}>
                            Voice {voiceInfo[index].voice}
                            <div className="flex p-1 rounded-[0.25rem] font-extrabold bg-gray-300 text-[0.5rem] justify-center items-center w-[1.5rem] text-white">
                              {item.episodes}
                            </div>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
export default Voices;