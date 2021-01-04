import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from "moment";
import { Field, Form, Formik, FormikProps } from 'formik';

import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";

class RequestForm extends Component {
    state = {}
    render() {
        return (
            <BaseComponent>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                            <div className="contBox m-b-45 informarionBox">
                                <h4>Inspection Request Form</h4>
                                <div className="inforBox01">
                                    <h5>General Information</h5>
                                        <Row>
                                            <Col sm={12} md={6}>
                                                <Row>
                                                    <Col sm={12} md={4}>Submission Date</Col>
                                                    <Col sm={12} md={8}>
                                                    Field Gose Here
                                                        {/* <div className="form-group">
                                                            <Field
                                                                name="userId"
                                                                type="text"
                                                                className={`form-control`}
                                                                placeholder="User Id"
                                                                autoComplete="off"
                                                            //value={values.userId}
                                                            />
                                                        </div> */}
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col sm={12} md={6}>
                                                <Row>
                                                    <Col sm={12} md={4}>Submission Time</Col>
                                                    <Col sm={12} md={8}>
                                                    Field Gose Here
                                                        {/* <div className="form-group">
                                                            <Field
                                                                name="userId"
                                                                type="text"
                                                                className={`form-control`}
                                                                placeholder="User Id"
                                                                autoComplete="off"
                                                            //value={values.userId}
                                                            />
                                                        </div> */}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col sm={12} md={6}>
                                                <Row>
                                                    <Col sm={12} md={4}>Agent ID</Col>
                                                    <Col sm={12} md={8}>
                                                    Field Gose Here
                                                        {/* <div className="form-group">
                                                            <Field
                                                                name="userId"
                                                                type="text"
                                                                className={`form-control`}
                                                                placeholder="User Id"
                                                                autoComplete="off"
                                                            //value={values.userId}
                                                            />
                                                        </div> */}
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col sm={12} md={6}>
                                                <Row>
                                                    <Col sm={12} md={4}>SBIG Branch</Col>
                                                    <Col sm={12} md={8}>
                                                    Field Gose Here
                                                        {/* <div className="form-group">
                                                            <Field
                                                                name="userId"
                                                                type="text"
                                                                className={`form-control`}
                                                                placeholder="User Id"
                                                                autoComplete="off"
                                                            //value={values.userId}
                                                            />
                                                        </div> */}
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                </div>

                                <div className="inforBox01">
                                    <h5>Risk Submission</h5>
                                    <Row>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>Product:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>SBIG Policy Type:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>Business Type:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>Quate No:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>Client Name:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>State</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>City:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>Landline:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                        <Col sm={12} md={4}>
                                            <Row>
                                                <Col sm={12} md={6}>Mobile:</Col>
                                                <Col sm={12} md={6}>Field Gose Here</Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                                <div className="form-group text-center">
                                    <button type="reset" className="btn btn-primary mr-2">Reset</button>
                                    <button type="submit" className="btn btn-info">Submit</button>
                                </div>
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
            </BaseComponent>
        );
    }
}

export default RequestForm;
