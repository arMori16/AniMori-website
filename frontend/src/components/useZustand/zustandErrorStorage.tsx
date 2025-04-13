import { create } from "zustand";

type ErrorState = {
    serverError:string
}

type Action={
    setServerError:(serverError:string)=> void;
    getServerError:()=>string
}
const errorStorage = create<ErrorState & Action>((set:any,get:any)=>({
    serverError:'',
    setServerError:(serverError:string)=>set(()=>({serverError:serverError})),
    getServerError:()=>get().serverError,
}))

export default errorStorage;