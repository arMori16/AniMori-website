'use client';

import { create } from "zustand";

type State={
    currentTime:string
}

type Action = {
    updateCurrentTime:(currentTime:string) =>void
    getCurrentTime:()=>string
}

const playbackPosition = create<State & Action>((set:any,get:any)=>({
    currentTime:'0',
    updateCurrentTime:(time:string)=>set(()=>({currentTime:time})),
    getCurrentTime:()=>get().currentTime
}))

export default playbackPosition;