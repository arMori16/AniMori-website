'use server'
import axios from '@/api/axios';


export default async function Poster({ src, alt ,conteainerClass }:{src:string,alt:string,conteainerClass:string}) {
    let imgSrc: string;

    try {
        await axios.head(src);
        imgSrc = src;
    } catch (error) {
        imgSrc = '/images/Poster.png'; 
    }
    return (
        <img
            loading='lazy'
            src={imgSrc}
            alt={alt}
            className={conteainerClass}
        />
    );
}