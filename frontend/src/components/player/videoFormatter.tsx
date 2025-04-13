
import axios from "../../api/axios";
import { EnumPlayerQuality } from "./types/player.type";

const getVideo = async(seriesName:any,voice:string,quality:EnumPlayerQuality,episode:number)=>{

    const videoPath = `${seriesName}/${voice}/${String(episode)}/${quality}.mp4`
    try {
        const videoSrc = await axios.get('/videoFormat/getVideo',{
            params:{
                path:videoPath
            },
            headers:{
                Range: 'bytes=0-'
            },
            responseType:'blob',
            timeout: 5000
        })
        return videoSrc.data;
        } catch (error) {
        console.error('Ошибка при загрузке видео:', error);
        }
    }

export default getVideo;
