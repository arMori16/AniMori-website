'use client'

import axios from "@/api/axios";
import { getVoicesInfo } from "@/components/player/player.logic";
import voiceStorage from "@/components/useZustand/player/zustandVoice";
import menuStorage from "@/components/useZustand/zustandMenu";
import { getDataView, handleDeleteEpisode, updateSeries } from "@/utils/admin.logic";
import { SeriesInfo } from "@/utils/dto/adminDto/seriesInfo.dto";
import { formatDate, formatToStandard } from "@/utils/formattDate";
import YesNoButton from "@/features/handleYesNoButton";
import useOutsideCommon from "@/hooks/useOutsideCommon";
import ClientPoster from "@/Images/ClientPoster";
import Cookies from "js-cookie";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";

const ViewSeries = ({params}:{params:{seriesName:string}})=>{
    const {getEpisodes,setEpisodes,getVoice,setVoice} = voiceStorage();
    const divRef = useRef<HTMLDivElement>(null); 
    const mainRef = useRef<HTMLDivElement>(null); 
    const [typeOfDelete,setTypeOfDelete] = useState<boolean>(); //True for delete full Voice, False for delete episode
    const [data,setData] = useState<SeriesInfo>();
    const [voices,setVoices] = useState<any[]>([]);
    const [showVoices,setShowVoices] = useState(false);
    const [isShow,setIsShow] = useState<boolean>(false);
    const [showSubmit,setShowSubmit] = useState(false);
    const [submitState,setSubmitState] = useState(false);
    const [isShowEpisode,setIsShowEpisode] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [episode,setEpisode] = useState<any>(1);
    const [file, setFile] = useState<File | null>(null);
    
    const handleFileChange = (e:any) => {
        const selectedFile = e.target.files[0] || null;
        setFile(selectedFile);
    }; 
    
    const {register,handleSubmit,reset,watch,getValues} = useForm<SeriesInfo>({
        defaultValues:{
            AlternitiveNames: data?.AlternitiveNames,
            SeriesName: data?.SeriesName,
            Description: data?.Description,
            SeriesViewName: data?.SeriesViewName,
            Status: data?.Status,
            Type: data?.Type,
            Shikimori: data?.Shikimori,
            ReleaseYear: data?.ReleaseYear,
            Genre: data?.Genre,
            Studio: data?.Studio,
            AmountOfEpisode: data?.AmountOfEpisode,
            VoiceActing: data?.VoiceActing,
            CurrentEpisode:data?.CurrentEpisode,
            NextEpisodeTime:data?.NextEpisodeTime
        }
    })
    const status = watch("Status");

    useEffect(() => {
        if (submitState) {
            if(typeOfDelete){
                handleDeleteEpisode(params.seriesName, getVoice());
            }
            else{
                handleDeleteEpisode(params.seriesName, getVoice(), episode);
            }
        }
    }, [submitState]);
    useEffect(()=>{
        if(!showVoices){
            toggleAnimation();

        }
    },[showVoices])
    const handleUploadFile = async()=>{
        if(!file){
            toast.info('Please select a file!');
            return;
        }
        try{
            const formData = new FormData();
            const atToken = Cookies.get('accessToken');
            formData.append('file',file);
            formData.append('seriesName',params.seriesName);
            formData.append('voice',getVoice());
            formData.append('episode',episode);
            const post = await axios.post('/catalog/upload/video',formData,{
                headers:{
                    'Authorization':`Bearer ${atToken}`,
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent)=> {
                    if(!progressEvent.total) return;
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress); // Update progress
                },
            })
            toast.success('Video uploaded successfully!',{autoClose:false});
        }catch(err){
            console.error(`Couldn't upload!Error: ${err}`);
            toast.error(`Couldn't upload the video!`)
        }
    }
    
    const handleDataSubmit = (data:SeriesInfo)=>{
        console.log(`DATA submit: `,data);
        if(data.NextEpisodeTime){
            try{
                const time = formatToStandard(data.NextEpisodeTime)
                console.log(`DATA FORMATTED: `,time);
                
                updateSeries({...data,NextEpisodeTime:time,CurrentEpisode:Number(data.CurrentEpisode)},params.seriesName);
            }catch(err){
                if(err instanceof RangeError){
                    toast.info('Remember to write the month using only its first three letters.',{autoClose:10000})
                    return toast.error('Invalid date format! Please enter a valid time.(ddMMM HH:mm)',{autoClose:false});
                }
                return toast.error(`${err}`)
            }
        }else{
            updateSeries(data,params.seriesName);
        }
    }
    const handleClear = ()=>{
        reset();
        
    }
    const deleteItem = (type: keyof SeriesInfo, index: number) => {
        // Ensure 'data' exists and that 'type' is an array
        if (data && Array.isArray(data[type])) {
            //GetValues
            const currentData = getValues();
            const typeData = getValues(`${type}`) as string[]
            // Create a new array with the item removed
            const newArray = typeData.filter((_, i) => i !== index);
            // Update the 'data' state with the new array
            setData((prev) => prev ? { ...prev, [type]: newArray } : undefined);
    
            // Optionally, reset the form with the updated 'data'
            reset({ ...currentData, [type]: newArray });
        }
    };
    useEffect(()=>{
        const fetchData = async()=>{
            const data = await getVoicesInfo(params.seriesName);
            console.log(`THIS IS DATA: `,data);
            
            setVoices(data);
            if (data.length > 0) {
                const foundVoice = data.find((item:any) => item.episodes > 0);
                setVoice(foundVoice ? foundVoice.voice : data[0].voice);
                setEpisodes(foundVoice ? foundVoice.episodes : data[0].episodes);
            } else {
                setVoice(null);
                setEpisodes(null);
            }
        }
        fetchData();
    },[]);
    
    const toggleAnimation = () => {
        if (divRef.current && mainRef.current) {
          if (isShow) {
            divRef.current.classList.add("animate-slideVoiceIn");
            setIsShow(false);
            setTimeout(() => {
              divRef.current?.classList.remove("flex");
              mainRef.current?.classList.remove("rounded-b-none","rounded-t-lg","border-b-none");
              mainRef.current?.classList.add("rounded-lg");
              divRef.current?.classList.add("hidden");

              divRef.current?.classList.remove("animate-slideVoiceIn");
            }, 600);
          } else {
            divRef.current.classList.remove("hidden");
            mainRef.current.classList.remove("rounded-lg")
            mainRef.current.classList.add("rounded-b-none","rounded-t-lg","border-b-none")
            divRef.current.classList.add("flex","animate-slideVoiceOut");
            setIsShow(true);
    
            setTimeout(() => {
              divRef.current?.classList.remove("animate-slideVoiceOut");
            }, 600);
          }
        }
      };
    useEffect(()=>{
        const fetchData = async()=>{
            const data = await getDataView(params.seriesName);
            setData(data);
        }
        fetchData()
    },[params.seriesName])
    if(!data){
        return (
            <div className="text-3xl flex text-rose-50 w-full h-full justify-center">Loading...</div>
        )
    }
    
    return(
        <div className="flex flex-col max-w-full w-full min-h-full">
            <form onSubmit={handleSubmit(handleDataSubmit)} className="flex max-w-full w-full max-h-full">
                <div className='flex flex-col relative bg-[#3C3C3C] p-5 w-[68rem] max-w-[96%] max-h-full text-rose-50 rounded-lg flex-wrap'>
                    <div className="flex w-full min-h-[22rem]">
                        <div className='flex relative mr-5 flex-shrink-0 custom-image:mr-0 w-[15.62rem]  h-[21.87rem] custom-image:h-auto'>
                            <ClientPoster divClass="w-full flex" containerClass='flex h-full w-full rounded-lg object-cover' src={`${process.env.NEXT_PUBLIC_API}/media/${params.seriesName}/images`} alt={data.SeriesName}/>
                        </div>
                        <div className='flex flex-col min-h-[22rem]'>
                            <textarea className='text-3xl custom-xs:mt-0 flex bg-transparent min-h-[2.5rem] min-w-[2rem]' defaultValue={data.SeriesViewName} {...register('SeriesViewName')}></textarea>
                            <ul className='flex flex-col gap-y-1 mt-1'>
                            <li className="flex">
                                    <div className='flex gap-1 w-[24rem] flex-wrap'>{data.AlternitiveNames?.map((item:string,index:number)=>(
                                        <div key={index} className="flex bg-gray-100 rounded-xl px-1 pl-2">
                                            <textarea defaultValue={item}  {...register(`AlternitiveNames.${index}`)} className={`flex outline-none max-w-[16rem] break-words bg-transparent hover:border-rose-50 rounded-md font-medium min-w-[2.5rem] text-[0.85rem] mr-1 py-1`}>
                                                
                                            </textarea>
                                            <div className="flex justify-center items-center">
                                                <button onClick={()=>deleteItem("AlternitiveNames",index)} type="button" className="flex text-[0.85rem] rounded-[50%] hover:bg-rose-50 hover:text-[#3C3C3C] h-[1rem] w-[1rem] items-center justify-center">
                                                        ×
                                                </button>
                                            </div>
                                        </div>
                                        ))}
                                         <button type="button" onClick={()=>{
                                            const currentValues = getValues();
                                            if(currentValues.AlternitiveNames === undefined){
                                                setData((prev) => (prev?{...data,AlternitiveNames:['']}:undefined));
                                                reset({...currentValues,AlternitiveNames:['']});
                                            }
                                            else{
                                                const updatedAlternitiveNames:string[] = [...currentValues.AlternitiveNames,""];
                                                setData((prev) => (prev?{...data,AlternitiveNames:updatedAlternitiveNames}:undefined));
                                                reset({...currentValues,AlternitiveNames:updatedAlternitiveNames});
                                            }
                                        }} className="flex h-[1.75rem] text-white rounded-md px border-gray-500 border-2  px-[6px] items-center justify-center">
                                            +
                                        </button>
                                    </div>
                                </li>
                                <li className="flex">
                                    <div className="w-[6rem]">
                                        SeriesName:
                                    </div>
                                    <textarea defaultValue={data.SeriesName} {...register('SeriesName')} className="bg-transparent ml-5 min-w-[2rem]"></textarea>
                                </li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Status:</div>
                                    <textarea className='ml-5 bg-transparent min-w-[2rem]' defaultValue={data.Status} {...register('Status')}></textarea>
                                </li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Shikimori:</div>
                                    <textarea className='ml-5 bg-transparent min-w-[2rem]' defaultValue={data.Shikimori || 'null'} {...register('Shikimori')}></textarea>
                                </li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Type:</div> 
                                    <textarea className='ml-5 bg-transparent min-w-[2rem]' defaultValue={data.Type} {...register('Type')}></textarea></li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Release:</div> 
                                    <textarea className='ml-5 bg-transparent min-w-[2rem]' defaultValue={data.ReleaseYear} {...register('ReleaseYear')}></textarea></li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Genre:</div> 
                                    <div className='flex gap-1 ml-5 w-[24rem] flex-wrap'>{data.Genre.map((item:string,index:number)=>(
                                        <div key={index} className="flex border-2 border-gray-500 bg-transparent rounded-md px-1 pl-[6px]">
                                            <textarea defaultValue={item}  {...register(`Genre.${index}`)} className={`flex outline-none bg-transparent hover:border-rose-50 rounded-md font-medium min-w-[2.5rem] max-w-[12rem] break-words text-[0.85rem] py-[2px] items-center mr-1 justify-center`}>
                                                
                                            </textarea>
                                            <div className="flex justify-center items-center">
                                                <button onClick={()=>deleteItem("Genre",index)} type="button" className="flex text-[0.85rem] rounded-[50%] hover:bg-rose-50 hover:text-[#3C3C3C] h-[1rem] w-[1rem] items-center justify-center">
                                                        ×
                                                </button>
                                            </div>
                                        </div>
                                        ))}
                                        <button type="button" onClick={()=>{/* setGenreItems((prev)=>prev + 1); */
                                            const currentValues = getValues();
                                            const updatedGenre:string[] = currentValues.Genre ? [...currentValues.Genre,""] : [""];
                                            setData((prev) => (prev?{...data,Genre:updatedGenre}:undefined));
                                            reset({...currentValues,Genre:updatedGenre});
                                        }} className="flex h-[1.75rem] text-white rounded-md px border-gray-500 border-2  px-[6px] items-center justify-center">
                                            +
                                        </button>
                                    </div>
                                </li>
                                <li className="flex mt-1">
                                    <div className='w-[6rem]'>Studio:</div> 
                                    <div className='flex gap-1 ml-5 w-[24rem] flex-wrap'>{data.Studio.map((item:string,index:number)=>(
                                        <div key={index} className="flex bg-[#402D9F] rounded-md px-1 pl-[6px]">
                                            <textarea defaultValue={item}  {...register(`Studio.${index}`)} className={`flex outline-none max-w-[12rem] break-words bg-transparent hover:border-rose-50 rounded-md font-medium min-w-[2.5rem] text-[0.85rem] mr-1 py-1`}>
                                                
                                            </textarea>
                                            <div className="flex justify-center items-center">
                                                <button onClick={()=>deleteItem("Studio",index)} type="button" className="flex text-[0.85rem] rounded-[50%] hover:bg-rose-50 hover:text-[#3C3C3C] h-[1rem] w-[1rem] items-center justify-center">
                                                        ×
                                                </button>
                                            </div>
                                        </div>
                                        ))}
                                         <button type="button" onClick={()=>{/* setGenreItems((prev)=>prev + 1); */
                                            const currentValues = getValues();
                                            const updatedStudio:string[] = currentValues.Studio ? [...currentValues.Studio,""] : [""];
                                            setData((prev) => (prev?{...data,Studio:updatedStudio}:undefined));
                                            reset({...currentValues,Studio:updatedStudio});
                                        }} className="flex h-[1.75rem] text-white rounded-md px border-gray-500 border-2  px-[6px] items-center justify-center">
                                            +
                                        </button>
                                    </div>
                                </li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Episodes:</div> 
                                    {status === 'ongoing' && (
                                        <textarea className="ml-5 min-w-[1.25rem] bg-transparent" id="" {...register('CurrentEpisode')} defaultValue={data.CurrentEpisode}></textarea>
                                    )}
                                    {status === 'ongoing' && 'of'}<textarea className={`bg-transparent min-w-[2rem] ${status === 'ongoing' ? 'ml-2':'ml-5'}`} defaultValue={data.AmountOfEpisode} {...register('AmountOfEpisode')}></textarea>
                                    {status === 'ongoing' && (
                                        <div className="flex min-w-[6rem] ml-5 items-center">NextEpisodeTime 
                                            <span className="ml-1 flex items-center justify-center w-[1rem] p-[2px] group relative rounded-[50%] bg-gray-2E">
                                                <i className="fa fa-question text-[0.75rem]"></i> 
                                                <span className="absolute right-[-4.2rem] after:content-['']  after:absolute after:top-full after:border-t-[0.4rem] after:border-r-[0.5rem] after:border-t-black after:border-l-[0.5rem] after:left-[42%] after:border-x-transparent after:right-[44%] whitespace-nowrap pointer-events-none rounded-md py-1 px-2 bottom-[100%] mb-2 opacity-0 bg-black group-hover:opacity-100 transition-all delay-150 duration-500 z-10 translate-y-[6px] group-hover:translate-y-0  ease-out">
                                                    (e.g 08Feb 17:00)
                                                </span>
                                            </span>:
                                            <textarea className="bg-transparent min-w-[2rem] ml-2" {...register('NextEpisodeTime')} defaultValue={data.NextEpisodeTime && formatDate(data.NextEpisodeTime)}></textarea>
                                        </div>
                                    )}
                                </li>
                                <li className="flex">
                                    <div className='w-[6rem]'>Voice:</div>
                                    <div className='ml-5 flex gap-1 w-[17rem] flex-wrap'>{data.VoiceActing.map((item:string,index:number)=>(
                                        <div key={index} className="flex items-center bg-[#4eb997] hover:bg-[#43a083] rounded-md px-1 pl-[6px]">
                                            <textarea defaultValue={item} {...register(`VoiceActing.${index}`)} className='flex max-w-[12rem] break-words outline-none h-[1.50rem] min-w-[2.5rem] bg-transparent rounded-md font-medium text-[0.85rem] py-[2px] px-[2px] items-center justify-center'>
                                                
                                            </textarea>
                                            <div className="flex justify-center items-center">
                                                <button onClick={()=>deleteItem("VoiceActing",index)} type="button" className="flex text-[0.85rem] rounded-[50%] hover:bg-rose-50 hover:text-[#3C3C3C] h-[1rem] w-[1rem] items-center justify-center">
                                                        ×
                                                </button>
                                            </div>
                                        </div>
                                        ))}
                                        {/* {Array.from({length:voiceItem},(_,index)=>(
                                            <textarea {...register(`voiceActing.${data.voiceActing.length + index}`)} key={index} className='flex h-[1.50rem] bg-[#4eb997] hover:bg-[#43a083] min-w-[3.5rem] rounded-md font-medium text-[0.85rem] py-[2px] px-[4px] items-center justify-center'>
                                                
                                            </textarea>
                                        ))} */}
                                        <button type="button" onClick={()=>{
                                            const currentValues = getValues();
                                            const updatedVoice = currentValues.VoiceActing ? [...currentValues.VoiceActing,""] : [""];
                                            setData((prev)=>(prev?{...prev,VoiceActing:updatedVoice}:undefined));
                                            reset({...currentValues,VoiceActing:updatedVoice});
                                        }} className="flex h-[1.75rem] text-white rounded-md px border-gray-500 border-2  px-[6px] items-center justify-center">
                                            +
                                        </button>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className='flex relative break-words w-[43.75rem] mt-9 ml-auto mr-auto'>
                        <textarea className='bg-transparent flex items-start justify-start min-w-[2rem]' defaultValue={data.Description} {...register('Description')}></textarea>
                    </div>
                    <div className="flex w-full h-[4rem] justify-end">
                        <div className="flex w-[10rem] gap-2 h-full mr-[5rem] items-center font-semibold text-[0.85rem]">
                            <button onClick={()=>handleClear()} type="button" className="flex w-[40%] h-[1.75rem] bg-[#B32C25] rounded-md items-center justify-center">
                                clear
                            </button>
                            <button type='submit' className="flex w-[55%] h-[1.75rem] bg-[#5DC090] rounded-md items-center justify-center">
                                submit
                            </button>
                        </div>
                    </div>
                </div>
            </form>
            {/* VoiceActing */}
            <div className="flex flex-col w-[68rem] max-w-[96%] min-h-[15rem] mt-5 p-5 bg-gray-300 rounded-lg">
                <div className="flex w-full h-[3rem]">
                    <div ref={mainRef} className={`flex flex-col rounded-lg box-border h-[1.75rem] relative w-[15rem] bg-gray-100 border-gray-600 border-[1px] font-normal mb-2 text-white text-[0.9rem] px-2`}>
                        <button onClick={()=>{setShowVoices(true);toggleAnimation();}} className="flex h-[1.75rem] relative box-border w-full flex-grow items-center justify-between">
                            <div className="flex h-full items-center w-full flex-grow">
                                Voice {getVoice()}
                            </div>
                            <span className="flex w-[0.1rem] h-[60%] justify-center mr-2 bg-white py-[2px]"></span><img src={`http://localhost:3001/media/down-arrow/icons`} className={`flex w-[1.25rem] transform ${isShow ? 'rotate-[180deg]' : 'rotate-0'} h-[1.25rem] ${isShow ?'animate-downArrowRotateUp':'animate-downArrowRotateDown'}`} />
                        </button>
                        
                        <div className="hidden max-w-[15rem] w-[15rem] left-[-1px] mr-0 box-border max-h-[12rem] absolute p-0 m-0 top-full px-2 bg-gray-100 border-gray-600 border-t-0 rounded-b-lg border-[1px] z-10 overflow-y-scroll" ref={divRef}>
                            <div className="flex flex-col w-full gap-y-2">
                                {voices.length > 0 && voices.map((item,index)=>(
                                    <button key={index} onClick={()=>{toggleAnimation();setVoice(item.voice);setEpisodes(item.episodes)}} className={`flex w-full ${getVoice() === item.voice?'text-gray-300':''}`}>
                                        Voice {item.voice}
                                    </button>
                                ))}
                            </div>       
                        </div>
                    </div>
                    <div className={`flex ml-4 flex-col ${isShowEpisode?'rounded-b-none rounded-t-lg':'rounded-lg'} box-border h-[1.75rem] relative w-[15rem] bg-gray-100 border-gray-600 border-[1px] font-normal mb-2 text-white text-[0.9rem] px-2`}>
                        <button onClick={()=>setIsShowEpisode((prev)=>!prev)} className="flex h-[1.75rem] relative box-border w-full flex-grow items-center justify-between">
                            <div className="flex h-full items-center w-full flex-grow">
                                Episode {episode}
                            </div>
                            <span className="flex w-[0.1rem] h-[60%] justify-center mr-2 bg-white py-[2px]"></span><img src={`http://localhost:3001/media/down-arrow/icons`} className={`flex w-[1.25rem] transform ${isShowEpisode ? 'rotate-[180deg]' : 'rotate-0'} ${isShowEpisode ?'animate-downArrowRotateUp':'animate-downArrowRotateDown'}`} />
                        </button>
                        <div className={`${isShowEpisode?'flex':'hidden'} max-w-[15rem] w-[15rem] left-[-1px] mr-0 box-border max-h-[12rem] absolute p-0 m-0 top-full px-2 bg-gray-100 border-gray-600 border-t-0 rounded-b-lg border-[1px] z-10 overflow-y-scroll`}>
                            <div className="flex flex-col w-full gap-y-2">
                                {Array.from({length:data.AmountOfEpisode},(item:number,index)=>(
                                    <button key={index} onClick={()=>{setIsShowEpisode((prev)=>!prev);setEpisode(index > getEpisodes() + 1? 1 : index + 1)}} className={`flex w-full ${ index > getEpisodes()?'pointer-events-none cursor-not-allowed text-[#c35c6a]':''} ${ index + 1 === episode?'text-gray-300':''}`}>
                                        Episode {index + 1}
                                    </button>
                                
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex max-w-full h-full bg-gray-100 border-gray-600 border-[1px] rounded-[0.25rem]">
                    <label htmlFor="file-upload"  className="flex flex-grow max-w-full h-[9rem] items-center justify-center">
                        {file && (
                            <div>
                                <p className="text-[1rem] font-medium text-rose-50">{file.name}</p>
                            </div>
                        )}
                        <div className={`flex flex-col items-center justify-center ${file?'hidden':''}`}>
                            <img src={`http://localhost:3001/media/upload-icon/icons`} className="flex w-[3.2rem] h-[3.2rem]" alt="" />
                            <p className="flex text-[1rem] font-medium text-rose-50">Upload a video for {getVoice()} for the {episode} Episode</p>
                        </div>
                    </label>
                    <input type="file" accept="video/*" className="hidden" onChange={handleFileChange} id="file-upload"/>
                </div>
                {uploadProgress === null?(<></>):(
                    <div className="flex w-full h-[1.75rem] text-white">
                        <span>{uploadProgress}%  - You need to wait until the message shows!</span>
                    </div>
                )}
                <div className="flex h-[1.85rem] mt-3 max-w-full justify-end">
                    <button onClick={()=>{setShowSubmit(true);setTypeOfDelete(true)}} className="flex h-full max-w-[8rem] w-full rounded-md text-[0.8rem] bg-red-button mr-4 font-medium text-rose-50 items-center justify-center">
                        delete voice
                    </button>
                    {showSubmit && (
                        <YesNoButton setShowSubmit={setShowSubmit} setState={setSubmitState}/>
                    )}
                    <button onClick={()=>{setShowSubmit(true);setTypeOfDelete(false)}} className="flex h-full max-w-[8rem] w-full rounded-md text-[0.8rem] bg-red-button mr-4 font-medium text-rose-50 items-center justify-center">
                        delete episode
                    </button>
                    <button onClick={handleUploadFile} className="flex h-full max-w-[8rem] w-full rounded-md text-[0.8rem] bg-green-400 mr-4 font-medium text-rose-50 items-center justify-center">
                        Add episode
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewSeries;