import { 
    GET_DATA, 
    SET_DATA, 
} from "../actions/actionTypes";


export const setData = (data) => {
    return {
        type : SET_DATA,
        data
    }
}