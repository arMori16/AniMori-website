'use server'
import { cookies } from "next/headers";

export const getStateFromCookiesStorage = ():string=>{
    try{
        const cookiesStore = cookies();
        const atToken = cookiesStore.get('accessToken')
        if(atToken){
            return 'registered';
        }
        else{
            return 'unregistered'
        }
    }catch(err){
        console.log(err);
        return 'err';
    }
}
