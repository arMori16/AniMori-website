import menuStorage from "@/components/useZustand/zustandMenu";
import useOutsideCommon from "../hooks/useOutsideCommon";
import { useRef, useState } from "react";


const YesNoButton = ({setShowSubmit,submitFunction}:{submitFunction:()=>void,setShowSubmit:React.Dispatch<React.SetStateAction<boolean>>})=>{
    const divRef = useRef<HTMLDivElement>(null);
    const componentRef = useRef<HTMLDivElement>(null);
    useOutsideCommon({refs:[componentRef],onOutsideClick:()=>setShowSubmit(false)});
    return(
        <div className="flex fixed inset-0 items-center justify-center bg-black bg-opacity-35" >
            <div className="flex flex-col w-[28rem] z-[20] h-[16rem] mb-[5rem] bg-white rounded-lg shadow-[0px_0px_5px_white]" ref={componentRef}>
                <div className="flex h-[3rem] w-full mt-8 justify-center">
                    <img src="http://localhost:3001/media/warning/icons" className="w-[3rem] h-full" alt="" />
                </div>
                <div className="flex flex-col h-[3.25rem] max-w-full flex-grow mt-1 items-center  text-[1.25rem] font-semibold pointer-events-none">
                    Delete
                    <div className="flex text-[0.8rem] font-medium">
                        Are you sure you want to delete?
                    </div>
                </div>
                <div className="flex max-w-full justify-center flex-grow">
                    <button onClick={()=>setShowSubmit(false)} className="flex bg-gray-800 text-gray-500 h-[3rem] rounded-[0.25rem] w-[45%] items-center justify-center p-1">
                        Cancel
                    </button>
                    <button onClick={()=>{submitFunction();setShowSubmit(false)}} className="flex text-white bg-red-400 h-[3rem] ml-2 rounded-[0.25rem] w-[45%] items-center justify-center p-1">
                        Delete
                    </button>
                </div>
            </div>
        </div>       
    )
}
export default YesNoButton;