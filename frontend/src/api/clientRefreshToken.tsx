'use client'

import { useEffect } from "react"
import { tokenManager } from "./setup-token"

const ClientRefreshToken = ()=>{
    useEffect(()=>{
        tokenManager.setupTokenRefresh()
        return(
            tokenManager.stopTokenRefresh()
        )
    })
    useEffect(() => {
        const interval = setInterval(() => {
          tokenManager.setupTokenRefresh();
          console.log('IT IS INTERVAL!');
          
        }, 14 * 60 * 1000); // Refresh token every 14 minutes (1 minute before expiration)
      
        return () => clearInterval(interval);
      });
    return null;
}
export default ClientRefreshToken;