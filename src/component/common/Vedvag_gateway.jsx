import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '../BaseComponent';
import SideNav from './side-nav/SideNav';
import Footer from './footer/Footer';
// import Otp from "./Otp"
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import fuel from './FuelTypes';
import swal from 'sweetalert';
import moment from "moment";

const initialValue = {
    gateway : ""
}
const menumaster_id = 7

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Please enter valid reference number"
    }),
    })

class Vedvag_gateway extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            refNo: "",
            whatsapp: "",
            motorInsurance: [],
            error: [],
            purchaseData: [],
            error1: [],
            refNumber: "",
            paymentStatus: [],
            accessToken: "",
            PolicyArray: [],
            memberdetails: [],
            nomineedetails:[],
            relation: [],
            policyHolder: [],
	        step_completed: "0",
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policyHolder_refNo")
        };
    }


    handleClose(e) {
        this.setState({ show: false, });
    }

    handleOtp(e) {
        console.log("otp", e)
        this.setState({ show: false, });
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

        if(productId == 11) {
            this.props.history.push(`/Premium_MISCD/${productId}`);
        }
        else if(productId == 9) {
            this.props.history.push(`/Premium_SME/${productId}`);
        }
        else if(productId == 8) {
            this.props.history.push(`/Premium_GCV/${productId}`);
        }
        else if(productId == 7) {
            this.props.history.push(`/Premium_GCV_TP/${productId}`);
        }
        else if(productId == 2) {
            this.props.history.push(`/Premium/${productId}`);
        }
        else if(productId == 6) {
            this.props.history.push(`/four_wheeler_policy_premium_detailsTP/${productId}`);
        }
        else if(productId == 4) {
            this.props.history.push(`/two_wheeler_policy_premium_details/${productId}`);
        }
        else if(productId == 3) {
            this.props.history.push(`/two_wheeler_policy_premium_detailsTP/${productId}`);
        }
        else if(productId == 5) {
            this.props.history.push(`/PolicyDetails/${productId}`);
        }
        
        

    }

    handleSubmit = (values) => {
        const {policyHolder_refNo} = this.state
        const formData = new FormData();    
        formData.append('policy_ref_no', policyHolder_refNo)
        this.props.loadingStart();
        axios.post('payment/submit', formData).then(res => {
            if(res.data.error === false) {
                this.policyInception(res.data.data.transaction_no, this.state.quote_id)
            }
            else {
                swal("Payment failed")
                this.props.loadingStop();
            }

        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })

    }

    policyInception = (transaction_no ) => {
        const {policyHolder_refNo, request_data } = this.state
        var amount = request_data && request_data.net_premium ? request_data.net_premium : ""
        var quote_id = request_data && request_data.quote_id ? request_data.quote_id : ""
        const formData = new FormData();    
        formData.append('quote_id', quote_id)
        formData.append('csc_txn', transaction_no)
        formData.append('amount', amount)
        
        axios.post('wallet/issue-policy', formData).then(res => {
            if(res.data.error === false) {
                this.props.history.push(`/ThankYou/${res.data.data.PolicyNo}?access_id=${this.state.policyHolder_refNo}`);
            }
            else {
                this.paymentRefund(policyHolder_refNo, res.data.msg)
            }
            this.props.loadingStop();

        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })

    }

    paymentRefund = ( policyHolder_refNo, error) => {
        // var amount = request_data && request_data.net_premium ? request_data.net_premium : ""
        // var quote_id = request_data && request_data.quote_id ? request_data.quote_id : ""
        const formData = new FormData();    
        formData.append('policy_ref_no', policyHolder_refNo)
        
        axios.post('payment/refund', formData).then(res => {
            if(res.data.error === false) {
                swal(error+". "+res.data.msg+" Please retry payment")
            }
            this.props.loadingStop();
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let encryption = new Encryption();
    
        axios.get(`policy-holder-additional-details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {}
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";

		        let dateDiff = 0
                this.setState({
                    motorInsurance,policyHolder,vehicleDetails,previousPolicy,request_data,step_completed,
                    refNumber: decryptResp.data.policyHolder.reference_no,
                    paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],
                    memberdetails : decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [],
                    nomineedetails: decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0]:[]
                    
                })
                this.getAccessToken(motorInsurance)       
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    componentDidMount() {
        this.fetchData()
    }

    render() {
        const { policyHolder, show, motorInsurance, request_data, refNumber, paymentStatus, relation, memberdetails,nomineedetails, vehicleDetails, breakin_flag, step_completed } = this.state
        const { productId } = this.props.match.params

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
                                validationSchema={validatePremium}
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
                                                    <div className="brandhead m-b-30">
                                                        <h4>
                                                            Policy Reference Number {request_data.quote_id ? request_data.quote_id : null}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr">
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                {productId == 9 ?
                                                                                <div className="premamount">
                                                                                    ₹ {request_data.payable_premium ? request_data.payable_premium : null}
                                                                                </div> : 
                                                                                <div className="premamount">
                                                                                    ₹ {request_data.net_premium ? request_data.net_premium : null}
                                                                                </div> }

                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Gross Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {request_data.gross_premium ? Math.round(request_data.gross_premium) : null}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    GST:
                                                                                </div>
                                                                            </Col>
                                                                            <Col sm={12} md={3}>
                                                                            {productId == 9 ?
                                                                                <div className="premamount">
                                                                                    ₹ {request_data.payable_premium && request_data.gross_premium ? Math.round(request_data.payable_premium - request_data.gross_premium) : null }
                                                                                </div> : 
                                                                                <div className="premamount">
                                                                                ₹ {request_data.net_premium && request_data.gross_premium ? Math.round(request_data.net_premium - request_data.gross_premium) : null }
                                                                            </div> 
                                                                            }
                                                                            </Col>
                                                                        </Row>
                                                                    </div>
                                                            </div>

                                                            
                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>Back</Button>
                                                                { request_data.net_premium != 0 ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"
                                                                    >
                                                                        Make Payment
                                                                </Button> 
                                                            : null}
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

                            </div> 
                            <Footer />
                        </div>
                    </div>
                </BaseComponent>
            </>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        loading: state.loader.loading,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Vedvag_gateway)
);
