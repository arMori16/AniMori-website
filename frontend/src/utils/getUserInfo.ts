import axios from "@/api/axios";



export const getUserInfo = async()=>{
    try{
        const commentsUser = await axios.get('/');
        return commentsUser.data;
    }catch(err){
        console.error('Error when tried to getUserInfo in comments!: ',err)
    }
}