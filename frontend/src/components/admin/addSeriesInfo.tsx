"use client"
import { addSeries, uploadImage } from "@/utils/admin.logic";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { newSeries } from "./dto/addNewSeries.dto";



const NewSeries = ()=>{
    const [file, setFile] = useState(null);

    const handleFileChange = (e:any) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
    };  
    const handlePostImage = ()=>{
        console.log('It is a postFile!');
        try{
            if(file){
                uploadImage(file);
            }else{
                toast.error(`Have no files in :>`)
                throw new Error(`Can't complete post image function.Error: `);
            }
        }catch(err){
            toast.error(`Can't complete post image!`);
            console.error(err);
        }
    }

    const {handleSubmit,register,reset} = useForm<newSeries>({
        defaultValues:{
            SeriesName:'',
            Description:'',
            SeriesViewName:'',
            AlternitiveNames:[''],
            Status:'',
            Type:'',
            ReleaseYear:0,
            Genre:[''],
            Studio:[''],
            AmountOfEpisode:0,
            VoiceActing:[''],
        }
    })

    const category:(keyof newSeries)[] = [
    'SeriesName',
    'Description',
    'SeriesViewName',
    'AlternitiveNames',
    'Status',
    'Type',
    'ReleaseYear',
    'Genre',
    'Studio',
    'AmountOfEpisode',
    'VoiceActing',
    ]
    const submitHandler = async(data:newSeries)=>{
        await addSeries(data)
    }
    const clearFields = ()=>{
        reset();
    }
    return(
        <div className="flex flex-col max-w-full w-full h-[85%] p-5 bg-[#352877] rounded-md">
            <form onSubmit={handleSubmit(submitHandler)} className="grid gap-y-4 grid-cols-3 grid-rows-5 justify-items-center items-end  max-w-full w-full h-[75%] p-5 text-rose-50">
            {category.map((value,index)=>(
                <div key={index} className="flex flex-col">
                    <div className="flex font-normal text-[1rem]">
                        {value}
                    </div>
                    <div className={`flex w-[12rem] h-[2.25rem] border-2 rounded-md`}>
                        <input type="text" className="flex w-full h-full bg-transparent outline-none p-4" {...register(value)}/>
                    </div>
                </div>
            ))}
            <div className="flex col-start-3 row-span-2 items-center row-start-5 w-full h-[2.50rem] font-medium justify-end">
                <div className="flex w-[30%] h-[70%]">
                    <button onClick={()=>clearFields()} type="button" className="flex w-full h-full bg-[#B32C25] rounded-lg items-center justify-center">delete</button>
                </div>
                <div className="flex w-[40%] ml-2 h-[70%]">
                    <button type="submit" className="flex w-full h-full bg-[#5DC090] rounded-lg items-center justify-center">submit</button>
                </div>
            </div>
            </form>
            <div className="flex w-full items-center justify-center h-[60%] my-auto p-4 row-span-2 col-start-2 row-start-5  text-rose-50 font-medium text-[1rem]">
                <div className="flex flex-col w-[14rem] h-full mr-7">
                    <div className="flex">
                        Upload the Image!
                    </div>
                    <input className="flex w-full h-[3rem] rounded-t-lg bg-[#5b3dbe] text-[0.75rem] cursor-pointer " accept="image/*" type="file" onChange={handleFileChange} placeholder="right here!:>">
                    </input>
                    <div className="flex w-full text-[0.75rem] h-[2.50rem] items-center justify-center bg-[#5b3dbe] p-2 rounded-b-lg">
                        <button onClick={()=>handlePostImage()} className="flex w-[6rem] h-[1.75rem] hover:bg-rose-50 hover:text-[#462E95] ease-in-out transition duration-500 bg-[#462E95] items-center justify-center rounded-md">
                            Send file!
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewSeries;