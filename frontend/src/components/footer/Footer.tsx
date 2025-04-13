
import Image from "next/image";
export default function Footer(){
    return (
        <div className="w-full h-[14rem] bg-gray-1B shadow-[0px_-2px_2px] shadow-gray-200 z-20 flex flex-col">
            <div className="w-full flex h-full p-5">
                <div className="w-[40%] h-full flex flex-col">
                    <p className="text-white font-semibold text-[1.15rem] uppercase mb-1">Наши ресурсы</p>
                    <span className="w-full bg-white h-[2px]"></span>
                    <div className="flex h-[3rem]">

                    </div>
                    <div className="flex">
                        <Image src={`/icons/AnimoriTest.png`} width={60} height={70} alt="logo"/>
                        <p className="text-gray-500 font-medium ml-1 w-[16rem] flex-shrink-0 break-words">Видео на сайте представлены только для ознакомления.</p>
                    </div>
                </div>
            </div>
            <div className="w-full h-[2rem] text-white flex justify-center items-center bg-gray-300">
                <p className="font-medium">&copy; 2025 AniMori.</p>
                <p>All rights are reserved.</p>
            </div>
        </div>
    );
}
