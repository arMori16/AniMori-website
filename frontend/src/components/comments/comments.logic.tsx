"use client"
import { format } from "date-fns";
import axios from "../../api/axios"
import { formatDate } from "@/utils/formattDate";
import Cookies from "js-cookie";
import { toast } from "react-toastify";


export const createComment = async(seriesName:string,text:string,parentId?:number) =>{
    try{
        const accessToken = Cookies.get('accessToken');
        if(!accessToken) return console.error('Unathorized exception!');
        const commentPost = await axios.post('comments/create',{
            seriesName:seriesName,
            commentText:text,
            parentId:parentId
        },
        {headers:{
            'Authorization':`Bearer ${accessToken}`
        }}
    )
        console.log('Comment created: ',commentPost.data);
        return commentPost.data
    }catch(err){
        console.log('Error when tyring to create a comment!');
        console.error(err)
    }
}
export const getCommentById = async(commentId:number)=>{
    try{
        const comment = await axios.get('/comments/commentById',{
            params:{
                commentId:commentId
            }
            ,headers:{
                'Authorization':`Bearer ${Cookies.get('accessToken')}`
            }
        })
        return comment.data;
    }catch(err){
        console.error(err);
    }
}
export const getFirstComments = async(seriesName:string,page:number)=>{
    try{
        const firstComments = await axios.get('comments/users',{
            params:{
                seriesName:seriesName,
                skip:page*15
            },
            headers:{
                'Authorization':`Bearer ${Cookies.get('accessToken')}`
            }
        });
        const formattedComments = firstComments.data.map((comment: any) => ({
            ...comment,
            createdAt: formatDate(comment.createdAt),
        })).filter((item:any)=> !item.ParentId);
        console.log('FirstCooment: ',formattedComments);
        const childComments = firstComments.data.map((comment: any) => ({
            ...comment,
            createdAt: formatDate(comment.createdAt),
        })).filter((comment:any)=> comment.ParentId);
        console.log('This is child comment: ',childComments);
        
        return {formattedComments:formattedComments,childComments:childComments};
    }catch(err){
        console.error(err);
        /* return { createdAtArray: [], usersArray: [],commentText: [],commentId: [],userName: []}; */
    }
}
export const handleDeleteComment = async(commentId:number)=>{
    try{
        await axios.delete('/comments/admin',{
            params:{
                CommentId:commentId
            },
            headers:{
                'Authorization':`Bearer ${Cookies.get('accessToken')}`
            }
        })
    }catch(err){
        console.error(err); 
    }
}
export const handleReactToComment = (commentId:number,type:string,seriesName:string)=>{
    try{
        const atToken = Cookies.get('accessToken');
        const react = axios.post('/comments/react',{
            commentId:commentId,
            type:type,
            seriesName:seriesName
        },{
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
    }catch(err){
        console.error(err); 
    }
}
export const handleDeleteReact = async(commentId:number)=>{
    try{
        const deleteReact = await axios.delete('/comments/react',{
            params:{
                commentId:commentId
            },
            headers:{
                'Authorization':`Bearer ${Cookies.get('accessToken')}`
            }
        });
    }catch(err){
        console.error(err);
        
    }
}
export const handleGetReacts = async(seriesName:string)=>{
    try{
        const reacts = await axios.get('/comments/reacts',{
            params:{
                seriesName:seriesName
            },
            headers:{
                'Authorization':`Bearer ${Cookies.get('accessToken')}`
            }
        });
        return reacts.data;
    }catch(err){
        console.error(err); 
    }
}