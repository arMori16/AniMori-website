import { create } from "zustand"



type State={
    listItem:string
}

type Action={
    getUserListItem:()=>string,
    setUserListItem:(item:string)=>void
}

const useProfileListItems = create<State & Action>((set:any,get:any)=>({
    listItem:'Watching',
    setUserListItem:(item:string)=>set({listItem:item}),
    getUserListItem:()=>get().listItem
}))
export default useProfileListItems;