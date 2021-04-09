// ************ Developed By: Sumanta ************
// ********** Last Modified By: Sumanta **********

import moment from "moment";
import dateformat from "dateformat";

export class PersonAge {
    //listener on date of birth field
    whatIsMyAge(mydob) {
        //console.log('dob', dateformat(mydob, 'mm/dd/yyyy'));
        return this.calculateAge(this.parseDate(dateformat(mydob, 'mm/dd/yyyy')), new Date());
    }

    //convert the date string in the format of dd/mm/yyyy into a JS date object
    parseDate(dateStr) {
        let dateParts = dateStr.split("/");
        //return new Date(dateParts[2], dateParts[0], (dateParts[1] - 1));
        return new Date(dateParts[2], dateParts[0] - 1, dateParts[1]);
    }

    //is valid date format
    calculateAge(dateOfBirth, dateToCalculate) {
        var calculateYear = dateToCalculate.getFullYear();
        var calculateMonth = dateToCalculate.getMonth();
        var calculateDay = dateToCalculate.getDate();

        var birthYear = dateOfBirth.getFullYear();
        var birthMonth = dateOfBirth.getMonth();
        var birthDay = dateOfBirth.getDate();
        
        var age = calculateYear - birthYear;
        var ageMonth = calculateMonth - birthMonth;
        var ageDay = calculateDay - birthDay;

        if (ageMonth < 0 || (ageMonth == 0 && ageDay < 0)) {
            age = parseInt(age) - 1;
        }
        return age;
    }
}
//export default MyDateFuntions;

export const get18YearsBeforeDate = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 18);
    return new Date(dateformat(today, 'mm/dd/yyyy'));
}

export const changeFormat = (val) => {
    if (val != '') {
        return new Date(dateformat(val, 'mm/dd/yyyy'));
    } else {
        return new Date(dateformat(new Date(), 'mm/dd/yyyy'));
    }
}

export const changeDateTimeFormat = (val) => {
    if (val != '') {
        return new Date(dateformat(val, 'mm/dd/yyyy h:MM TT'));
    } else {
        const thedateis2 = new Date();
        thedateis2.setDate(thedateis2.getDate() + 1);
        return new Date(dateformat(thedateis2, 'mm/dd/yyyy h:MM TT'));
    }
}

export const getCurrentDate = (format) => {
    return moment().format(format ? format : 'D MMMM, YYYY');
}

export const getCurrentTime = (format) => {
    return moment().format(format ? format : 'H:mm');
}