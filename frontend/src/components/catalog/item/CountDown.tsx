'use client'

import { differenceInSeconds, Duration, intervalToDuration } from "date-fns";
import { useEffect, useState } from "react";

export default function CountDown({ remainingTime, initializeTimeLeft, classProps}: { remainingTime: string, initializeTimeLeft: Duration | null,classProps?: string }) {
    const [timeLeft, setTimeLeft] = useState<{ days: number | null, hours: number | null, minutes: number | null, seconds: number | null } | null>(
        initializeTimeLeft ? {
            days: ((initializeTimeLeft.years ?? 0) * 365 + (initializeTimeLeft.months ?? 0) * 30 + (initializeTimeLeft.days ?? 0)) === 0? null : ((initializeTimeLeft.years ?? 0) * 365 + (initializeTimeLeft.months ?? 0) * 30 + (initializeTimeLeft.days ?? 0)),
            hours: initializeTimeLeft.hours ?? null,
            minutes: initializeTimeLeft.minutes ?? null,
            seconds: initializeTimeLeft.seconds ?? 0
        } : null
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const endDate = new Date(remainingTime);
        
            const currentTime = new Date();
            const remainingTimeLeft = differenceInSeconds(endDate, currentTime);

            if (remainingTimeLeft > 0) {
                const duration = intervalToDuration({ start: 0, end: remainingTimeLeft * 1000 });
                const days = ((duration.years ?? 0) * 365 + (duration.months ?? 0) * 30 + (duration.days ?? 0));
                setTimeLeft({
                    days: days === 0 ? null : days,
                    hours: duration.hours ?? null,
                    minutes: duration.minutes ?? null,
                    seconds: duration.seconds ?? 0
                });
            } else {
                clearInterval(interval);
                setTimeLeft(null);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [remainingTime]);

    return (
        <div className={classProps}>
            {timeLeft !== null && (
                <p>{timeLeft?.days !== null && timeLeft?.days + "d"} {timeLeft?.hours !== null && timeLeft?.hours + "h"} {timeLeft?.minutes !== null && timeLeft?.minutes + "min"} {timeLeft?.seconds !== null && timeLeft?.seconds + 'sec'}</p>
            )}
        </div>
    );
}
