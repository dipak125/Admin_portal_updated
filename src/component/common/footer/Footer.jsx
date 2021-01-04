import React, { Component } from 'react';
import { Router, Route, Link } from 'react-router-dom';

export default class Footer extends Component {
    render() {
        return (
            <>
                {/* <div className="footerWrap d-flex flex-md-row flex-lg-row flex-xl-row flex-sm-column flex-column align-items-center justify-content-between"> */}
                    <div className="footer">
                        <p>© 2020 SBI General Insurance Company Limited. | All Copy Rights Reserved</p>
                    </div>
                {/* </div> */}
            </>
        )
    }
}
