import axios from "../../shared/axios";
import Encryption from '../../shared/payload-encryption';

import { 
    AUTH_START, 
    AUTH_SUCCESS, 
    AUTH_FAIL,
    AUTH_LOGOUT 
} from "../actions/actionTypes";

const authStart = () => {
    return {
        type: AUTH_START
    }
}

const authFail = ( error ) => {
    return {
        type: AUTH_FAIL,
        error: error
    }
}

const authSuccess = ({ token, user, permission, lastAction}) => {
    return {
        type: AUTH_SUCCESS,
        idToken: token,
        user,
        permission,
        lastAction
    }
}

const checkLastActionPerformed = (actionTime) => {
    //console.log('actionTime', actionTime);
    //console.log(parseInt(actionTime));
    const now = Date.now();
    const timeleft = parseInt(actionTime) + 60 * 60 * 1000;   // 60 mins until auto logout
    const diff = timeleft - now;
    const isTimeout = diff < 0;
    //console.log('diff', diff);
    //console.log('isTimeout', isTimeout);
    if (isTimeout) {
        //console.log('Logout');
        return false;
    }
    //console.log('Continue...');
    return true;
}

export const authLogout = () => {
    // localStorage.removeItem('auth_token');
    // localStorage.removeItem('users');
    // localStorage.removeItem('policyHolder_id');
    // localStorage.removeItem('policyHolder_refNo');
    // sessionStorage.removeItem('pan_data');
    // sessionStorage.removeItem('email_data');
    // sessionStorage.removeItem('proposed_insured');
    // sessionStorage.removeItem('display_looking_for');
    // sessionStorage.removeItem('display_dob');
    localStorage.clear()
    sessionStorage.clear()

    return {
        type: AUTH_LOGOUT
    }
}

export const authProcess = (data, onSuccess, onFailure) => {
    return dispatch => {
        // Auth Start
        dispatch(authStart());
        // Auth Processing
        const formData = new FormData();

        const post_data_obj = {
            'email': data.emailAddress,
            'password':data.password
        }
        let encryption = new Encryption();
        
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        axios
            .post('/login', formData)
            .then(response => {
                dispatch(authSuccess(response.data));
                let loginData;
                if(data.rememberMe == '1') {
                    loginData = {email: data.emailAddress, pass: data.password, rememberMe: data.rememberMe};
                } else {
                    loginData = {email: '', pass: '', rememberMe: ''};
                }
                localStorage.setItem('auth_token', response.data.token_type+" "+response.data.token);
                // localStorage.setItem('users', JSON.stringify({ user: response.data.user, permission: response.data.permission, lastAction: Date.now() }));
                localStorage.setItem('users', JSON.stringify({ user: response.data.user_data, permission: [], lastAction: Date.now() }));
                localStorage.setItem('loginData', JSON.stringify( loginData ));
                // var cscData = JSON.parse(response.data.user_data.info);
                // localStorage.setItem('csc_id', cscData["csc_id"]);
                // localStorage.setItem('agent_name', cscData["fullname"]);
                // localStorage.setItem('product_id', cscData["productId"]);
                onSuccess && onSuccess();
            })
            .catch(error => {
                dispatch(authFail(error));
                onFailure && onFailure(error);
            })
    }
}

export const authValidate = () => {
    return dispatch => {

        const token = localStorage.getItem('auth_token');
        if (token) {
            const users = localStorage.getItem('users');
            if (users) {
                const items = JSON.parse(users);                

                // Checking last action performed time
                if(checkLastActionPerformed(items.lastAction) === true) {
                    // renewing the last action time
                    localStorage.setItem('users', JSON.stringify({ user: items.user, permission: items.permission, lastAction: Date.now() }));                    
                    dispatch(authSuccess({ token, user: items.user, permission: items.permission, lastAction: items.lastAction }));
                } else {
                    dispatch(authLogout());
                }
            } else {
                // dispatch(authLogout());
            }
        } else {
            // dispatch(authLogout());
        }
    }
}