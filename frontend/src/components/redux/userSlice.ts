'use client'
import { createSlice,PayloadAction } from "@reduxjs/toolkit";


export interface User{
    atToken?:string | null | undefined,
    isAuthenticated:boolean | string,
}

const initialState:User={
    isAuthenticated:false,
    atToken:undefined
}

const userSlice = createSlice({
    name:'user',
    initialState,
    reducers:{
        login:(state,action:PayloadAction<string | undefined>)=>{
            state.isAuthenticated = true;
            state.atToken = action.payload;
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.atToken = undefined;
        }
    }
    
})

export const {login,logout} = userSlice.actions
export default userSlice.reducer;

