/* import playbackPosition from "../useZustand/zustandStorage";


export const timePosition = ()=>{
    if(typeof window === "undefined") return;
    const video = document.querySelector('video') as HTMLVideoElement;
    const currentTime = String(video.currentTime);
    const newState = { currentTime };
    const updateLocalTime = playbackPosition((state)=>state.updateCurrentTime(newState));
    console.log('THIS IS UPDATELOCAL TIME!',updateLocalTime);

} */