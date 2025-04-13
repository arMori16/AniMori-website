import { create } from "zustand";


type State = {
    isShow:boolean,
}

type Action={
    updateIsShow:(isShow:boolean)=>void,
    getIsShow:()=>boolean,
}

const showStorage = create<State & Action>((set:any,get:any)=>({
    isShow:false,
    updateIsShow:(isShow:boolean)=>set({isShow}),
    getIsShow:()=>get().isShow,
}))

export default showStorage;