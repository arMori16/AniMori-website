import { create } from "zustand";


type State = {
    showProfile:boolean,
}

type Action={
    updateIsShowProfile:(isShow:boolean)=>void,
    getIsShowProfile:()=>boolean,
}

const showProfileZustand = create<State & Action>((set:any,get:any)=>({
    showProfile:false,
    updateIsShowProfile:(showProfile:boolean)=>set({showProfile}),
    getIsShowProfile:()=>get().showProfile,
}))

export default showProfileZustand;