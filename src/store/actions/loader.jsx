import { 
    LOADER_START,
    LOADER_STOP 
    
} from "../actions/actionTypes";

export const loaderStart = () => {
    return {
        type: LOADER_START
    }
}

export const loaderStop = () => {
    return {
        type: LOADER_STOP
    }
}



