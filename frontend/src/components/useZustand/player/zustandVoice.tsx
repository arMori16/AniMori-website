import { create } from "zustand"

type State={
    voice:string | null,
    episodes:number | null
}

type Action={
    setVoice:(voice:string | null)=>void,
    getVoice:()=>string,
    setEpisodes:(episode:number | null)=>void,
    getEpisodes:()=>number,
}

const voiceStorage = create<State & Action>((set:any,get:any)=>({
    voice:null,
    episodes:null,
    setVoice:(voice:string | null)=>set(()=>({voice:voice})),
    getVoice:()=>get().voice,
    setEpisodes:(episodes:number | null)=>set(()=>({episodes:episodes})),
    getEpisodes:()=>get().episodes,
}))
export default voiceStorage;