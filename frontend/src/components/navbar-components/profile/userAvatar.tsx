'use client'

import ReactCrop, { Crop, makeAspectCrop, PixelCrop } from 'react-image-crop'
import { useEffect, useRef, useState } from "react";
import "react-image-crop/dist/ReactCrop.css";
import axios from "@/api/axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export default function UserAvatar({initialUserAvatar,owner}:{initialUserAvatar:string,owner:boolean}){
    const componentRef = useRef<HTMLLabelElement>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const cropRef = useRef<HTMLDivElement | null>(null);
    const [file,setFile] = useState<File | null>(null);
    const [currentUserAvatar,setCurrentUserAvatar] = useState<string>(initialUserAvatar);
    const initialCrop = makeAspectCrop(
        {
            unit: 'px',
            width: 160,  
        },
        1,  
        160,
        160
    );
    const [crop, setCrop] = useState<Crop | undefined>(initialCrop);
    const [isShow,setIsShow] = useState(false);
    const [scale, setScale] = useState(1); 
    useEffect(()=>{
        const handleClickOutside=(e:MouseEvent)=>{
            if(componentRef.current && e.target instanceof Node && !cropRef.current?.contains(e.target) && !componentRef.current.contains(e.target as Node) && (e.target as HTMLElement).id !== 'file-upload'){
                if(cropRef.current && !cropRef.current.contains(e.target as Node)){
                    return setFile(null);
                }
                setScale(0.9);
                setTimeout(()=>{
                    setIsShow(false);
                },500);
                componentRef.current.style.transition = "transform 0.8s";
            }
    
        }
        document.addEventListener('click',handleClickOutside,true);
        return ()=>{
            document.removeEventListener('click',handleClickOutside,true);
        }
    },[])
    useEffect(() => {
        if (isShow) {
            setScale(1.05)
        }
    }, [isShow]);
    const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2D context available");
        }

        // Scale factors for high-DPI screens
        const pixelRatio = window.devicePixelRatio || 1;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;

        // Set canvas size to crop area
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;

        // Scale the context for better quality
        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = "high";

        // Draw only the cropped region
        ctx.drawImage(
            image,
            crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, // Source
            0, 0, crop.width, crop.height // Destination
        );
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
                    resolve(file);
                } else {
                    resolve(null);
                }
            }, "image/jpeg", 1);
        });
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const selectedFile = event.target.files[0];
        event.target.value = '';
        setFile(selectedFile);
    };
    const handleFileUpload = async() => {
        try{
            const croppedFile = await getCroppedImg(imageRef.current as HTMLImageElement, crop as PixelCrop);
            if (!croppedFile) {
                console.error("Failed to get cropped file");
                return;
            }
            const formData = new FormData();
            formData.append('image', croppedFile);
            const message = await axios.post('/user/avatar',formData,
            {
                headers:{
                    'Authorization':`Bearer ${Cookies.get('accessToken')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            toast.success(message.data);
            setFile(null);
            setIsShow(false);
            setCurrentUserAvatar(URL.createObjectURL(croppedFile));
            setTimeout(()=>{window.location.reload()},200)
        }catch(err){
            if(err instanceof AxiosError){
                toast.error(err.response?.data.message);
            }else{
                toast.error('Error when tried to upload an image!')
            };

        }
    }    
    return(
        <div className={`flex p-2 w-[10rem] h-[10rem] rounded-[4px] relative`}>
            <div className='flex w-full h-full group'>
                <img src={currentUserAvatar} className={`w-full object-cover h-full rounded-custom-sm ${owner && 'cursor-pointer'}`} alt=""/>
                {owner && (
                    <button onClick={()=>setIsShow(true)} className="flex items-center transition-opacity duration-300 opacity-0 group-hover:opacity-100 justify-center z-50 inset-[8px] absolute bg-gray-200 bg-opacity-80 rounded-custom-sm ">
                        <p className="text-white font-medium">Change avatar</p>
                    </button>
                )}
            </div>
            <input type="file" accept='image/*' className="hidden" id='file-upload' onChange={handleFileChange}/>
            {isShow && owner && (
                <div className='flex fixed inset-0 justify-center z-30 items-center rounded-md overflow-hidden'>
                    <label htmlFor="file-upload" className="flex outline-dashed outline-white outline-[2px] outline-offset-[-2rem] w-[26rem] h-[16rem] bg-gray-200 justify-center items-center rounded-[4px] flex-col" style={{
                            transform: `scale(${scale})`,
                            transition: "transform 0.5s",
                        }} ref={componentRef}>
                        <img src="/icons/image-upload.svg" className="w-[6rem] h-[6rem]" alt="" />
                        <p className="text-white text-[1.25rem] font-medium">Image upload</p>
                    </label>
                </div>
            )}
            {file && (
                <div className="fixed inset-0 flex justify-center items-center py-[2rem] z-40">
                    <div className="flex-col flex px-[2rem] bg-gray-300 py-2 relative max-h-full flex-grow-0 w-[90%] rounded-[4px] items-center" style={{height: 'fit-content'}} ref={cropRef}>
                        <p className="text-[1.15rem] text-white font-medium">Crop the Image {':>'}</p>
                        <ReactCrop keepSelection={true} minWidth={160} minHeight={160} maxHeight={100} crop={crop} onChange={(newCrop) => setCrop(newCrop)} locked={true} >
                            <img src={URL.createObjectURL(file)} ref={imageRef} alt="" className="w-full min-w-[10rem] min-h-[10rem]" style={{ maxHeight: "80vh" }}/>
                        </ReactCrop>
                        <div className="flex gap-x-2 mt-2">
                            <button onClick={()=>setFile(null)} className="w-[6rem] h-[2rem] items-center justify-center bg-red-button rounded-custom-sm text-white">Cancel</button>
                            <button onClick={handleFileUpload} className="w-[6rem] h-[2rem] items-center justify-center bg-green-400 rounded-custom-sm text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
