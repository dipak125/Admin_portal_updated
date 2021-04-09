import React from 'react';
import Moment from 'react-moment';

export const ChangeDateFormat = (props) => {
    return (
        <Moment format={props.dateFormat ? props.dateFormat : "MM/DD/YYYY"}>
            {props.dateVal}
        </Moment>
    );
}