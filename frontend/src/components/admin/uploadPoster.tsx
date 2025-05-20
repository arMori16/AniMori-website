'use client'
import axios from "@/api/axios";
import useOutsideCommon from "@/hooks/useOutsideCommon";
import ClientPoster from "@/Images/ClientPoster";
import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { toast } from "react-toastify";


export default function UploadPoster({seriesName}:{seriesName:string | undefined}){
    const cropRef = useRef<HTMLDivElement | null>(null);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [poster,setPoster] = useState<File | null>(null);
    const [crop, setCrop] = useState<Crop>({
        unit: '%',
        x: 0,
        y: 0,
        width: 10,
        height: 10,
    });
    useOutsideCommon({refs:[cropRef],onOutsideClick:()=>setPoster(null),eventType:'mousedown'});
    const handleFilePosterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        const selectedFile = event.target.files[0];
        event.target.value = '';
        setPoster(selectedFile);
    };
    const getCroppedImg = async (image: HTMLImageElement, crop: PixelCrop): Promise<Blob | null> => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
            throw new Error("No 2D context available");
        }
        const pixelRatio = window.devicePixelRatio || 1;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
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
    const handleFilePosterUpload = async() => {
        try{
            if(!seriesName) throw new Error('Series name is not defined'); 
            const croppedFile = await getCroppedImg(imageRef.current as HTMLImageElement, crop as PixelCrop);
            if (!croppedFile) {
                console.error("Failed to get cropped file");
                return;
            }
            const formData = new FormData();
            formData.append('image', croppedFile);
            formData.append('seriesName',seriesName);
            
            const req = await axios.post('/media/upload/poster',formData,{
                headers:{
                    'Authorization':`Bearer ${Cookies.get('accessToken')}`,
                }
            });
            setPoster(null);
            setTimeout(()=>{window.location.reload()},200)
        }catch(err){
            if(err instanceof AxiosError){
                toast.error(err.response?.data.message);
            }else{
                console.error(err);
                console.log(`SERIESNAMe: `,seriesName);
                
                toast.error('Error when tried to upload an image!')
            };

        }
    } 
    useEffect(()=>{
        if (!poster) return;
        const img = new Image();
        img.src = URL.createObjectURL(poster);
        img.onload = () => {
        setCrop({
            unit: 'px',
            x: 0,
            y: 0,
            width:  imageRef.current?.width || 0,
            height: imageRef.current?.height || 0,
        });
        URL.revokeObjectURL(img.src);
        };
    },[poster])
    return(
        <div className='flex relative mr-5 flex-shrink-0 custom-image:mr-0 w-[15.62rem]  h-[21.87rem] custom-image:h-auto'>
            <div className="flex w-full h-full group relative">
                <ClientPoster alt={'poster'} divClass="w-full flex" containerClass='flex h-full w-full rounded-lg object-cover' src={seriesName ? `${process.env.NEXT_PUBLIC_API}/media/${seriesName}/images` : `/images/Poster.png` }/>
                <input type="file" accept='image/jpg, image/jpeg, image/png, image/webp, image/avif,' className="hidden" id="poster" onChange={handleFilePosterChange}/>
                <label htmlFor="poster" className="flex absolute items-center justify-center top-0 left-0 w-full h-full bg-black group-hover:opacity-40 opacity-0 transition-opacity cursor-pointer duration-300 text-white rounded-lg text-[1.2rem] font-semibold">Upload poster</label>
            </div>
            {poster && (
                <div className="fixed inset-0 flex justify-center items-center py-[2rem] z-40">
                    <div className="flex-col flex px-[2rem] bg-gray-300 py-2 relative max-h-[90vh] flex-grow-0 max-w-[90vh] rounded-[4px] items-center" ref={cropRef}>
                        <p className="text-[1.15rem] text-white font-medium">Crop the Image {':>'}</p>
                        <ReactCrop crop={crop} onChange={(newCrop) => setCrop(newCrop)}>
                            <img src={URL.createObjectURL(poster)} ref={imageRef} alt="" className="w-full min-w-[10rem] min-h-[10rem]" style={{ maxHeight: "80vh" }}/>
                        </ReactCrop>
                        <div className="flex gap-x-2 mt-2">
                            <button onClick={()=>setPoster(null)} type="button" className="w-[6rem] h-[2rem] items-center justify-center bg-red-button rounded-custom-sm text-white">Cancel</button>
                            <button onClick={handleFilePosterUpload} type="button" className="w-[6rem] h-[2rem] items-center justify-center bg-green-400 rounded-custom-sm text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}