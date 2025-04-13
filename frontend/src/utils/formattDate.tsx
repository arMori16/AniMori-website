import { format, formatISO, parse } from "date-fns";

export const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return String(format(date, "dd MMM HH:mm"));
};
export const formatToStandard = (dateString:string) => {
    try{
        const currentYear = new Date().getFullYear();
        const parsedDate = parse(`${dateString} ${currentYear}`, 'ddMMM HH:mm yyyy', new Date());
    
        // Преобразуем в ISO 8601 формат
        console.log(`DateString: `,dateString);
        
        return formatISO(parsedDate, { representation: 'complete' });
    }catch(err){
        throw new RangeError(`${err}`);
    }
};
