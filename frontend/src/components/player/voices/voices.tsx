'use client'

import { useEffect, useRef, useState } from "react";
import { getVoicesInfo } from "../player.logic";
import voiceStorage from "@/components/useZustand/player/zustandVoice";
import useOutsideCommon from "@/hooks/useOutsideCommon";
import { VoicesType } from "../types/voices.type";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { sortVoices } from "@/components/catalog/item/item.logic";

const Voices = ({seriesName,initializeVoiceInfo}:{seriesName:string,initializeVoiceInfo:VoicesType | null})=>{
    const [isShow,setIsShow] = useState<boolean>(false);
    const {getVoice,setVoice,getEpisodes,setEpisodes} = voiceStorage();
    const divRef = useRef<HTMLDivElement>(null); 
    const mainRef = useRef<HTMLDivElement>(null); 
    const sortedVoices = initializeVoiceInfo && sortVoices(initializeVoiceInfo);
    useOutsideCommon({refs:[mainRef],onOutsideClick:()=>setIsShow(false)});
    useEffect(()=>{
      if (sortedVoices && sortedVoices.length > 0) {
          setVoice(sortedVoices[0].voice);
          setEpisodes(sortedVoices[0].episodes);
      } else {
          setVoice(null);
          setEpisodes(null);
      }
    },[]);
    return(
        <div ref={mainRef} className={`flex flex-col box-border relative w-[15rem] font-normal mb-2 text-white text-[0.9rem]`}>
            <button onClick={() => setIsShow((prev)=>!prev)} className={`flex ${isShow ? 'rounded-t-custom-sm border-b-transparent' : 'rounded-custom-sm'} px-2 bg-gray-100 border-gray-600 border-[1px] h-[1.75rem] relative box-border w-full items-center justify-between`}>
                <div className="flex h-full items-center flex-grow justify-between">
                    Voice {getVoice() ||  getVoice() === undefined && 'loading...'}
                    <div className="flex p-1 mr-2 rounded-[0.25rem] font-extrabold bg-gray-300 text-[0.5rem] justify-center items-center w-[1.5rem] text-white">
                      {getEpisodes() && getEpisodes()}
                    </div>
                </div>
                <span className="flex w-[0.1rem] h-[60%] justify-center mr-2 bg-white py-[2px]"></span>
                <FontAwesomeIcon icon={faAngleDown} className={`inline-flex w-[0.85rem]  fa fa-angle-down ${isShow ? 'rotate-[180deg]' : 'rotate-0'} transform origin-center transition-transform duration-200 h-[0.85rem]`} />
            </button>
            <div className={`flex ${isShow ? 'scale-y-100':'scale-y-0'} border-gray-600 -mt-[1px] border-[1px] w-[15rem] box-border max-h-[12rem] absolute p-0 m-0 top-full px-2 bg-gray-100 border-t-0 rounded-b-custom-sm z-[102] overflow-y-scroll`} ref={divRef}>
                <div className="flex flex-col w-full gap-y-2 overflow-hidden">
                    {sortedVoices && sortedVoices.map((item:any,index:number)=>
                        <button onClick={()=>{setVoice(item.voice);setEpisodes(item.episodes);setIsShow(false)}} key={index} className={`flex w-full ${getVoice() === item.voice?'text-gray-300':''} justify-between`}>
                            Voice {sortedVoices[index].voice}
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