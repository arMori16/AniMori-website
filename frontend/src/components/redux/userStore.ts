'use client'
import { configureStore } from "@reduxjs/toolkit";
import userReducer, { User } from './userSlice';
import { loadFromCookies, saveToCookies } from "@/utils/localStorage";

/* const preloadedState = loadFromCookies() || {
    isAuthenticated: false,
    atToken: undefined,
  };; */
export const store = configureStore({
    reducer:{
        user:userReducer
    },
    /* preloadedState:{
        user:preloadedState
    } */
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/* store.subscribe(()=>{
    saveToCookies(store.getState().user)
}) */

