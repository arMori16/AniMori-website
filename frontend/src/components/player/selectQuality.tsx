
import { ChevronDown, ChevronUp, Dot } from "lucide-react";
import { EnumPlayerQuality } from "./types/player.type";
import { useRef, useState } from "react";
import useOutsideCommon from "@/hooks/useOutsideCommon";

const QUALITIES:EnumPlayerQuality[]=[
    EnumPlayerQuality["1080p"],
    EnumPlayerQuality["720p"],
    EnumPlayerQuality["480p"],
    
]

interface Props{
    currentValue:EnumPlayerQuality,
    onChange:(quality:EnumPlayerQuality)=>void
}


export function SelectQuality({currentValue,onChange}:Props){
    const [isShow,setIsShow] = useState(false);
    const qualityRef = useRef<HTMLUListElement>(null);
    useOutsideCommon({refs:[qualityRef],onOutsideClick:()=>setIsShow(false)});
    const handleButtonClick = () => {
        setIsShow(prev => !prev);
    };
    return(
        <div className="relative quality-container">
            <button className='flex items-center text-white relative custom-xs:text-[0.85rem]' onClick={handleButtonClick}>{currentValue} 
                {isShow ? (
                    <ChevronUp color="white" className="custom-xs:w-[0.85rem] custom-xs:h-[0.85rem]"/>
                    ):(
                    <ChevronDown color="white" className="custom-xs:w-[0.85rem] custom-xs:h-[0.85rem]"/>
                )}
            </button>
            {isShow && (
                <div className='flex visible flex-col relative bottom-4'>
                    <ul className="absolute right-3 backdrop-blur-3xl p-2 rounded-t-[10px] bottom-full text-white" ref={qualityRef} >
                        {QUALITIES.map(quality=>(
                            <li className="flex justify-end" key={quality}>
                                <button 
                                    onClick={()=>{onChange(quality) 
                                            setIsShow(false)}}
                                            className="flex items-center custom-xs:text-[0.85rem]">
                                        {currentValue === quality && <Dot className="custom-xs:w-[0.75rem] custom-xs:h-[0.75rem]"/>}{quality}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}