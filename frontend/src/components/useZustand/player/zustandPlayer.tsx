import { create } from "zustand"

type State={
    player:string
}

type Action={
    setPlayer:(voice:string)=>void,
    getPlayer:()=>string,
}

const playerStorage = create<State & Action>((set:any,get:any)=>({
    player:'Kodik',
    setPlayer:(player:string)=>set(()=>({player:player})),
    getPlayer:()=>get().player,
}))
export default playerStorage;