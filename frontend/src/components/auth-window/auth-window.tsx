"use client"

import React, { useEffect,useState } from 'react';
import { signupScheme,loginScheme, signupScheme1 } from './auth-validation-scheme';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from 'yup';
import { useForm, SubmitHandler } from "react-hook-form";
import {  saveTokensToCookies,backHandleLogin, getEmailCode, isUserEmailExists } from './auth-window-logic';
import errorStorage from '../useZustand/zustandErrorStorage';
import { toast } from 'react-toastify';
import { Loader } from 'lucide-react';


interface FormData{
    email?:string,
    password?:string,
    firstName?:string
}

export default function AuthWindow(){ 

    /* <useStateVariables> */
    const [userEmail,setUserEmail] = useState<string | undefined>('');
    const [userPassword,setUserPassword] = useState<string | undefined>('');
    const [userFirstName,setUserFirstName] = useState<string | undefined>();

    const [userEmailCode,setUserEmailCode] = useState<String>('');
    const [isEmailCode,setIsEmailCode] = useState<String>('');
    const [view,setView] = useState('login');
    const [emailView,setEmailView] = useState(false);
    const [isLoading,setIsLoading] = useState(false);
    const {serverError,setServerError} = errorStorage();

    const scheme = yup.lazy((data) => {
        if (view === 'login') return loginScheme;
        if (view === 'signup') return signupScheme1;
        if (view === 'signup-2') return signupScheme;
        return yup.object();
      });
      
    /* </useStateVariables> */
    /* </ChangeView> */

    /* Clear setServerError either closing tab or switching view */
    useEffect(() => {
        if(view === 'signup-2'){
            if(typeof window === "undefined") return;
            console.log('URA');
            const element = document.querySelector('.selector') as HTMLTextAreaElement;
            element.value = '';
        }
        return () => {
            setServerError('');
        };
    }, [view]);
    useEffect(()=>{
        const handleKeyPress = (e:KeyboardEvent)=>{
            const activeElement = document.activeElement;

            // Check if the user is inside a textarea
            if ((activeElement && activeElement.tagName === 'TEXTAREA' && e.key === 'Enter') || (activeElement && e.key === 'Enter')) {
                e.preventDefault(); // Prevent new line in the textarea

                // Find the submit button and trigger a click
                const button = document.querySelector('.submit-button') as HTMLButtonElement;
                if (button) button.click();
            }
        }
        document.removeEventListener('keydown',handleKeyPress);
        document.addEventListener('keydown',handleKeyPress);
        return () => {
            document.removeEventListener('keydown',handleKeyPress);
        };
    },[])
    /* Clear setServerError either closing tab or switching view */

    /* <Validation> */
    const {register,handleSubmit,getValues,watch,reset,formState:{errors},trigger,clearErrors} = useForm<FormData>({
        defaultValues:{
            email:view === 'signup-2'?userEmail:'',
            password:view === 'signup'?undefined:'',
            firstName:view === 'signup-2' ? '' : undefined
        },
        resolver:yupResolver(scheme),
    });
    const handleUserEmailCode = async() => {
        if(userEmailCode === isEmailCode && userEmailCode !== ''){   
            if(view === 'login-email'){
                const data = {
                    email:userEmail,
                    password:userPassword,
                    firstName:userFirstName
                }
                await backHandleLogin(view === 'login-email'? 'login':'signup',data,setServerError,true);
                window.location.reload();
            }else{
                setEmailView(false);
                setView('signup-2');
            }
        }else{
            toast.error('You passed the wrong email code :(')
        }
      };
    /* </Validation> */

    /* <Handles> */

    const handleEmailCode = async()=>{
        try{
            setIsLoading(true);
            if(view === 'signup'){
                const isExist = await isUserEmailExists(String(getValues('email')));
                console.log('ISEXIST?? ::: ',isExist);
                
                if(isExist){
                    console.log('SERVEREROR:::');
                    return setServerError('User with this email already exists!')
                }
            }
            setEmailView(true);
            setUserEmail(getValues('email'));
            setUserEmailCode(String(await getEmailCode(String(getValues('email')))));
            console.log('This is emailView: ',emailView);
            view === 'signup'?reset():'';
            setView(`${view}-email`);
            setIsLoading(false)
            console.log('ITS handleEmailCode',isEmailCode);
        }catch(err){
            console.error('Error when trying to handle Email code ! ',err);
            
        }
    }
    const handleSignup:SubmitHandler<FormData> = async (data:FormData)=>{
        const dataForSignUp2 = {...data,email:userEmail};
        
        const isSuccess = await backHandleLogin(view === 'login'? 'login':'signup',view==='login'?data:dataForSignUp2,setServerError,view === 'login'?false:true);
        
        if(isSuccess){
            view === 'login' ? (handleEmailCode(),setIsLoading(true)):'';
            setUserEmail(data.email);
            setUserPassword(data.password);
            setUserFirstName(data.firstName);
            reset();
        }
    }
    /* </Handles> */
    const handleNewToAniMori = ()=>{
        setView('signup');
        reset();
    }

    /* if(getServerError()){
        console.log('GETSERVERERROR!');
        
    } */
    return(
            <div className='flex px-[5rem] custom-xs:px-[2rem] h-full text-white flex-col w-full'>
                <p className='text-green-400 text-[1.75rem] font-semibold'>{view === 'login'?'Log In' : view === 'signup'?'Sign Up':emailView === true?'Email verification':'Create your username and password'}</p>
                {view === 'signup-2' ? (
                    <p className='text-white text-[0.9rem] break-words'>AniMori is anonymous, so your username is what you&apos;ll go by here. Choose wisely—because once you get a name, you can&apos;t change it.</p>
                ):(
                    <p className='text-white text-[0.9rem] break-words'>By continuing,you agree to our <a href='/user/agreement' className='a-login'>User Agreement</a> and acknowledge tha you understand the <a href="/policies/privacy-policy" className='a-login'>Privacy Policy</a></p>
                )}
                {isLoading && (
                    <div className='flex pointer-events-none flex-col-reverse items-center justify-center absolute inset-0 rounded-md z-20 bg-black bg-opacity-40'>
                        <p className='font-semibold text-[1.5rem] ml-2 text-white'>Loading...</p>
                        <img src={`/images/goose.gif`} className='flex w-[2.75rem] h-[2.75rem] rounded-xl' alt="" />
                    </div>
                )}
                <form onSubmit={handleSubmit((data)=>{
                    view === 'login' || view === 'signup-2'?handleSignup(data):view === 'signup'?(trigger('email'),handleEmailCode()):''
                    })} className={`flex flex-col h-full w-full ${view === 'login'?'mt-[9rem]':'mt-5'}`}>
                    <div className='flex flex-col w-full p-2 h-[3.5rem] custom-xs:h-[2.75rem] bg-gray-300 rounded-md'>
                        <textarea className='w-full selector h-full bg-transparent outline-none custom-xs:pt-1 custom-xs:text-[0.85rem] flex py-2 overflow-x-scroll overflow-y-hidden whitespace-nowrap scrollbar-hide' placeholder={`${view === 'login' ||view === 'signup'?'Enter your email':view === 'signup-2'?'Enter your username':'Enter your code'}`}
                        {...(emailView ===false?register(view === 'login' || view === 'signup'?'email':view === 'signup-2'?'firstName':'email'):{})}
                        onChange={(e:any)=>{emailView && setIsEmailCode(e.target.value)}}
                        ></textarea>
                    </div>
                    {(serverError || errors.email || errors.firstName) && <div className='flex text-[14px] text-[#E93055] relative ml-2 my-1'>{errors.email?.message || serverError}</div>}
                    {(view === 'login' || view === 'signup-2') && (
                        <div className='flex flex-col'>
                            <div className={`flex w-full ${serverError || errors.email?'':'mt-4'} p-2 custom-xs:p-1 custom-xs:text-[0.85rem] custom-xs:h-[2.75rem] h-[3.5rem] bg-gray-300 rounded-md`}>
                                <textarea className='w-full h-full bg-transparent outline-none flex py-2 overflow-x-scroll overflow-y-hidden whitespace-nowrap scrollbar-hide' placeholder={`${'Enter your password'}`} {...register('password')}></textarea>
                            </div>
                            {(serverError || errors.password) && <div className='flex text-[14px] text-[#E93055] relative ml-2 mt-1'>{errors.password?.message || serverError}</div>}
                        </div>
                        
                    )}
                    {view==='login' && (
                        <button type="button" onClick={handleNewToAniMori} className='flex text-green-400 mt-3 w-[8rem] custom-xs:text-[0.85rem]'>New to <span className='ml-1 font-inknut font-semibold'>AniMori?</span></button>
                    )}
                    <div className='flex mt-[2.75rem] w-full h-[2.5rem] custom-xs:h-[2rem] custom-xs:mt-[2.25rem] custom-xs:text-[0.85rem] justify-center'>
                        <button type={`${emailView?"button":"submit"}`} onClick={()=>emailView && (handleUserEmailCode())} className='flex bg-green-400 submit-button items-center justify-center w-[90%] h-full rounded-md'>
                            {view === 'login' || view === 'signup'?'Continue':view === 'signup-2' || 'email'?'Submit':''}
                        </button>
                    </div>
                </form>
            </div>
    )
}
