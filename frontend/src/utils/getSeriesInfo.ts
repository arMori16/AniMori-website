import axios from "@/api/axios";
import { SeriesInfo } from "./dto/adminDto/seriesInfo.dto";

const getSeriesInfo = async({page,take,category,skipPage = 16,status}:{page:number,take:number,category?:string,status?:string,skipPage:number})=>{
    
   try{
    const req = await axios.get('/catalog/getCatalog',{
        params:{
            take:take || null,
            skip:page*skipPage,
            category:category || null,
            status:status || null
        }
    });
    return req.data 
}catch(err){
    console.error(`Cannot take the catalog for the page!Error: ${err}`);
}
}
export const getPageCount = async({category,divideNumber = 24,status}:{category?:string,divideNumber?:number,status?:string}={})=>{
    try{
        const reqAmountOfSeries = await axios.get('/catalog/getAmountOfSeries',{
            params:{
                category:category || null,
                status:status || null
            }
        });
        console.log(`Amount of series: `,reqAmountOfSeries.data);
        const amountOfPages = Math.ceil(reqAmountOfSeries.data / divideNumber);
        return amountOfPages;
    }catch(err){
        console.error(`Cannot count amount of series for the page! ${err}`);
        return 1;
    }
}

export const getSeasonedCatalog = async()=>{
    const getCarouselItems = await axios.get('/catalog/carousel/items');
    return getCarouselItems;
}
export default getSeriesInfo;