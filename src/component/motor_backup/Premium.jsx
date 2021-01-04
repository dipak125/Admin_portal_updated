import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import Otp from "./Otp"

const initialValue = {}

class Premium extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            refNo: "",
            whatsapp: ""
        };
    }


    handleClose(e) {
        this.setState({ show: false,  });
    }
    
    handleOtp(e) {
        console.log("otp", e)
        this.setState({ show: false,  });
        this.props.history.push(`/ThankYou_motor`)
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    additionalDetails = (productId) => {
        this.props.history.push(`/Additional_details/${productId}`);
    }

    handleSubmit = (values) => {
        this.setState({ show: true , refNo: values.refNo, whatsapp: values.whatsapp});
    }

    render() {
        const {refNo, whatsapp, show} = this.state
        const {productId} = this.props.match.params
        return (
            <>
                <BaseComponent>
                <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                        <SideNav />
                    </div>
                
                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                // validationSchema={validateNominee}
                >
                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                return (
                <Form>
                <section className="brand m-t-11 m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead m-b-10">
                            <h4>The Summary of your Policy Premium Details is as below </h4>
                        </div>
                    </div>
                
                    <Row>
                        <Col sm={12} md={9} lg={9}>
                            <div className="rghtsideTrigr">
                                <Collapsible trigger="Retail Motor Policy" >
                                    <div className="listrghtsideTrigr">
                                        <Row>
                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Premium:
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 4000
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Swachh Bharat cess:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 4000
                                                </div>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Gross Premium:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 1000
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Krishi Kalyan cess:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 1000
                                                </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="motopremium">
                                                    Service Tax:
                                                                    </div>
                                            </Col>


                                            <Col sm={12} md={3}>
                                                <div className="premamount">
                                                    ₹ 5000
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>

                                </Collapsible>
                            </div>

                            <div className="rghtsideTrigr m-b-30">
                                <Collapsible trigger="Member Details" >
                                    <div className="listrghtsideTrigr">
                                        Hello
                                    </div>

                                </Collapsible>
                            </div>

                            <Row>
                                <Col sm={12} md={6}>
                                    <div className="carloan">
                                        <h4>Make Payment</h4>
                                    </div>
                                </Col>
                                <Col sm={12} md={6}>
                                    <div className="carloan">
                                        <h4>Select Payment Gateway</h4>
                                    </div>
                                </Col>
                            </Row>


                            <Row>
                                <Col sm={12} md={6}>
                                    <Row>
                                        <Col sm={6}>
                                            <FormGroup>
                                                <div className="refno">
                                                    My reference no is
                                    </div>
                                            </FormGroup>
                                        </Col>
                                        <Col sm={6}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                    <Field
                                                    name="refNo"
                                                    type="text"
                                                    placeholder="Type No"
                                                    autoComplete="off"
                                                    className="hght30"
                                                    value = {values.refNo}
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                                {errors.refNo && touched.refNo ? (
                                                <span className="errorMsg">{errors.refNo}</span>
                                                ) : null}     
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    </Row>

                                </Col>
                                <Col sm={12} md={6}>
                                    <FormGroup>
                                        <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />
                                        <img src={require('../../assets/images/CSC.svg')} alt="" />
                                    </FormGroup>
                                </Col>
                            </Row>

                            <Row>
                                <Col sm={12}>
                                    <label className="customCheckBox formGrp formGrp fscheck">I want to receive my Quote & Policy Details on Whatsapp
                                    <Field
                                        type="checkbox"
                                        name='whatsapp'                                            
                                        value='1'
                                        className="user-self"
                                        // checked={values.consumables ? true : false}
                                    />
                                        <span className="checkmark mL-0"></span>
                                        <span className="error-message"></span>
                                    </label>
                                </Col>
                            </Row>
                            <div className="d-flex justify-content-left resmb">
                                <Button className="backBtn" type="button" onClick= {this.additionalDetails.bind(this, productId)}>Back</Button>
                                <Button className="proceedBtn" type="submit" >Continue</Button>
                            </div>
                        </Col>


                        <Col sm={12} md={3} lg={3}>
                            <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                        </Col>
                    </Row>
                </section>
                </Form>
                );
                }}
                </Formik>
                <Modal className="" bsSize="md"
                    show={show}
                    onHide={this.handleClose}>
                    <div className="otpmodal">
                        <Modal.Body>
                            <Otp refNo= {refNo} whatsapp= {whatsapp} reloadPage={(e) => this.handleOtp(e) } />
                        </Modal.Body>
                    </div>
                </Modal>
               
                </div>
                <Footer />
                </div>
                </div>
                </BaseComponent>
            </>
        );
    }
}

export default Premium;