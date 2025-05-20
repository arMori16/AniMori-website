import { format, formatISO, parse } from "date-fns";

export const formatDate = (isoString: string | Date): string => {
    const date = new Date(isoString);
    return String(format(date, "dd MMM HH:mm"));
};
export const formatToStandard = (dateString:string) => {
    try{
        const currentYear = new Date().getFullYear();
        const parsedDate = parse(`${dateString} ${currentYear}`, 'dd MMM HH:mm yyyy', new Date());
    
        // Преобразуем в ISO 8601 формат
        console.log(`DateString: `,dateString);
        
        return formatISO(parsedDate, { representation: 'complete' });
    }catch(err){
        throw new RangeError(`${err}`);
    }
};
export const formatToYYMMDD = (date:string | Date)=>{
    const parsedDate = new Date(date);
    const result = new Date().getFullYear() === parsedDate.getFullYear() ? format(parsedDate,'MMM dd') : format(parsedDate,'dd MMM yyyy');
    return result
}