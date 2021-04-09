import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from './BaseComponent';
import SideNav from './common/side-nav/SideNav';


class UnderMaintenance extends Component {


    render() {

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                {/* <h4 className="text-center mt-3 mb-3">SBI General</h4> */}
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="justify-content-left brandhead  m-b-20">
                                            {/* <h4 className="fs-18">Page Under Maintenance</h4> */}
                                        </div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            {/* <h4> Page Under Maintenance</h4> */}
                                        </div>

                                        </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </BaseComponent>
            </>
        );
    }
}

export default UnderMaintenance;