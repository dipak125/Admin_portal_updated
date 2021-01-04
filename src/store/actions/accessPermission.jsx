export const AccessPermission = (props, sectionName, access) => {
    if(localStorage.getItem('users')) {
        const users = JSON.parse(localStorage.getItem('users'));
        const accessPermission = users.permission;
        
        if(props.sectionName)    sectionName = props.sectionName;
        if(props.access)         access = props.access;

        if(sectionName && access) {
            if(accessPermission[sectionName][access] != '1') {
                if(props.children || !props.history) 
                    return null;
                else 
                    props.history.push('/');
            } else {
                return (props.children ? props.children : null);
            }
        } else {
            return null;
        }
    } else {
        return null;
    }
}

/*export const checkingHasAnyAccess = (sectionName, access) => {
    if(localStorage.getItem('users')) {
        const users = JSON.parse(localStorage.getItem('users'));
        const accessPermission = users.permission;
        
        if(sectionName && access.length) {
            access.forEach(element => {
                if(accessPermission[sectionName][element] == '1') {
                    return true;
                } 
            });
        }
    }
    return false;
}*/

export const getAccessDetails = (sectionName) => {
    if(localStorage.getItem('users')) {
        const users = JSON.parse(localStorage.getItem('users'));
        const accessPermission = users.permission;
        
        if(sectionName) {
            return accessPermission[sectionName];
        }
    }
    return {};
}