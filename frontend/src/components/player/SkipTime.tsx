'use client'

import usePlayer from "./usePlayer";

const SkipTimeFunction = ()=>{
    if(typeof window === "undefined") return;
    console.log('ITS SKIP TIME!!!!!!!');
    const video = document.querySelector('video') as HTMLVideoElement;
    if(!video) return;
    document.addEventListener("keydown",(event:KeyboardEvent)=>{
        switch(event.key){
            case 'ArrowRight':
                video.currentTime += 10;
                break;
            case 'ArrowLeft':
                event.preventDefault();
                video.currentTime -= 10;
                break;
        }
    })
}
export default SkipTimeFunction