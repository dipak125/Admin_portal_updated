import { 
    SET_DATA, 
} from "../actions/actionTypes";

const initialState = {
    data: null
}

const setData = ( state, { data }) => {
    return {
        ...state,
        data: data,
    }
}


const processData = ( state = initialState, action) => {
    switch( action.type ) {
        case SET_DATA: return setData( state, action);
        default: return state;
    }
}

export default processData;