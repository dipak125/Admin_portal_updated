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
    console.log('now-----= ', now);
    console.log('timeleft--------= ', timeleft);

    // if (isTimeout) {
    //     //console.log('Logout');
    //     return false;
    // }
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

        let post_data_obj = {}
        if(data.bc_id) {
            post_data_obj = {
                'email': data.emailAddress,
                'password':data.password,
                'bc_id': data.bc_id,
                'user_type': data.user_type,
                'user_id': data.bc_id
            }
        }
        else {
            post_data_obj = {
                'email': data.emailAddress,
                'password':data.password,
                'bc_id': data.agent_id,
                'user_id': data.bc_agent_id
            }
        }
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        // .post('/login', formData)
        axios
            .post('/admin-login', formData)
            .then(response => {
                if (response.data.is_admin === true) {
                    dispatch(authSuccess(response.data));
                    if(!!sessionStorage.getItem('type')){
                        response.data.user_data.type=sessionStorage.getItem('type')
                    }
                    let loginData;
                    if(data.rememberMe == '1') {
                        loginData = {email: data.emailAddress, pass: data.password, rememberMe: data.rememberMe};
                    } else {
                        loginData = {email: '', pass: '', rememberMe: ''};
                    }
                    sessionStorage.setItem('auth_token', response.data.token_type+" "+response.data.token);
                    sessionStorage.setItem('role_details', JSON.stringify(response.data.role_details));
                    sessionStorage.setItem('role_admin', response.data.is_admin);
                    let userrole_data = response.data.admin_details.userrole;
                    if (userrole_data.bcmaster_id !== 0 || response.data.admin_details.userrole.bcdetails) {
                        sessionStorage.setItem('logo', response.data.admin_details.userrole.bcdetails.logo);
                    } else {
                        sessionStorage.setItem('logo', '');
                    }
                    sessionStorage.setItem('bcmaster_id', userrole_data.bcmaster_id);
                    // sessionStorage.setItem('userrole_data', encryption.encrypt(JSON.stringify(response.data.userrole_data)));
                    
                    // localStorage.setItem('users', JSON.stringify({ user: response.data.user, permission: response.data.permission, lastAction: Date.now() }));
                    localStorage.setItem('users', JSON.stringify({ user: encryption.encrypt(JSON.stringify(response.data.user_data)), permission: [], lastAction: Date.now() }));
                    localStorage.setItem('loginData', JSON.stringify( loginData ));
                    // var cscData = JSON.parse(response.data.user_data.info);
                    // localStorage.setItem('csc_id', cscData["csc_id"]);
                    // localStorage.setItem('agent_name', cscData["fullname"]);
                    // localStorage.setItem('product_id', cscData["productId"]);


                    console.log('user_data',response.data.user_data)
                    onSuccess && onSuccess();
                } else {
                    dispatch(authFail({data:{message:'User must be Admin to get access to Reports section'}}));
                    onFailure && onFailure({data:{message:'User must be Admin to get access to Reports section'}});
                }
            })
            .catch(error => {
                console.log(error.data)
                if (error.status == 401) {
                    dispatch(authFail({data:{message:'User must be Admin to get access to Reports section'}}));
                    onFailure && onFailure({data:{message:'User must be Admin to get access to Reports section'}});
                } else if (error.status == 422) {
                    dispatch(authFail({data:{message:error.data.error}}));
                    onFailure && onFailure({data:{message:error.data.error}});
                } else {
                    dispatch(authFail(error));
                    onFailure && onFailure(error);
                }
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