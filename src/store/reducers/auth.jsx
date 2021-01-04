import { 
    AUTH_START, 
    AUTH_SUCCESS, 
    AUTH_FAIL,
    AUTH_LOGOUT 
} from "../actions/actionTypes";


const initialState = {
    token: null,
    user:null,
    permission:null,
    loading: false
}

const authStart = ( state, action) => {
    return {
        ...state,
        loading: true
    }
}

const authSuccess = ( state, { idToken, user, permission }) => {
    return {
        ...state,
        token: idToken,
        user,
        permission,
        loading: false
    }
}

const authFail = ( state, action) => {
    return {
        ...state,
        loading: false
    }
}

const logout = ( state, action ) => {
    return {
        ...state,
        token: null,
        user:null,
        permission:null,
        loading: false
    }
}

const auth = ( state = initialState, action) => {
    switch( action.type ) {
        case AUTH_START: return authStart( state, action);
        case AUTH_SUCCESS: return authSuccess( state, action);
        case AUTH_FAIL: return authFail( state, action);
        case AUTH_LOGOUT: return logout( state, action);
        default: return state;
    }
}

export default auth;