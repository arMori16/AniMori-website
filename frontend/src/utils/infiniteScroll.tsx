'use client'
import {debounce} from "lodash";
import axios from "@/api/axios";
import usePageCounter from "@/components/useZustand/zustandPageCounter";
import { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from "react"
import { CommentsDto } from "./dto/adminDto/comments.dto";
import useCommentsCounter from "@/components/useZustand/zustandCommentsCounter";
/* interface Series {
    SeriesViewName:string,
    SeriesName:string
} */
const InfiniteScroll = ({type,fetchedData,children,componentRef,isWindow,styles}:{type:string,isWindow?:boolean,componentRef:RefObject<HTMLDivElement>,fetchedData:any[],children?:React.ReactNode,styles:string})=>{
    const {page,getPage,setPage,setSearchPage,getSearchPage,getUsersPage,setUsersPage} = usePageCounter();
    const {commentPage,getCommentPage,setCommentPage} = useCommentsCounter();
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const typeMapping: Record<
      string,
      { key: string; pageSetter: (num: number) => void, getter: () => number }
    > = {
      series:   { key: "SeriesName", pageSetter: setPage, getter: getPage },
      comments: { key: "Id", pageSetter: setCommentPage, getter: getCommentPage  },
      search:   { key: "SeriesName", pageSetter: setSearchPage, getter: getSearchPage },
      users:    { key: "firstName",pageSetter:setUsersPage, getter: getUsersPage}
    };

    useEffect(()=>{
        console.log('FetchedData: ',fetchedData);
        
        if (fetchedData.length > 0 && fetchedData) {
            setHasMore(fetchedData.length === 15);
            setLoading(false);
        }else{
            console.log('No more data. Setting hasMore to false.');
            setHasMore(false); // No more data to load
        }
    },[page,commentPage,fetchedData])
    const handleScroll = debounce(() => {
        const target = isWindow ? window : componentRef.current;
        if (!target || loading || !hasMore) return;
        
        console.log('It is handleScroll!',loading);
        if (isWindow) {
            // Handle window scrolling
            const scrollTop = window.scrollY;
            const clientHeight = window.innerHeight;
            const scrollHeight = document.documentElement.scrollHeight;
      
            if (scrollTop + clientHeight >= scrollHeight * 0.75) {
              setLoading(true);
              typeMapping[type].pageSetter(typeMapping[type].getter() + 1);
            }
          } else if (componentRef.current) {
            // Handle div scrolling
            const scrollTop = componentRef.current.scrollTop;
            const clientHeight = componentRef.current.clientHeight;
            const scrollHeight = componentRef.current.scrollHeight;
      
            if (scrollTop + clientHeight >= scrollHeight * 0.75) {
              setLoading(true);
              console.log('IM HERE');
              typeMapping[type].pageSetter(typeMapping[type].getter() + 1);
            }
          }
      },300);
      useEffect(() => {
        const target = isWindow ? window : componentRef.current;
    
        if (target) {
          target.addEventListener("scroll", handleScroll);
        }
    
        return () => {
          if (target) {
            target.removeEventListener("scroll", handleScroll);
          }
        };
      }, [hasMore]);
    return (
        <div className={styles}>
            {children}
        </div>
    )
}
export default InfiniteScroll;