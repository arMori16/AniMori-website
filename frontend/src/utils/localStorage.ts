'use client'
import Cookies from 'js-cookie';
import { User } from '../components/redux/userSlice';

export const saveToCookies = (state:User)=>{
    try{
        const serializedState = state.atToken;
        const isAuthenticated = state.isAuthenticated;
        if(typeof  serializedState === 'string'){
            console.log('Saving to cookies:', serializedState);
            Cookies.set("atToken",serializedState);
            Cookies.set("isAuth",String(isAuthenticated));
        }

    }catch(error){
        console.error(`couldn't load State`,error)
    }
}

export const loadFromCookies = ():User | undefined =>{
    try{
        const serializedState = Cookies.get("atToken");
        console.log('Loaded from cookies:', serializedState)
        if(serializedState === undefined) {
            console.log('IT`S HERE');
            
            return undefined
        };
        console.log(serializedState);
        /* const parsedSerial= JSON.parse(serializedState);
        console.log(parsedSerial); */
        const isAuth = Cookies.get('isAuth');
        return {atToken:serializedState,isAuthenticated:String(isAuth)};
    }catch(error){
        console.error('Error when tried to loadFromLocalStorage!');
        return undefined;
    }
}


