import React, { Component } from 'react';
import HeaderTop from '../common/header/header-top/HeaderTop';

class Logout extends Component {
    render() {
        return (
            <>
                 <HeaderTop flag = "logout" />
                    <div className="container-fluid">
                    <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-12 col-xl-12 pd-l-0">
                                <div className="error404">
                                    <h3>Sorry!</h3>
                                    <h4>You have been logged out</h4>
                                    {/* <p>Sorry, but the page you are looking for is not found. Please, make sure you have typed the currect URL.</p> */}
                                    <p>Please login to continue.</p>
                                </div>
                                </div>
                            </div>

                    </div>
            </>
        );
    }
}

export default Logout;