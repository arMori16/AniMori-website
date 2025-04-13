'use client'
import axios  from "./axios";
import * as jwt_decode from "jwt-decode";
import {Decoded} from './interfaces/decoded.interface';
import Cookies from "js-cookie";
import { createContext, useContext, useEffect } from "react";

type TokenRefreshContextType = {
    refreshNow: () => Promise<void>;
  };
class TokenManager {
    private timerId: NodeJS.Timeout | null = null;
        refreshToken = async(rt?:string,optional?:boolean)=>{
            try{
                
                console.log('getItem(refreshtoken): '+ rt);
                const {data} = await axios.post('/refresh',optional?Cookies.get('refreshToken'):rt,{
                    headers: {
                        'Authorization': `Bearer ${optional?Cookies.get('refreshToken'):rt}`, // Добавляем токен в заголовок
                    }
                })
                console.log('post sdelan');
                console.log(data);
                const fifteenMinutes = 15 * 60 * 1000;
                const expirationDate = new Date(Date.now() + fifteenMinutes);
                Cookies.set('accessToken',data.access_token,{expires:expirationDate});
                Cookies.set('refreshToken',data.refresh_token,{expires:28});
                console.log('New RT:'+data.refresh_token);
                
                return {accessToken:data.accessToken,refreshToken:data.refreshToken};
            }
            catch(err){
                console.log(err);
                return console.error();
                
            }
        }
        setupTokenRefresh = async():Promise<boolean | undefined>=>{
            const atToken = Cookies.get('accessToken');
            const rtToken = Cookies.get('refreshToken');
            console.log('THis is rtToken:',rtToken);
            console.log('THis is atToken:',atToken);
            
            // if(rtToken && atToken) return false;
            if(rtToken && atToken){
                const decoded_token = jwt_decode.jwtDecode<Decoded>(atToken);
                const expirationTime = decoded_token.exp * 1000;
                console.log('EXP TIME:',expirationTime);
                
                const currentTime = Date.now();
                console.log('all decoded');
        
                const timeToRefresh = expirationTime - currentTime - 60000;
                console.log(timeToRefresh);
                
                if(timeToRefresh>0){
                    console.log('xuyaka');
                    
                    this.timerId = setTimeout(async()=>{
                        try{
                            console.log('vizvan refresh Token');
                            await this.refreshToken(rtToken);
                            await this.refreshToken(rtToken);
                            await this.setupTokenRefresh();
                            console.log('setTimeout');
                            
                            return true;
                        }catch(err){
                            console.log(err);
                            console.log("IT's SETTIMEUP ERROR");
                            return false;
                        }
                    },timeToRefresh)
                }
                else{
                    console.log('else');
                    await this.refreshToken(rtToken)
                    await this.setupTokenRefresh();  
                    return true;
                }
            }
            if(rtToken && !atToken){
                await this.refreshToken(rtToken);
                await this.setupTokenRefresh();
                return true;
            }
        }
        stopTokenRefresh() {
            if (this.timerId) {
              clearTimeout(this.timerId);
              this.timerId = null;
            }
          }        
}
export const tokenManager = new TokenManager();