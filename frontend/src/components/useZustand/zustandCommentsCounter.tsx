import { create } from "zustand"



type State={
    commentPage:number
}

type Action={
    getCommentPage:()=>number,
    setCommentPage:(num:number)=>void
}

const useCommentsCounter = create<State & Action>((set:any,get:any)=>({
    commentPage:0,
    setCommentPage:(num:number)=>set({commentPage:num}),
    getCommentPage:()=>get().commentPage
}))
export default useCommentsCounter;