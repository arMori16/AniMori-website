'use client';

import { useEffect, useRef, useState } from 'react';
import { deleteUserRate, getSeriesRate, getUserRate, setSeriesRate } from './item.logic';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

const Rating = ({ initialRate, initialUserRate,seriesName}: { initialRate: number,seriesName: string,initialUserRate: number | null}) => {
    const [isShow, setIsShow] = useState<boolean>(false);
    const [trigger,setTrigger] = useState<boolean>(false);
    const [rate, setRate] = useState<number>(initialRate);
    const [userRate, setUserRate] = useState<number | null>(initialUserRate);

    const divRef = useRef<HTMLDivElement>(null);
    
    const handleRateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsShow(true);
    };

    useEffect(() => {
        const handleClickOutside = (event:MouseEvent) => {
            if (divRef.current && !divRef.current.contains(event.target as Node)) {
                setIsShow(false);
            }
        };

        if (isShow) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isShow]);
    const handleRateSubmit = async (selectedRate: number) => {
        try {
            // Set the user's rate first
            setUserRate(selectedRate);

            // Submit the new rate to the backend
            await setSeriesRate(seriesName, selectedRate);

            // Fetch and update the series rate
            const updatedRate = await getSeriesRate(seriesName);
            console.log(`UPDATED RATE: `,updatedRate.avgRate);
            
            setRate(updatedRate.avgRate);

            // Close the rating modal
            setIsShow(false);
        } catch (error) {
            console.error('Error updating rate:', error);
        }
    };
    const items = [
        { rate: 10, label: 'masterpiece' },
        { rate: 9, label: 'excellent' },
        { rate: 8, label: 'very good' },
        { rate: 7, label: 'good' },
        { rate: 6, label: 'not bad' },
        { rate: 5, label: 'mediocre' },
        { rate: 4, label: 'no way' },
        { rate: 3, label: 'bad' },
        { rate: 2, label: 'terrible' },
        { rate: 1, label: 'insignificant' },
    ];
    const deleteUserSeriesRate = async() =>{
        await deleteUserRate(seriesName);
        setUserRate(null);
        const updatedRate = await getSeriesRate(seriesName);
        setRate(updatedRate);
        setIsShow(false)
    }
    return (
        <div className="flex h-[2.35rem] max-sw-full items-center">
            <button onClick={handleRateClick} type='button' className="flex w-[1.25rem] z-20 h-[1.25rem]">
                <img
                    src={`/icons/star.svg`}
                    className="flex w-full h-full"
                    alt=""
                />
            </button>
            {isShow && (
                <div className="flex fixed inset-0 z-30 bg-black bg-opacity-40 items-center justify-center">
                    <div
                        className="flex flex-col bg-gray-200 w-[19rem] z-35 h-[25rem] rounded-md border-b-[0.25rem] border-green-400 overflow-hidden"
                        ref={divRef}
                    >
                        <div className="flex w-full relative h-[2.5rem] bg-green-400 text-white font-medium text-[0.9rem] items-center justify-center">
                            My Rate
                            <button onClick={()=>{userRate ? deleteUserSeriesRate() : toast.info(`Before deleting the rate,please make sure to set it :)`)}} className='absolute right-0 mr-2 h-[1.5rem] w-[1.5rem]'>
                                <img src="http://localhost:3001/media/delete.svg/icons" className='w-ful h-full' alt="" />
                            </button>
                        </div>
                        <div className="flex flex-col w-full h-full justify-center">
                            {items.map(({ rate, label }) => (
                                <button
                                    onClick={() => {handleRateSubmit(rate)}}
                                    key={rate}
                                    className="flex h-[2.26rem] px-2 text-[0.85rem] w-full border-b-[1px] items-center border-gray-500"
                                >
                                    {rate} - {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            <div className="flex ml-[6px] mr-2 h-[76%] rounded-md w-[3.5rem] items-center justify-center text-[1.25rem] text-white font-medium bg-orange-yellow">
                {(typeof rate === "number" ? rate : 0).toFixed(2)}
    
            </div>
            {userRate && (
                <div className='flex w-[3rem] h-[1.25rem] items-center'>
                    <img
                            src={`/icons/star.svg`}
                            className="flex w-[30%] h-[60%]"
                            alt=""
                        />
                    <span className='text-orange-200 ml-[2px]'>{userRate}</span>
                </div>
            )}
        </div>
    );
};

export default Rating;
