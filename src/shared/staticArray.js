// ************ Developed By: Sumanta ************
// ********** Last Modified By:  **********

export const getTitles = () => {
    return  [
                { id: "Mr", name: "Mr" },
                { id: "Mrs", name: "Mrs" },
                { id: "Ms", name: "Ms" },
                { id: "Miss", name: "Miss" }
            ]
}

export const getStatus = () => {
    return  [
                { id: "1", name: "Available" },
                { id: "0", name: "Unavailable" }
            ]
}

export const getStatusObj = () => {
    return  {
                0: 'Uavailable',
                1: 'Available'
            }
}

export const getRouteTypes = () => {
    return  [
                { id: "0", name: "Unassigned" },
                { id: "1", name: "Ruta Regular" },
                { id: "2", name: "Llame Y Viaje" }
            ]
}

export const getRoutesObj = () => {
    return  {
                0: 'Unassigned',
                1: 'Ruta Regular',
                2: 'Llame Y Viaje'
            }
}

export const getActiveStatus = () => {
    return  [
                { id: '0', name: 'Inactive' },
                { id: '1', name: 'Active' }
            ]
}

export const getActiveStatusObj = () => {
    return  {
                0: 'Inactive',
                1: 'Active'
            }
}

export const getApplicationStatus = (skipIndxArr=[]) => {
    let appStatus = [
                        { id: "0", name: "Application Submitted" },
                        { id: "1", name: "Interview Scheduled" },
                        { id: "2", name: "Approved" },
                        { id: "3", name: "Application Rejected" }
                    ];
    
    if(skipIndxArr.length) {
        appStatus.forEach(function (val, index ) {
            if(skipIndxArr.find(k => k == val.id)) {
                delete appStatus[index];
            }
        });        
    }
    return appStatus;
}

export const getApplicationStatusObj = (skipIndxArr=[]) => {
    let appStatus = {
                    0: 'Application Submitted',
                    1: 'Interview Scheduled',
                    2: 'Approved',
                    3: 'Application Rejected'
                };
    
    if(skipIndxArr.length) {
        skipIndxArr.forEach(function (val) {
            delete appStatus[val];
        });        
    }
    return appStatus;
}

export const getTripStatusObj = () => {
    return  {
            0: 'Unapproved',
            1: 'Approved',
            2: 'Rejected',
            3: 'Picked Up',
            4: 'Completed',
            5: 'No Show',
            6: 'Cancelled'
        }
}

export const getFrequencyTitleObj = () => {
    return  {
            0: 'One Time',
            1: 'Weekdays',
            2: 'Saturday'
        }
}

export const getFrequencyDaysObj = () => {
    return  {
            1: 'Monday',
            2: 'Tuesday',
            3: 'Wednesday',
            4: 'Thursday',
            5: 'Friday',
            6: 'Saturday'
        }
}

export const getInventoryTypes = () => {
    return [
        { id: '0', name: 'Vehical' },
        { id: '1', name: 'Operations' }
    ]
 }
 
 export const getInventoryMake = () => {
    return [];
 }
 
 export const getInventoryModel = () => {
    return [];
 }


 export const getAssetDescriptions = () => {
    return [
        {id: '1', name: 'Vehicle'},
        {id: '2', name: 'Systems'},
        {id: '3', name: 'Maintenance'},
        {id: '4', name: 'Furniture'}
    ];
}

export const getAssetTypes = () => {
    return [
        {id: '1', name: 'Bus'},
        {id: '2', name: 'Van'},
        {id: '3', name: 'Computer'},
        {id: '4', name: 'Gear Box'},
        {id: '5', name: 'Break Oil'},
        {id: '6', name: 'Gear Oil'},
        {id: '7', name: 'Hand Brake'},
        {id: '8', name: 'Chair'},
        {id: '9', name: 'Desks'},
        {id: '10', name: 'Lights'}
    ];
}

export const getVehicleTypes = () => {
    return [
        {id: '1', name: 'Bus'},
        {id: '2', name: 'Van'}
    ];
}

export const getSystemsTypes = () => {
    return [
        {id: '3', name: 'Computer'},
        {id: '4', name: 'Tab'},
        {id: '5', name: 'Mobile'}
    ];
}

export const getMaintenanceTypes = () => {
    return [
        {id: '6', name: 'Gear Box'},
        {id: '7', name: 'Break Oil'},
        {id: '8', name: 'Gear Oil'},
        {id: '9', name: 'Hand Brake'}
    ];
}

export const getFurnitureTypes = () => {
    return [
        {id: '10', name: 'Chair'},
        {id: '11', name: 'Desks'},
        {id: '12', name: 'Lights'}
    ];
}

export const makeVehiclesArray = () => {
    return [
        {id: '1', name: 'Ford'},
        {id: '2', name: 'Volvo'},
        {id: '3', name: 'Audi'},
        {id: '4', name: 'Volkswagen'}
    ];
}

export const makeSystemsArray = () => {
    return [
        {id: '1', name: 'Windows'},
        {id: '2', name: 'Apple'},
        {id: '3', name: 'Google'}
    ];
}

export const makeMaintenanceArray = () => {
    return [
        {id: '1', name: 'Castrol'},
        {id: '2', name: 'ExxonMobil'},
        {id: '3', name: 'texaco'},
        {id: '4', name: 'Gulf Oil'}
    ];
} 

export const makeFurnitureArray = () => {
    return [
        {id: '1', name: 'Hülsta'},
        {id: '2', name: 'Damro'},
        {id: '3', name: 'IKEA'},
        {id: '4', name: 'Usha Lexus'}
    ];
} 

export const modelVehicleArray = () => {
    return [
        {id: '1', name: 'FO123'},
        {id: '2', name: 'FO456'},
        {id: '3', name: 'AU123'},
        {id: '4', name: 'AU456'},
        {id: '5', name: 'VO123'},
        {id: '6', name: 'VO987'},
        {id: '7', name: 'VK756'},
        {id: '8', name: 'VK951'}
    ];
}

export const modelSystemsArray = () => {
    return [
        {id: '1', name: 'WIN456'},
        {id: '2', name: 'WIN984'},
        {id: '3', name: 'APP582'},
        {id: '4', name: 'APP759'},
        {id: '5', name: 'GGL456'},
        {id: '6', name: 'GGL985'}
    ];
}

export const departmentsArray = () => {
    return [
        {id: '1', name: 'Warehouse'},
        {id: '2', name: 'Operations'},
        {id: '3', name: 'Maintenance'}
    ];
}

export const inventoryTypesArray = () => {
    return [
        {id: '1', name: 'Property Asset'},
        {id: '2', name: 'Warehouse'},
        {id: '3', name: 'Inventory Asset For Maintenance'}
    ];
}

export const physicalLocationsArray = () => {
    return [
        {id: '1', name: 'Miramar Depot'},
        {id: '2', name: 'Margao Depot'},
        {id: '3', name: 'Panaji Depot'},
        {id: '4', name: 'Mapusa Depot'}
    ];
}


export const reasonsForRequestsArray = () => {
    return [
        {id: '1', name: 'For Stock Maintenance'},
        {id: '2', name: 'Requested By Operations'},
        {id: '3', name: 'Requested By Systems'},
        {id: '4', name: 'Requested By Maintenance'}
    ];
}