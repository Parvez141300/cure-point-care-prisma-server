import {parse, isValid} from "date-fns";

export const convertDateTime = (dateString: string | undefined) => {
    if(!dateString) return "";

    const date = parse(dateString, "yyyy-MM-dd", new Date());

    if(!isValid(date)) return "";

    return date;
}