import axios from "@/api/axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export const setSeriesRate = async(seriesName:string,value:number)=>{
    try{
        const atToken = Cookies.get('accessToken');   
        const req = await axios.put('/catalog/item/rate',{
            seriesName:seriesName,
            value:value
        },
        {
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        toast.success('Rated successfully')
        return req.data.Value
    }catch(err){
        console.error(`Couldn't set rate for the series!Error:${err}`);
        toast.error(`Couldn't rate the series!`)
    }
}
export const getUserRate = async(seriesName:string,atToken:string | undefined)=>{
    try{
        const req = await axios.get('/catalog/user/rate',{
            params:{
                seriesName:seriesName
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        return req.data.Value
    }catch(err){
        console.error(`Couldn't set rate for the series!Error:${err}`);
    }
}
export const getSeriesRate = async(seriesName:String)=>{
    const data = await axios.get('/catalog/item/rate',{
        params:{
            seriesName:seriesName
        }
    });
    return data.data;
}
export const getItemsRate = async(seriesNames:string[],atToken?:string)=>{
    try{
        const itemsRate = await axios.get('catalog/items/rate',{
            params:{
                seriesNames:seriesNames
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        return itemsRate.data;
    }catch(err){
        console.error(`Error: ${err}`);
        
    }
}
export const getUserRates = async(atToken:string | undefined,seriesNames:string[])=>{
    try{
        const userRates = await axios.get('/catalog/user/rates',{
            params:{
                seriesNames:seriesNames
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        });
        /* console.log(`HAHAHAHA: `,userRates.data);
         */
        return userRates.data;
    }catch(err){
        console.error(`Error: ${err}`);
        
    }
}
export const deleteUserRate = async(seriesName:string)=>{
    try{
        const atToken = Cookies.get('accessToken');
        const req = await axios.delete('catalog/user/rate/delete',{
            headers:{
                'Authorization':`Bearer ${atToken}`
            },
            params:{
                seriesName:seriesName
            }
        });
        toast.info('Deleted successfully!');
        return req;
    }catch(err){
        toast.warning(`Couldn't delete the rate :(`)
        console.error(`Error: ${err}`);
        
    }
}
export const getSeriesData = async(seriesName:string,atToken?:string)=>{
    try{
        
        const res = await axios.get('/catalog/item',{
            params:{
                seriesName:seriesName
        }});
        const seriesRate = await getSeriesRate(seriesName);
        const userListItem = atToken? await axios.get('/user/userList/item',{
            params:{
                seriesName:seriesName
            },
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        }) : null
        return {data:res.data,seriesRate:seriesRate.avgRate,count:seriesRate.count,Views:res.data.Views,userListItem:userListItem?.data};
    }catch(err){
        console.error(`Couldn't get series data: ${err}`);
        return null;
    }
}
export const updateUserList = (seriesName:string,userListItem:string,seriesViewName:string)=>{
    try{
        const atToken = Cookies.get('accessToken');
        const updateUSerListItem = axios.post('/user/userList/item',{
            seriesName:seriesName,
            userListItem:userListItem,
            seriesViewName:seriesViewName
        },{
            headers:{
                'Authorization':`Bearer ${atToken}`
            }
        })
        toast.success(`Added to ${userListItem}`)
    }catch(err){
        toast.error('Something goes wrong :(')
        console.error(err);
        
    }
}

export const deleteUserListItem = async(seriesName:string)=>{
    try{
        const deleteItem = await axios.patch('/user/userList/delete/item',{
            seriesName:seriesName
        },{
            headers:{
                'Authorization':`Bearer ${Cookies.get('accessToken')}`
            }
        })
    }catch(err){
        console.error(err);
        toast.error(`Couldn't delete item :(`)
    }
}

export const list = [
    {key:'Watching',value:'eye',color:'#DC27C4'},
    {key:'Planned',value:'calendar-days',color:'#F0D62C'},
    {key:'Completed',value:'flag-checkered',color:'#2CF09B'},
    {key:'On Hold',value:'clock',color:'#465DF3'},
    {key:'Dropped',value:'eye-slash',color:'#F34669'}
]
export const schedule = [
    { day: 'Monday', value: 1 },
    { day: 'Tuesday', value: 2 },
    { day: 'Wednesday', value: 3 },
    { day: 'Thursday', value: 4 },
    { day: 'Friday', value: 5 },
    { day: 'Saturday', value: 6 },
    { day: 'Sunday', value: 0 } // Sunday is usually 0 in JS (getDay())
];