
import axios from "@/api/axios"
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { SeriesInfo } from "./dto/adminDto/seriesInfo.dto";
import { formatDate } from "./formattDate";




export const getAllCounts = async():Promise<{
    comments:number,
    series:number,
    users:number,
}>=>{
    try{
        const allCounts = await axios.get('/catalog/getCounts');
        /* console.log('Here is the counts: ',allCounts.data); */
        return {
            comments: allCounts.data.comments,
            series: allCounts.data.series,
            users: allCounts.data.users
        }
    }catch(err){
        throw new Error('Error when trying to getAllCounts!')
    }
}

export const getSeries = async(page:number)=>{
    console.log(`It's page: `,page);
    try{
        const series = await axios.get('/catalog/admin/series',{
            params:{
                skip:page * 15
            }
        });
        console.log('Admin Series: ',series.data);
        
        return series.data
    }catch(err){
        toast.error('Error when trying to getSeries for admin page(dashboard)!');
    }
}

export const uploadImage = async(file:any)=>{
    try{
        const formData = new FormData();
        formData.append('image',file);
        const atToken = Cookies.get('accessToken');
        const postFile = await axios.post('/media/upload',formData,{
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        toast.success('Successfully')
    }catch(err){
        toast.error(`Can't upload the image :>`)
    }
}

export const addSeries = async(data:any)=>{
    try{
        const atToken = Cookies.get('accessToken');
        if(!atToken) throw new Error('Cannot find access token!');
        const ensureArray = (value: any) =>
            Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((item: string) => item.trim()) : [''];
    
        data.AlternitiveNames = ensureArray(data.AlternitiveNames);
        data.Genre = ensureArray(data.Genre);
        data.Studio = ensureArray(data.Studio);
        data.VoiceActing = ensureArray(data.VoiceActing);
        console.log('Data: \n',data);
        const postSeries = await axios.post('/catalog/item',data,{
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        });
        toast.success('Submit successfully!')
    }catch(err){
        console.error(`Error when trying to add new Series! ${err}`);
        toast.error('Submit incorrect!')
    }

    
}
export const deleteSeries = async(seriesName:string)=>{
    const atToken = Cookies.get('accessToken');
    try{
        const postDelete = axios.delete('catalog/item',{
            params:{
                seriesName:seriesName
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        toast.success('Delete successfully!')
    }catch(err){
        console.error(`Error when trying to delete series! ${err}`);
        toast.error('Delete failed >:')
    }
}

export const getDataView = async(seriesName:string):Promise<SeriesInfo>=>{
    try{
        const getData = await axios.get('/catalog/item',{
            params:{
                seriesName
            }
        })
        console.log('This is getdata for viewpage: ',getData.data);
        return{
            AlternitiveNames:getData.data.AlternitiveNames,
            SeriesName:getData.data.SeriesName,
            Description:getData.data.Description,
            SeriesViewName:getData.data.SeriesViewName,
            Status:getData.data.Status,
            Type:getData.data.Type,
            ReleaseYear:getData.data.ReleaseYear,
            Genre:getData.data.Genre,
            Shikimori:getData.data.Shikimori,
            Studio:getData.data.Studio,
            AmountOfEpisode:getData.data.AmountOfEpisode,
            VoiceActing:getData.data.VoiceActing,
            CurrentEpisode:getData.data.CurrentEpisode,
            NextEpisodeTime:getData.data.NextEpisodeTime
        }
    }catch(err){
        console.error('Cannot getData for the admin view page');
        return{
            AlternitiveNames:[''],
            SeriesName:'',
            Description:'',
            SeriesViewName:'',
            Status:'',
            Type:'',
            ReleaseYear:'',
            Genre:[''],
            Studio:[''],
            Shikimori:'',
            AmountOfEpisode:0,
            VoiceActing:[''],
            NextEpisodeTime:'',
            CurrentEpisode:0
        }
    }
}
export const updateSeries = async(data:SeriesInfo,seriesName:string)=>{
    console.log('SeriesName for the admin view page: ',seriesName);
    console.log('ITS DTAA: ',data);
    
    try{
        const atToken = Cookies.get('accessToken');
        const update = await axios.put(`/catalog/admin/series/${seriesName}`,data,{
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        if(update){
            toast.success('Sumitted successfully!')
        }
    }catch(err){
        console.error(`Error when trying to update the series!\n`,err);
        toast.error('Cannot update the series information!');
    }

}
export const getCommentsData = async(page:number)=>{
    try{
        const atToken = Cookies.get('accessToken');
        const getComments = await axios.get('/comments/admin',{
            params:{
                take:15,
                skip:page * 15
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        const data = getComments.data.map((item: any) => {
            
            return {
                ...item,
                createdAt: formatDate(String(item.createdAt)), // Ensure it's a string
            };
        });
    
        return data;
    }catch(err){
        console.error(`Error when trying to get comments data for admin! \n ${err}`);
        
    }
}
export const handleCommentDelete = async(commentId:number)=>{
    try{
        const atToken = Cookies.get('accessToken');
        const deleteComment = await axios.delete('/comments/admin',{
            params:{
                CommentId:commentId
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        if(deleteComment){
            toast.success('Deleted successfully!')
        }
    }catch(err){
        console.error(`Couldn't delete the comment!Error: ${err}`);
        toast.error(`Couldn't delete the comment!`);
    }
}
export const handleUserCommentsHitory = async(userName:string,page:number)=>{
    try{
        const atToken = Cookies.get('accessToken');
        const getComments = await axios.get('/comments/admin/user/history',{
            params:{
                userName:userName,
                skip:page * 15
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        const data = getComments.data.map((item: any) => {
            return {
                ...item,
                createdAt: formatDate(String(item.createdAt)), // Ensure it's a string
            };
        });
    
        return data;
    }catch(err){
        console.error(`Error when trying to get comments data for admin! \n ${err}`);
        
    }
}


export const handleDeleteEpisode = async(seriesName:string,voice:string,episode?:number)=>{
    const atToken = Cookies.get('accessToken');
    try{
        const deleteEpisode = await axios.delete('/catalog/item/episode/delete',{
            headers:{
                'Authorization':`Bearer ${atToken}`
            },
            params:{
                seriesName:seriesName,
                voice:voice,
                episode:episode
            }
        });
        toast.success('Deleted successfully');
        return deleteEpisode.data;
    }catch(err){
        console.error(`Cannot delete episode! ${err}`);
        toast.error(`Couldn't delete the episode`);
    }
}
export const handleUsersUpdate = async(email:string,operationType:string,data:boolean | number)=>{
    try{
        const updateUserInfo = await axios.put('/user/info',{
            email:email,
            operationType:operationType,
            data:data
        })
        toast.success('Successfully!');
    }catch(err){
        toast.error(`${err}`);
        console.error(err); 
    }
}