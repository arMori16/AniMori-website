'use client'
import Image from "next/image";
import { useState } from "react";

const ClientPoster = ({ src, alt ,containerClass,divClass,children }:{src:string,alt:string,containerClass?:string,divClass?:string,children?:React.ReactNode})=>{
    const [imgSrc, setImgSrc] = useState(src);
    return (
        <div className={divClass}>
            <img loading="lazy" className={containerClass} src={imgSrc} alt={alt} onError={() => setImgSrc("/images/Poster.png")}/>
            {children}
        </div>
      );
}
export default ClientPoster;