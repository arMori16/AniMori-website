'use client'
import { SelectQuality } from "./selectQuality";
import usePlayer from "./usePlayer";
import '@/components/player/player.css'
import { Loader, LucideVolumeOff, Maximize, Pause, Play, PlaySquare, RotateCcw, RotateCwIcon, Video, Volume1, Volume2 } from "lucide-react";
import  volumeLogic, { initializeVideoControls } from "./videoLogic";
import { useEffect, useRef, useState } from "react";
import numOfEpisodeStorage from "../useZustand/player/zustandNumOfEpisode";
import voiceStorage from "../useZustand/player/zustandVoice";
import { io, Socket } from 'socket.io-client';
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import useOutsideCommon from "@/hooks/useOutsideCommon";


const Player = ({ seriesViewName,seriesName }: { seriesName: string,seriesViewName: string })=>{
    const [isControlsVisible, setIsControlsVisible] = useState(false); // Состояние видимости контролов
    const {playRef,isLoading,setIsLoading,togglePlayPause,changeQuality,toggleFullScreen,setIsPlaying,quality,isPlaying,isShowPlay,setIsShowPlay,toggleShowPlay,skipTime} = usePlayer(seriesName,seriesViewName);
    const {numOfEpisode,getNumOfEpisode,updateNumOfEpisode} = numOfEpisodeStorage();
    const [isShowYesNo,setIsShowYesNo] = useState(false);
    const componentRef = useRef<HTMLDivElement>(null);
    const [isShowOne,setIsShow] = useState(false);
    useOutsideCommon({refs:[componentRef],onOutsideClick:()=>setIsShow(false)});
    const [roomData,setRoomData] = useState<any>(null);
    const [participantsData,setParticipantsData] = useState<any[] | null>(null);
    const [join,setJoin] = useState(false);
    const [roomCode,setRoomCode] = useState(null);
    const [copy,setCopy] = useState(false);
    const socketRef = useRef<Socket | null>(null);
    const atToken = Cookies.get('accessToken');
    const {getVoice,getEpisodes,setVoice,episodes} = voiceStorage();
    const toggleControlsVisibility = () => {
        setIsControlsVisible((prev) => !prev); 
    };
    if(episodes !== 0 && episodes !== null && episodes !== undefined){
        initializeVideoControls('video','.player-container',socketRef,setIsPlaying);
        volumeLogic();
    }
    useEffect(()=>{
        if (performance.navigation.type === 1 && Cookies.get("socket")) {
            setIsShowYesNo(true);
        }
        if(atToken && Cookies.get("socket")){
            
            const fetchRoomData = async () => {
                socketRef.current = io(`${process.env.NEXT_PUBLIC_API}`, {
                    auth: { token: atToken },
                });
                socketRef.current.emit('reconnect');
                socketRef.current.once('reconnected',(response)=>{
                    console.log(`RESPONSE: `,response);
                    const newRoomData = {...response.hostInfo,isHost:response.isHost} 
                    setRoomData(newRoomData);
                    setParticipantsData(response.participants);
                    if(response.isHost){
                        if(!socketRef.current?.hasListeners("left")){
                            socketRef.current?.off('left')
                            socketRef.current?.on('left',(leftPerson)=>{
                                if(leftPerson){
                                    setParticipantsData((prev) => {
                                        const newParticipants = prev?.filter((item) => item.UserId !== leftPerson.UserId) || null;
                                        console.log(`New participants after filter: `, newParticipants);
                                        return newParticipants;
                                    });
                                    toast.info(`${leftPerson.UserName} left the room`);
                                }else{
                                    toast.info('You left the room')
                                }
                            })
                        }
                        socketRef.current?.on('joinedRoom', (data) => {
                            setParticipantsData([...data.participants]);
                            toast.success(`The user joined!`);
                        }); 
                    }else{
                        socketRef.current?.off('joinedRoom');
                        socketRef.current?.on('handleTimeUpdate',(data)=>{
                            if(!playRef.current) return;
                            playRef.current.currentTime = data.time;
                        })
                        socketRef.current?.on('joinedRoom', (data) => {
                            console.log(`DATA HOST: `,data);
                            setJoin(false);
                            setRoomCode(null);
                            const newRoomData = {...data.hostInfo,IsHost:data.IsHost};
                            setRoomData(newRoomData);
                            setParticipantsData([...data.participants]);
                            Cookies.set("socket","true");
                        });
                        socketRef.current?.on('episode',(data)=>{
                            updateNumOfEpisode(data.playInfo.episode);
                        })
                        socketRef.current?.on('left',(leftPerson)=>{
                            if(leftPerson){
                                console.log(`leftPERSON IS HOST?: `,leftPerson.IsHost);
                                
                                if(leftPerson.IsHost){
                                    setRoomData(null);
                                    setParticipantsData(null);
                                    socketRef.current?.removeAllListeners();
                                    socketRef.current = null;
                                    console.log(`IT SHOULD WORK LEAVE!`);
                                    
                                    Cookies.remove("socket");
                                    toast.info('The room host left')
                                    return;
                                };
                                setParticipantsData((prev) => {
                                    const newParticipants = prev?.filter((item) => item.UserId !== leftPerson.UserId) || null;
                                    console.log(`New participants after filter: `, newParticipants);
                                    return newParticipants;
                                });
                                toast.info(`${leftPerson.UserName} left the room`);
                            }else{
                                toast.info('You left the room')
                            }
                        })
                    }
                });
            };
            fetchRoomData();
        }
    },[]);
    useEffect(()=>{
        console.log(`RoomData HOST? `,roomData);
        if(socketRef.current && roomData && roomData.isHost){
            const playInfo = {episode:getNumOfEpisode(),voice:getVoice()}
            socketRef.current.emit("episode",{playInfo:playInfo,roomInfo:roomData.room})
        }
        if(isShowPlay) return;
        
        setIsPlaying(false);
        setIsShowPlay(true);
        toggleControlsVisibility();
    },[numOfEpisode])
    useEffect(() => {
        if (!atToken || !Cookies.get("socket")) return;
        
        if (!socketRef.current) {
            console.log(`SOCKET NETU :(`);
            
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API}`, {
                auth: { token: atToken },
                reconnection:true
            });
        }
        
        const socket = socketRef.current;
        
        const playVideoHandler = (data: any) => {
            if(!playRef.current) return;
            if(data.playInfo.episode !== getNumOfEpisode() || data.playInfo.voice !== getVoice()){
                updateNumOfEpisode(data.playInfo.episode);
                setVoice(data.playInfo.voice);
                playRef.current.src = `${process.env.NEXT_PUBLIC_API}/catalog/${seriesName}/${encodeURIComponent(getVoice())}/${getNumOfEpisode()}/${quality}`;
            }
            console.log(`TIME :: `,data.time);
            playRef.current.currentTime = data.time
            if (isShowPlay) {
                toggleShowPlay();
                toggleControlsVisibility();
            } else {
                console.log(`OOOH YEAH!`);
                
                togglePlayPause();
            }
        };
    
        // Ensure that multiple event listeners are not attached
        socket.off('playVideo');
        socket.on('playVideo', (data)=>{
            playVideoHandler(data);
        });
    
        return () => {
            socket.off('playVideo');
        };
    }, [atToken, isPlaying,isShowPlay,roomData]);
    
    /* Multiplayer logic */
    const createRoom = () => {
        if (!atToken) {
            toast.info('Before creating the room make sure you are registered!');
            return;
        }
        if (!socketRef.current) {
            // Initialize the socket connection only when needed
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API}`, {
                auth: { token: atToken },
                reconnection:true
            });

        }
        
        socketRef.current.on('left',(leftPerson)=>{
            if(leftPerson){
                setParticipantsData((prev) => {
                    const newParticipants = prev?.filter((item) => item.UserId !== leftPerson.UserId) || null;
                    console.log(`New participants after filter: `, newParticipants);
                    return newParticipants;
                });
                toast.info(`${leftPerson.UserName} left the room`);
            }else{
                toast.info('You left the room')
            }
        })
        
        socketRef.current.on('joinedRoom', (data) => {
            setParticipantsData([...data.participants]);
            toast.success(`The user joined!`);
        });
        socketRef.current.once('roomCreated', (data) => {
            setRoomData(data);
            Cookies.set("socket","true");
            toast.success(`Room created, code: ${data.room.Code}`);
        });
        
        socketRef.current.emit('createRoom', { seriesName });
    };
    const joinRoom = ()=>{
        if (!atToken) {
            toast.info('Before creating the room make sure you are registered!');
            return;
        }
        if (!socketRef.current) {
            // Initialize the socket connection only when needed
            socketRef.current = io(`${process.env.NEXT_PUBLIC_API}`, {
                auth: { token: atToken },
                reconnection:true
            });
        }
        socketRef.current.off();
        socketRef.current.on('left',(leftPerson)=>{
            if(leftPerson){
                
                if(leftPerson.IsHost){
                    setRoomData(null);
                    setParticipantsData(null);
                    socketRef.current?.removeAllListeners();
                    socketRef.current = null;
                    console.log(`IT SHOULD WORK LEAVE!`);
                    
                    Cookies.remove("socket");
                    toast.info('The room host left')
                    return;
                };
                setParticipantsData((prev) => {
                    const newParticipants = prev?.filter((item) => item.UserId !== leftPerson.UserId) || null;
                    console.log(`New participants after filter: `, newParticipants);
                    return newParticipants;
                });
                toast.info(`${leftPerson.UserName} left the room`);
            }else{
                toast.info('You left the room')
            }
        })
        socketRef.current.on('episode',(data)=>{
            console.log(`NEW EPISODE: `,data.playInfo.episode);
            
            updateNumOfEpisode(data.playInfo.episode);
        })
        socketRef.current.on('handleTimeUpdate',(data)=>{
            if(!playRef.current) return;
            playRef.current.currentTime = data.time;
        })
        socketRef.current.on('joinedRoom', (data) => {
            console.log(`DATA HOST: `,data);
            setJoin(false);
            setRoomCode(null);
            console.log(`DaTA FOR JOINED: `,data);
            
            const newRoomData = {...data.hostInfo,isHost:data.isHost};
            setRoomData(newRoomData);
            setParticipantsData([...data.participants]);
            Cookies.set("socket","true");
        });
        /* Functions */
        socketRef.current.emit('joinRoom', { seriesName,roomCode });
    }
    const copyText = ()=>{
        navigator.clipboard.writeText(roomData?.room.Code);
        setCopy(true);
        setTimeout(()=>{
            setCopy(false);
        },10000)
    }
    const leaveTheRoom = ()=>{
        console.log(`LEAVE THE ROOM`);
        
        socketRef.current?.emit('leave');
        socketRef.current?.once('left',(data)=>{
            setRoomData(null);
            setParticipantsData(null);
            socketRef.current?.removeAllListeners();
            socketRef.current = null;
            console.log(`IT SHOULD WORK LEAVE!`);
            
            Cookies.remove("socket");
        })
    }

    /* Multiplayer functions */
    const handlePlay = ()=>{
        console.log(`HOST? `,roomData.isHost);
        
        if(socketRef.current && roomData.isHost){
            
            const currentTime = playRef.current?.currentTime;
            const playInfo = {episode:getNumOfEpisode(),voice:getVoice()}
            socketRef.current.emit("playVideo",{playInfo:playInfo,roomInfo:roomData.room,time:currentTime})
        }
    }
    return (
    <>
        {isShowYesNo && (
            <div className="flex absolute z-30 rounded-xl transition-all scale-115 duration-500 ease-out inset-0 items-center justify-center bg-black bg-opacity-35" >
            <div className="flex flex-col w-[28rem] z-50 h-[16rem] mb-[5rem] bg-white rounded-lg shadow-[0px_0px_5px_white]">
                <div className="flex h-[3rem] w-full mt-8 justify-center">
                    <img src={`${process.env.NEXT_PUBLIC_API}/media/warning/icons`} className="w-[3rem] h-full" alt="" />
                </div>
                <div className="flex flex-col h-[3.25rem] max-w-full flex-grow mt-1 items-center  text-[1.25rem] font-semibold pointer-events-none">
                    Continue?
                    <div className="flex text-[0.8rem] font-medium">
                        Do you want to continue using multiplayer?
                    </div>
                </div>
                <div className="flex max-w-full justify-center flex-grow">
                    <button onClick={()=>{
                        setIsShowYesNo(false);
                        socketRef.current?.emit('leave');
                        setRoomData(null);
                        setParticipantsData(null);
                        socketRef.current?.removeAllListeners();
                        socketRef.current = null;
                        console.log(`IT SHOULD WORK LEAVE!`);
                        
                        Cookies.remove("socket");
                    }} className="flex bg-gray-800 text-gray-500 h-[3rem] rounded-[0.25rem] w-[45%] items-center justify-center p-1">
                        Cancel
                    </button>
                    <button onClick={()=>setIsShowYesNo(false)} className="flex text-white bg-green-400 h-[3rem] ml-2 rounded-[0.25rem] w-[45%] items-center justify-center p-1">
                        Continue
                    </button>
                </div>
            </div>
        </div>
        )}
        {episodes !== 0 && episodes !== null && episodes !== undefined ? (
            <div className={`overflow-hidden flex flex-col z-10 mt-5 player-container max-h-[34rem] relative w-[100%] max-w-[62.5rem]`}data-volume-level={'high'}>
                {isShowPlay && (
                    <div className="w-[100%] inset-0 absolute bg-black rounded-md z-10 flex items-center justify-center">
                        <button className="w-[100%] h-full flex items-center justify-center z-20" onClick={()=>{!socketRef.current ? (toggleShowPlay(),toggleControlsVisibility()) : socketRef.current && roomData.isHost && handlePlay();
                        }}>
                            <Play className="flex relative mytest w-[100px] h-[100px]"/>
                        </button>
                    </div>
                )}
                {isShowOne &&  (
                    <div className="flex justify-end w-full left-0 absolute h-full z-10">
                        <div className="flex flex-col w-[15rem] h-full bg-gray-200 shadow-[-2px_0px_8px_rgba(255,255,255,0.4)] z-10 rounded-r-md p-2 items-center" ref={componentRef}>
                            {roomData === null && !join? (
                                <div className="flex flex-col w-full h-full">
                                    <div className="flex w-full h-[2.5rem] rounded-md duration-500 ease-in hover:bg-[rgba(255,255,255,0.4)]">
                                        <button onClick={()=>{createRoom()}} className="flex text-white items-center font-medium ml-[21%]">
                                            Create a room 
                                            <i className="fa-solid fa-people-group text-[1.5rem] ml-2"></i>
                                        </button>
                                    </div>
                                    <div className="flex w-full h-[2.5rem] rounded-md duration-500 ease-in mt-2 hover:bg-[rgba(255,255,255,0.4)]">
                                        <button onClick={()=>setJoin(true)} className="flex text-white ml-[22%] items-center font-medium">
                                            Join a room 
                                            <img src={`${process.env.NEXT_PUBLIC_API}/media/man.svg/icons`} className="w-[2rem] scale-125 h-[1.5rem] ml-1" alt="" />
                                        </button>
                                    </div>
                                </div>
                            ): !join && (
                                <div className="flex flex-col items-start w-full h-full font-medium text-white">
                                    <p>Room Id: {roomData?.room.Id}</p>
                                    <div className="flex relative mt-2 w-full h-[2.5rem]">
                                        <div className="flex ml-[2rem] overflow-x-scroll scrollbar-hide whitespace-nowrap pr-1 text-ellipsis max-w-full items-center">{roomData?.host.firstName}</div>
                                        <span className="flex pt-2 items-center ml-[2px]">
                                            <span className="flex h-[0.9rem] group relative">
                                                <i className="fa-solid fa-star text-[0.65rem] text-[#63E6BE]"></i>
                                                <span className="absolute after:content-['']  after:absolute after:top-full after:border-t-[0.4rem] after:border-r-[0.65rem] after:border-t-black after:border-l-[0.65rem] after:left-[42%] after:border-x-transparent left-[-4.25rem] after:right-[44%] whitespace-nowrap pointer-events-none rounded-md py-1 px-2 bottom-[100%] opacity-0 bg-black group-hover:opacity-100 transition-all delay-150 duration-500 z-20 translate-y-[2px] group-hover:translate-y-[-8px]  ease-out">This user is a host</span>
                                            </span>
                                        </span>
                                    </div>
                                    {Array.isArray(participantsData) ? participantsData.map((item:any,index:number)=>(
                                        <div key={index} className="flex w-full pl-[2rem] h-[2rem] items-center overflow-hidden text-ellipsis">
                                            {item.UserName}<i className="fa-solid fa-circle text-green-400 ml-1 pt-[2px] text-[0.5rem]"></i>
                                        </div>
                                    )) : null} 
                                    <div className="flex justify-center mb-1 mt-auto w-full h-[2.25rem]">
                                        <button onClick={leaveTheRoom} className="flex justify-center w-[90%] hover:bg-[#992a2a] h-full items-center px-1 bg-red-button rounded-md font-medium">Leave</button>
                                    </div>
                                    <div className="flex relative mt-1 mb-2 w-full h-[2.25rem] bg-gray-300 rounded-md">
                                        <div className="flex w-[9rem]">
                                            <span className="p-2 pr-[1.40rem] pt-[6px] rounded-md whitespace-nowrap outline-none absolute overflow-hidden w-full text-ellipsis bg-gray-300 h-full" title={roomData?.room.Code}>{roomData?.room.Code}</span>
                                        </div>
                                        <button onClick={copyText} className="absolute right-2 bottom-[18%] group cursor-pointer">
                                            <i className="fa fa-copy text-white hover:text-green-400 text-[1rem]"></i>
                                            <span className={`absolute after:content-[''] after:absolute after:top-full after:border-t-[0.4rem] after:border-r-[0.65rem] after:border-t-black after:border-l-[0.65rem] after:left-[34%] after:border-x-transparent ${copy ? 'left-[-2.30rem]' : 'left-[-1.6rem]'} mb-[2px] after:right-[44%] whitespace-nowrap pointer-events-none rounded-md py-1 px-2 bottom-[100%] opacity-0 bg-black group-hover:opacity-100 transition-all delay-150 duration-500 z-50 translate-y-[6px] group-hover:translate-y-0  ease-out`}>{copy ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {join && (
                                <div className="flex flex-col w-full h-full text-white">
                                    <div className="flex w-full h-[2.5rem]">
                                        <button onClick={()=>setJoin(false)}><i className="fa fa-arrow-left-long text-[1.5rem]"></i></button>
                                    </div>
                                    <div className="flex w-full h-[2.25rem] mt-1 rounded-md overflow-hidden">
                                        <textarea onChange={(e:any)=>setRoomCode(e.target.value)} className="p-1 pt-[6px] whitespace-nowrap overflow-x-scroll scrollbar-hide flex w-full h-full outline-none bg-gray-300"></textarea>
                                    </div>
                                    <div className="flex w-full h-[2rem] justify-center mt-2">
                                        <button onClick={joinRoom} className="flex items-center justify-center hover:bg-gray-300 ease-in-out active:bg-green-400 duration-300 text-[0.75rem] w-[80%] bg-gray-2E rounded-sm font-medium"> Join the Room</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                {(
                    <button onClick={(e:any)=>{e.stopPropagation();setIsShow((prev)=>!prev);
                    }} className={`absolute ${isShowOne ? 'rotate-90 right-[15.5rem]':'right-5'} top-5 z-50 toggle-button`}><i className="fa fa-list text-white text-[2rem] mr-2"></i></button>
                )}
                {isLoading && (
                    <div className="bg-black rounded-t-lg  w-[100%] h-full z-[101] inset-0 flex items-center justify-center absolute">
                        <Loader className="loading" color="white" width={50} height={50}/>
                    </div>
                )}
                <div className="flex rounded-t-xl flex-grow overflow-hidden items-center justify-center">
                    <video ref={playRef} onClick={()=>togglePlayPause()} controls={false} className='block flex-grow w-full object-contain video relative max-h-auto rounded-lg' src={`${process.env.NEXT_PUBLIC_API}/catalog/${seriesName}/${encodeURIComponent(getVoice())}/${getNumOfEpisode()}/1080p`}></video>
                </div>
                    <div className={`flex backdrop-blur-xl ${isShowPlay ? 'hidden' : 'visible'} controls ${isControlsVisible ? 'flex visible' : 'hidden'} absolute z-0 custom-xs:p-[6px] bottom-0 inset-x-0 flex-grow max-w-full items-center p-3 justify-between`}>
                        <div className="flex items-center">
                            <button onClick={()=>skipTime('backward')} className="custom-xs:hidden"><RotateCcw color="white"/></button>
                            <button onClick={()=>{!socketRef.current ? togglePlayPause() : socketRef.current && roomData.isHost &&handlePlay()}}>
                                {isPlaying ? <Pause className="pause-icon custom-xs:w-[0.85rem] custom-xs:h-[0.85rem]" color="white"/> : <Play className="custom-xs:w-[0.85rem] custom-xs:h-[0.85rem]" color="white"/>}
                            </button>
                            <button onClick={()=>skipTime('forward')} className="custom-xs:hidden"><RotateCwIcon color="white"/></button>
                        </div>
                        <div className="duration-container flex w-[88%]  text-white items-center custom-xs:ml-1 relative ml-5">
                            <div className="current-time relative mr-2 ml-2 custom-xs:text-[0.75rem]"></div>
                                <div className="timeline-container relative mr-auto w-[100%] flex h-2 items-center">
                                    <div className="timeline flex w-[100%] relative mr-auto h-[6px] bg-white">
                                        <div className="thumb-indicator"></div>
                                    </div>
                                </div>
                            <div className="total-time relative flex ml-2 mr-5 custom-xs:mr-1 w-auto custom-xs:text-[0.75rem]"></div>
                        </div>
                        <div className={`flex ml-auto volume-container right-0 relative`}>
                            <button className="mutedBtn flex relative custom-xs:w-[1.5rem] custom-xs:h-[1.5rem]" >
                                <Volume2 color="white" className="flex mr-2 volume-high-icon"/>
                                <Volume1 color="white" className="flex mr-2 volume-low-icon"/>
                                <LucideVolumeOff color="white" className="flex mr-2 volume-muted-icon"/>
                            </button>
                            <div className="flex relative slider-range items-center">
                                <div className="flex relative volume-slider">
                                    <input className="flex custom-range mr-1 custom-md:scale-x-100 custom-md:w-[2rem] relative " type="range"  min='0' max='1' step='any'/>
                                </div>
                            </div>
                        </div>
                        <div className="flex quality-maximize-btn right-0 relative justify-between">
                            <SelectQuality currentValue={quality} onChange={changeQuality}/>
                            <button onClick={toggleFullScreen} className="full-screen-btn">
                                <Maximize color="white" className="custom-xs:w-[0.75rem] custom-xs:h-[0.75rem]"/>
                            </button>
                        </div>
                    </div>
                </div>
        ):(
            <div className="flex rounded-md w-full h-[2.5rem] items-center pl-5 text-white font-semibold bg-[#28c46e]">
                <p>There is no video :(</p>
            </div>
        )}


    </>

    );
}

export default Player;