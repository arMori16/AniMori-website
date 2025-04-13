'use client'

import { HTMLCustomVideoElement } from "./types/player.type";
import playbackPosition from "../useZustand/zustandStorage";
import usePlayer from "./usePlayer";
import { Socket } from "socket.io-client";
import { t } from "i18next";
/* const {setIsPlaying} = usePlayer(); */
export function initializeVideoControls(videoSelector:string, playerContainerSelector:string,socketRef: React.MutableRefObject<Socket | null>,setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>) {
    if(typeof window === "undefined") return;

    const video = document.querySelector(videoSelector) as HTMLCustomVideoElement;
    const currentTimeElement = document.querySelector('.current-time');
    const totalTimeElement = document.querySelector('.total-time');
    const controls = document.querySelector('.controls')
    const multiplayerButton = document.querySelector('.toggle-button');
    const fullScreenBtn = document.querySelector('.full-screen-btn');
    const timeLineContainer = document.querySelector('.timeline-container') as HTMLDivElement
    const playerContainer = document.querySelector(playerContainerSelector) as HTMLDivElement;
    let isScrubbing = false;
    let isTouch = false;
    if (!video || !playerContainer) {
        console.error("Video or player container not found");
        return;
    }

    let timeout:NodeJS.Timeout | null;
    
    const showControls = () => {
        if (timeout) {
            clearTimeout(timeout);
        }
    
        (playerContainer as HTMLDivElement).style.cursor = 'default';
        (controls as HTMLDivElement).style.visibility = 'visible';
        (multiplayerButton as HTMLDivElement).style.visibility = 'visible';
        
        timeout = setTimeout(() => {
            (playerContainer as HTMLDivElement).style.cursor = 'none';
            (multiplayerButton as HTMLButtonElement).style.visibility = 'hidden';
            (controls as HTMLDivElement).style.visibility = 'hidden';
        }, 5000);
    };
    video.addEventListener('pause', showControls);
    video.addEventListener('play', showControls);
    playerContainer.addEventListener('mousemove', showControls);
    timeLineContainer.addEventListener('touchmove', showControls);
    

    /* TIMELINE */
    function toggleScrubbing(e: MouseEvent | TouchEvent,lastTouch?:number) {
        const rect = timeLineContainer?.getBoundingClientRect();
        if (!rect) return;
    
        const clientX = e instanceof MouseEvent ? e.clientX  : lastTouch ? lastTouch : e.touches[0].clientX;
    
        const percent = Math.min(Math.max(0, clientX - rect.x), rect.width) / rect.width;
    
        if (e instanceof MouseEvent) {
            isScrubbing = (e.buttons & 1) === 1; 
        } else {
            isScrubbing = e.type === "touchmove";
        }
    
        video.classList.toggle("scrubbing", isScrubbing);
        
        video.currentTime = percent * video.duration;
        if(socketRef.current){
            setIsPlaying(false);
            video.pause();
        }
    
        !lastTouch && handleTimeLineUpdate(e);
    }
    
    function handleTimeLineUpdate(e: MouseEvent | TouchEvent) {
        const rect = timeLineContainer?.getBoundingClientRect();
        if (!rect) return;
        const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
        const percent = Math.min(Math.max(0, clientX - rect.x), rect.width) / rect.width;
        timeLineContainer?.style.setProperty("--preview-position", String(percent));
    
        if (isScrubbing) {
            /* !isTouch && e.preventDefault(); */
            timeLineContainer?.style.setProperty("--progress-position", String(percent));
        }
    }
    timeLineContainer.addEventListener("mousedown", (e) => {
        if(isTouch) return;
        toggleScrubbing(e)
    });
    timeLineContainer.addEventListener("mousemove", (e) => {
        if(isTouch) return;
        handleTimeLineUpdate(e)
    });
    // Touch Events
    timeLineContainer.addEventListener("touchstart",(e) => {isTouch = true;toggleScrubbing(e)});
    timeLineContainer.addEventListener("touchmove", (e) => {
        isTouch = true;
        toggleScrubbing(e);
    });
    /* timeLineContainer.addEventListener("touchend",(e)=> toggleScrubbing(e, e.changedTouches[0].clientX)); */
    document.addEventListener("mouseup",e=>{
        if(isScrubbing && !isTouch) toggleScrubbing(e);
    })
    document.addEventListener("mousemove",e=>{
        if(isScrubbing && !isTouch) handleTimeLineUpdate(e);
    })
    

    /* TIMELINE */
    video.addEventListener('pause', () => {
        playerContainer.classList.add('paused');
    });

    video.addEventListener("timeupdate",()=>{
        if(!currentTimeElement) return;
        const percent = video.currentTime / video.duration;
        timeLineContainer?.style.setProperty("--progress-position",String(percent));
        currentTimeElement.textContent = formatDuration(video.currentTime);
    })
    video.addEventListener('play', () => {
        playerContainer.classList.remove('paused');
    });
    video.addEventListener('play',()=>{
        if(!totalTimeElement) return;
        console.log('ITS TOTALTIME');
        if(!currentTimeElement) return;
        currentTimeElement.textContent = formatDuration(video.currentTime);
        totalTimeElement.textContent = formatDuration(Number(video.duration));
    })
    video.addEventListener('loadedmetadata',()=>{
        if(!totalTimeElement) return;
        console.log('ITS TOTALTIME');
        if(!currentTimeElement) return;
        currentTimeElement.textContent = formatDuration(video.currentTime);
        totalTimeElement.textContent = formatDuration(Number(video.duration))
    })
    const leadingZeroFormatter = new Intl.NumberFormat(undefined,{
        minimumIntegerDigits:2
    })
    const formatDuration = (time:number):any=>{
        const seconds = Math.floor(time % 60);
        const minutes = Math.floor(time / 60) % 60;
        const hours = Math.floor(time / 3600);
        if(hours === 0){
            return `${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`
        }else{
            return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`
        }
    }
}

export const toggleVolume = () => {
    if(typeof window === "undefined") return;
    const player = document.querySelector('video');
    if (!player) return;

    const toggleMute = () => {
        const volume = player.getAttribute('data-volume-level');

        if (volume === 'high') {
            player.setAttribute('data-volume-level', 'muted');
        } else {
            player.setAttribute('data-volume-level', 'high');
        }

        player.muted = !player.muted;
    };

    // Удаляем ранее добавленный обработчик перед добавлением нового
    player.removeEventListener("click", toggleMute);
    player.addEventListener("click", toggleMute);
};

const volumeLogic = ()=>{
     if(typeof window === "undefined") return;
    const muteBtn = document.querySelector('.mutedBtn') as HTMLButtonElement;
    const video = document.querySelector('video') as HTMLVideoElement;
    const playContainer = document.querySelector('.player-container') as HTMLDivElement;
    const volumeSlider = document.querySelector('.volume-slider') as HTMLDivElement;
    
    
    muteBtn?.addEventListener("click",toggleMute);
    volumeSlider?.addEventListener('input',e=>{
        const target = e.target as HTMLInputElement
        if(!video) return;
        video.volume = Number(target?.value);
        video.muted = Number(target?.value) === 0;
    }) 
    volumeSlider?.addEventListener('input', e => {
        const target = e.target as HTMLInputElement;
        if (!video) return;
        
        // Обновляем громкость видео
        video.volume = Number(target.value);
        video.muted = Number(target.value) === 0;
    
        // Обновляем визуальное состояние кнопок и ползунка сразу
        let volumeLevel;
        if (video.muted || video.volume === 0) {
            volumeLevel = 'muted';
        } else if (video.volume >= 0.4) {
            volumeLevel = 'high';
        } else {
            volumeLevel = 'low';
        }
        
        if (playContainer) {
            playContainer.dataset.volumeLevel = volumeLevel;
        }
    },false);
    function toggleMute(){
        if(!video) return;
        video.muted = !video.muted;
    }
    
}


/* export const useVideoLogic = async(seriesName:any,quality:EnumPlayerQuality)=>{
    console.log('VIDEOLOGIC : ',seriesName);
    
    const res = await useVideo(seriesName,quality);
    return res;
} */
export default volumeLogic;