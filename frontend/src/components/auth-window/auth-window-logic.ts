"use client"
import Cookies from "js-cookie";
import axios from "../../api/axios";
import origAxios, { AxiosError } from 'axios';
import { tokenManager } from "../../api/setup-token";
import { toast } from "react-toastify";


export const saveTokensToCookies = async(accessToken:string,refreshToken:string):Promise<void>=>{
    const accessTokenExpiration = new Date(new Date().getTime() + 15 * 60 * 1000);
    Cookies.set('accessToken',accessToken,{
        expires: accessTokenExpiration,secure:true,sameSite:'strict'
    });
    Cookies.set('refreshToken',refreshToken,{
        expires: 28,secure:true,sameSite:'strict'
    });
    /* Cookies.set('user',refreshToken,{
        expires: 28,secure:true,sameSite:'strict'
    }); */
}
export const backHandleLogin = async (action:string,data:any,setServerError:(error:string)=>void,isEmailCode?:boolean)=>{
    console.log('Email:', data.email);
    console.log('Password:', data.password);
    console.log('First Name:', data.firstName);
    console.log('Action:', action);
    console.log('BackHandleLogin vizvan');
    try{
        console.log('xui');
        const res = await axios.post('/',{
            ...data,
            action:action,

        },)
        console.log('xui');
        console.log(res);
        
        if(res.data.tokens){
            if(isEmailCode){
                toast.success('Successfully')
                console.log('BackHandleLogin true');
                Cookies.set('state','registered');
                saveTokensToCookies(res.data.tokens.access_token,res.data.tokens.refresh_token);
                tokenManager.setupTokenRefresh();
                window.location.reload();
                console.log('vizvan setupTokenRefresh');
            }
            return true;
        }
        console.log('BackHandleLogin false');
        return false;
    }catch(error:any){
        if (origAxios.isAxiosError(error) && error.response) {
            const serverError = String(error.response.data.message);
            
            setServerError(serverError);
            console.log('THI IS SETSERVER ERROR',serverError);
            return false;
        } else {
            console.error('An unknown error occurred', error);
            return false;
        }
    }
}

export const getEmailCode = async(email:string)=>{
    try{
        console.log('ITS HERE',email);
        
        const getCode = await axios.post('/mail/getMailReq',{
            mail:email
        })  
        console.log('ITS AN EMAIL CODE: ',getCode);
        
        return getCode.data;
    }catch(err){
        console.error('Get error when tried to getEmailCode! ',err);
        
    }
} 
export const isUserEmailExists = async(email:string)=>{
    try{
        const isExist = await axios.get('/user/exist',{
            params:{
                email:email
            }
        })
        console.log('THIS IS EMAIL:: ',email);
        
        console.log('THIS IS EXIST DATA: ',isExist.data);
        
        if(isExist.data){
            return true;
        }
        return false;
    }catch(err){
        console.error(err);
    }
}