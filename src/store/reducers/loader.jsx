import { 
    LOADER_START, 
    LOADER_STOP 
} from "../actions/actionTypes";

const initialState = {
    loading: false
}

const loaderStart = ( state, action) => {
    return {
        ...state,
        loading: true
    }
}

const loaderStop = ( state, action) => {
    return {
        ...state,
        loading: false
    }
}

const loader = ( state = initialState, action) => {
    switch( action.type ) {
        case LOADER_START: return loaderStart( state, action);
        case LOADER_STOP: return loaderStop( state, action);
        default: return state;
    }
}

export default loader;