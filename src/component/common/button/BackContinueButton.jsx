import React, { Component } from 'react';

class BackContinueButton extends Component {
    render() {
        return (
            <>
                <div className="d-flex justify-content-left resmb">
                    <button className="backBtn">Back</button>
                    <button className="proceedBtn" href={'#'}>Continue</button>
                </div>

            </>
        );
    }
}

export default BackContinueButton;