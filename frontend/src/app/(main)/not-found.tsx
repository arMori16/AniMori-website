import Link from "next/link";


const NotFound = ()=>{
    return (
        
            <div className="flex flex-grow flex-col bg-gray-300 w-full min-h-screen items-center justify-center">
                <div className="flex flex-co text-white font-bold text-[1.5rem]l">
                    <span>404</span>
                    <span className="ml-2">Not found</span>
                </div>
                <Link href={'/'} className="flex bg-white text-black font-semibold text-[1rem] h-[1.5rem] items-center justify-center w-[5rem] rounded-md">
                    Go Back
                </Link>
            </div>
        
    )
}

export default NotFound;