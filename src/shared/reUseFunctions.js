// ************ Developed By: Sumanta ************
// ********** Last Modified By: Sumanta **********

import moment from "moment";

export const genRandomPassword = (length) => {
    var chars =
            "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
    var genPass = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * chars.length);
        genPass += chars.charAt(i);
    }
    return genPass;
}

export const getDisabledHours = (pickupDate) => {
    const pDay = moment(pickupDate).format('ddd');
    var dHours = [];

    if (pDay === "Sat") {
        for (var i = 0; i < 6; i++) {
            dHours.push(i);
        }
        for (var i = 21; i < 24; i++) {
            dHours.push(i);
        }
    } else {
        for (var i = 0; i < 5; i++) {
            dHours.push(i);
        }
        for (var i = 22; i < 24; i++) {
            dHours.push(i);
        }
    }
    return dHours;
}

export const getDisabledMinutes = (selectedHour, pickupDate) => {
    const pDay = moment(pickupDate).format('ddd');
    var minutes = [];

    if (pDay === "Sat") {
        if (selectedHour === 20) {
            for (var i = 1; i < 60; i++) {
                minutes.push(i);
            }
        }
    } else {
        if (selectedHour === 5) {
            for (var i = 0; i < 30; i++) {
                minutes.push(i);
            }
        } else if (selectedHour === 21) {
            for (var i = 1; i < 60; i++) {
                minutes.push(i);
            }
        }
    }
    return minutes;
}