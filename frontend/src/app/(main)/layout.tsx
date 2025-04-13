"use server"
import  "@/app/globals.css";
import '@fortawesome/fontawesome-free/css/all.css';
import { tokenManager } from "@/api/setup-token";
import ClientRefreshToken from "@/api/clientRefreshToken";
import Navbar from "@/components/navbar/Navbar"
import { getStateFromCookiesStorage } from "@/utils/getUserState";
import { ToastContainer } from "react-toastify";
import axios from "@/api/axios";
import { cookies } from "next/headers";
import Footer from "@/components/footer/Footer";
export default async function RootLayout({ children }:any) {
  const userState = await getStateFromCookiesStorage();
  const userFirstname = userState === 'registered'? await axios.get('/user/firstname',{
    headers:{
        'Authorization':`Bearer ${cookies().get('accessToken')?.value}`
    }
  }) : null;
  return (
      <html lang="eng" className="min-h-screen">
          <body className="min-h-screen pt-[14rem] overflow-x-hidden overflow-y-scroll bg-[#242424] relative">
          <ClientRefreshToken/>
          <ToastContainer position="bottom-right"/>
            <Navbar user={userState} userFirstName={userFirstname?.data}/>
            {children}
            <Footer />
          </body>
      </html>
  );
}
