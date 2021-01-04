import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import Otp from "./Otp"
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import fuel from '../common/FuelTypes';
import swal from 'sweetalert';
import moment from "moment";

const initialValue = {
    gateway : ""
}
const menumaster_id = 7

// const validatePremium = Yup.object().shape({
//     refNo: Yup.string().notRequired('Reference number is required')
//     .matches(/^[a-zA-Z0-9]*$/, function() {
//         return "Please enter valid reference number"
//     }),
//     })

class PremiumMISCD extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            // refNo: "",
            // whatsapp: "",
            paymentButton: false,
            smsButton: true,
            fulQuoteResp: [],
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
        if(e === true) {
            this.setState({ show: false, paymentButton: true, smsButton: false});
        }
        else {
            this.setState({ show: false, paymentButton: false, smsButton: true});
        }
        
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
        this.props.history.push(`/AdditionalDetails_MISCD/${productId}`);
    }

    handleModal = () => {
        this.setState({ show: true});
    }

    handleSubmit = (values) => {
        // this.setState({ show: true, refNo: values.refNo, whatsapp: values.whatsapp });
        const {policyHolder} = this.state
        
        if(policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 1) {
            if(policyHolder.bcmaster.paymentgateway.slug == "csc_wallet") {
                this.payment()
            }
            if(policyHolder.bcmaster.paymentgateway.slug == "razorpay") {
                this.Razor_payment()
            }
            if(policyHolder.bcmaster.paymentgateway.slug == "PPINL") {
                this.paypoint_payment()
            }
        }
        else if (policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.slug && values.gateway == 2) {
            this.props.history.push(`/Vedvag_gateway/${this.props.match.params.productId}?access_id=${this.state.policyHolder_refNo}`);
        }
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let encryption = new Encryption();
    
        axios.get(`miscd/policy-holder/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [];
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {}
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
	
                this.setState({
                    motorInsurance,policyHolder,vehicleDetails,previousPolicy,request_data,step_completed,
                    refNumber: decryptResp.data.policyHolder.reference_no,
                    paymentStatus: decryptResp.data.policyHolder.payment ? decryptResp.data.policyHolder.payment[0] : [],
                    memberdetails : decryptResp.data.policyHolder ? decryptResp.data.policyHolder : [],
                    nomineedetails: decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data.nominee ? decryptResp.data.policyHolder.request_data.nominee[0]:[]
                    
                })
                this.fullQuote(motorInsurance)       
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    // callBreakin=()=>{

    //     const formData = new FormData();
    //     let encryption = new Encryption();
    //     let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
    //     let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
    //     if(bc_data) {
    //         bc_data = JSON.parse(encryption.decrypt(bc_data));
    //     }
    //     formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
    //     formData.append('ref_no', policyHolder_id) 

    //     this.props.loadingStart();
    //     axios.post('breakin/create',formData)
    //     .then(res=>{
    //         swal(`Your breakin request has been raised. Your inspection Number: ${res.data.data.inspection_no}`)
    //         this.props.loadingStop();
    //     }).
    //     catch(err=>{
    //         this.props.loadingStop();
    //     })  
    // }


    fullQuote = ( motorInsurance) => {
        const formData = new FormData();
        let encryption = new Encryption();
        
        const {previousPolicy, request_data, policyHolder} = this.state

        let trailer_array = motorInsurance.trailers ? motorInsurance.trailers : ""
        trailer_array = trailer_array ? JSON.parse(trailer_array) : []
        
        const post_data = {
            'ref_no':this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0',
            'idv_value': motorInsurance.idv_value,
            'policy_type':  motorInsurance.policy_type,
            'add_more_coverage': motorInsurance.add_more_coverage,
            // 'cng_kit': motorInsurance.cng_kit,
            // 'cngKit_Cost': Math.floor(motorInsurance.cngkit_cost),
            'PA_Cover': motorInsurance && motorInsurance.pa_cover ? motorInsurance.pa_cover : '0',
            'coverage_data': motorInsurance && motorInsurance.add_more_coverage_request_json != null ? motorInsurance.add_more_coverage_request_json : "",
            'body_idv_value' : motorInsurance && motorInsurance.body_idv_value ? motorInsurance.body_idv_value : '0',
            'trailer_array' : trailer_array,
        }

        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        
        axios.post('fullQuoteMISCD', formData)
            .then(res => {
                if (res.data.data.PolicyObject) {
                    this.setState({
                        fulQuoteResp: res.data.data.PolicyObject,
                        PolicyArray: res.data.data.PolicyObject.PolicyLobList,
                        error: [],
                    });
                }
                else if(res.data.data.ValidateResult) {
                    swal(res.data.data.ValidateResult.message)
                }
                 else {
                    this.setState({
                        fulQuoteResp: [],
                        error: res.data.data,
                    });
                    swal(res.data.msg)
                }
                this.props.loadingStop();

                // if(previousPolicy && policyHolder.break_in_status != "Vehicle Recommended and Reports Uploaded") {
                //     dateDiff = Math.floor(moment().diff(previousPolicy.end_date, 'days', true));
                //     if(dateDiff > 0 || previousPolicy.name == "2") {
                //         this.setState({breakin_flag: 1})
                //         swal({
                //             title: "Breakin",
                //             text: `Your Quotation number is ${request_data.quote_id}. Your vehicle needs inspection. Do you want to raise inspection.`,
                //             icon: "warning",
                //             buttons: true,
                //             dangerMode: true,
                //         })
                //         .then((willCreate) => {
                //             if (willCreate) {
                //                 this.callBreakin()
                //             }
                //             else {
                //                 this.props.loadingStop();
                //             }
                //         })                     
                //     }     
                // }
            })
            .catch(err => {
                this.setState({
                    serverResponse: [],
                });
                this.props.loadingStop();
            })
    }

    payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_motor.php?refrence_no=${refNumber}`
    }

    Razor_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${refNumber}`
    }

    paypoint_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
    }

    fetchRelationships=()=>{

        this.props.loadingStart();
        axios.get('relations')
        .then(res=>{
            let relation = res.data.data ? res.data.data : []                        
            this.setState({
                relation
            });
            this.fetchData()
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                relation: []
            });
        })
    
}


    componentDidMount() {
        // this.fetchData()
        this.fetchRelationships()
    }

    render() {
        const { policyHolder, show, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, relation, memberdetails,
            nomineedetails, vehicleDetails, breakin_flag, step_completed, paymentButton, smsButton } = this.state
        const { productId } = this.props.match.params

        const errMsg =
            error && error.message ? (
                <span className="errorMsg">
                    <h6>
                        <strong>
                            Thank you for showing your interest for buying product.Due to some
                            reasons, we are not able to issue the policy online.Please call
                            1800 22 1111
                    </strong>
                    </h6>
                </span>
            ) : null;

        const paymentErrMsg =
            paymentStatus && paymentStatus.transaction_status == 103 ? (
                <span className="errorMsg">
                    <h6>
                        <strong>
                            Payment failed. Please try again
                    </strong>
                    </h6>
                </span>
            ) : null;

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            { step_completed >= '4' && vehicleDetails.vehicletype_id == '11' ?
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                // validationSchema={validatePremium}
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
                                                        <h5>{errMsg}</h5>
                                                        <h5>{paymentErrMsg}</h5>
                                                        <h4>
                                                            Policy Reference Number {fulQuoteResp.QuotationNo}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Retail Motor Policy" open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.DuePremium ? fulQuoteResp.DuePremium : 0}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Gross Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.BeforeVatPremium ? Math.round(fulQuoteResp.BeforeVatPremium) : 0}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    GST:
                                                                    </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {fulQuoteResp.TGST ? Math.round(fulQuoteResp.TGST) : 0}
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Member Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        {memberdetails ?

                                                                                <div>
                                                                                    <strong>Owner Details </strong>
                                                                                    <br/>
                                                                                       <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                {motorInsurance.policy_for == '1' ?  <FormGroup>Name:</FormGroup> : <FormGroup>Company Name:</FormGroup> }
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.first_name }</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            {motorInsurance.policy_for == '1' ?     
                                                                                                <Row>
                                                                                                    <Col sm={12} md={6}>
                                                                                                        <FormGroup>Date Of Birth:</FormGroup>
                                                                                                    </Col>
                                                                                                    <Col sm={12} md={6}>
                                                                                                        <FormGroup>{ memberdetails ? moment(memberdetails.dob).format("DD-MM-YYYY") : null}</FormGroup>
                                                                                                    </Col>
                                                                                                </Row> : 
                                                                                                <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Date Of Incorporation:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{ memberdetails ? moment(memberdetails.date_of_incorporation).format("DD-MM-YYYY") : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>}
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Mobile No:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.mobile}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Email Id:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{memberdetails.email_id}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            {motorInsurance.policy_for == '1' ?
                                                                                                <Row>
                                                                                                    <Col sm={12} md={6}>
                                                                                                        <FormGroup>Gender</FormGroup>
                                                                                                    </Col>
                                                                                                    <Col sm={12} md={6}>
                                                                                                        <FormGroup>{memberdetails.gender == "m" ? "Male" : "Female"}</FormGroup>
                                                                                                    </Col>
                                                                                                </Row> :
                                                                                                <Row>
                                                                                                    <Col sm={12} md={6}>
                                                                                                        <FormGroup>GSTIN:</FormGroup>
                                                                                                    </Col>
                                                                                                    <Col sm={12} md={6}>
                                                                                                        <FormGroup>{memberdetails.gstn_no}</FormGroup>
                                                                                                    </Col>
                                                                                                </Row> }

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <p></p>
                                                                                    </Row>
                                                                                </div>
                                                                            : (<p></p>)}
                                                                        {motorInsurance.policy_for == '1' && motorInsurance.pa_flag == '1' ?             
                                                                        <div>
                                                                        <strong>Nominee Details :</strong>
                                                                            <br/>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nomineedetails ? nomineedetails.first_name : null}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Date Of Birth:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{ nomineedetails ? moment(nomineedetails.dob).format("DD-MM-YYYY") : null}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Relation With Proposer:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                        {nomineedetails && relation.map((relations, qIndex) => 
                                                                                        relations.id == nomineedetails.relation_with ?
                                                                                            <FormGroup key={qIndex}>{relations.name}</FormGroup> : null
                                                                                        )}
                                                                                        </Col>
                                                                                    </Row>

                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Gender</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{nomineedetails && nomineedetails.gender == "m" ? "Male" : "Female"}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div> : null}

                                                                        {motorInsurance.policy_for == '1' && nomineedetails && nomineedetails.is_appointee == '1' && motorInsurance.pa_flag == '1' ?      
                                                                            <div>
                                                                            <strong>Appointee Details :</strong>
                                                                                <br/>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Name:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{nomineedetails && nomineedetails.appointee_name ? nomineedetails.appointee_name : null}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>

                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>Relation With Nominee:</FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                            {nomineedetails && nomineedetails.appointee_relation_with && relation.map((relations, qIndex) => 
                                                                                            relations.id == nomineedetails.appointee_relation_with ?
                                                                                                <FormGroup key={qIndex}>{relations.name}</FormGroup> : null
                                                                                            )}
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <p></p>
                                                                                </Row>
                                                                            </div> : null }
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Vehicle Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        {memberdetails ?

                                                                                <div>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Registration No:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{motorInsurance && motorInsurance.registration_no}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Car Brand:</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Car Model</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Variant</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.varient ? vehicleDetails.varientmodel.varient : ""}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Chassis Number</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{motorInsurance && motorInsurance.chasis_no  ? motorInsurance.chasis_no : ""}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Engine Number</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                <FormGroup>{motorInsurance && motorInsurance.engine_no  ? motorInsurance.engine_no : ""}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>
                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Fuel Type</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[parseInt(vehicleDetails.varientmodel.fuel_type)] : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Seating</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.seating ? vehicleDetails.varientmodel.seating : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Body Style</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.body_style ? vehicleDetails.varientmodel.body_style : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                            <Row>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>Horse Power</FormGroup>
                                                                                                </Col>
                                                                                                <Col sm={12} md={6}>
                                                                                                    <FormGroup>{vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.horse_power ? vehicleDetails.varientmodel.horse_power+" BHP" : null}</FormGroup>
                                                                                                </Col>
                                                                                            </Row>

                                                                                        </Col>
                                                                                    </Row>
                                                                                    <Row>
                                                                                        <p></p>
                                                                                    </Row>
                                                                                </div>
                                                                            : (<p></p>)}
                                                                                   
                                                                        <div>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <Row>
                                                            <Col sm={12} md={6}>
                                                            </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>
                                                                    
                                                                     <div className="paymntgatway">
                                                                        Select Payment Gateway
                                                                        <div>
                                                                        {/* <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" /> */}
                                                                        <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='gateway'                                            
                                                                            value='1'
                                                                            key='1'  
                                                                            onChange={(e) => {
                                                                                setFieldValue(`gateway`, e.target.value);
                                                                            }}
                                                                            checked={values.gateway == '1' ? true : false}
                                                                        />
                                                                            <span className="checkmark " /><span className="fs-14"> 
                                                                        
                                                                                { policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolder.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                                null
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                        </div>

                                                                        {policyHolder.bcmaster && policyHolder.bcmaster.id === 2 ?
                                                                        <div>
                                                                        <label className="customRadio3">
                                                                        <Field
                                                                            type="radio"
                                                                            name='gateway'                                            
                                                                            value='2'
                                                                            key='1'  
                                                                            onChange={(e) => {
                                                                                setFieldValue(`gateway`, e.target.value);
                                                                            }}
                                                                            checked={values.gateway == '2' ? true : false}
                                                                        />
                                                                            <span className="checkmark " /><span className="fs-14"> 
                                                                        
                                                                                { policyHolder.bcmaster && policyHolder.bcmaster.id === 2 ? <img src={require('../../assets/images/vedavaag.png')} alt="" /> :
                                                                                null
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                        </div> : null }
                                                                    </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>

                                                            
                                                            <div className="d-flex justify-content-left resmb">
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this, productId)}>Back</Button>
                                                                
                                                                {smsButton === true ?
                                                                <Button className="backBtn" type="button" onClick={this.handleModal.bind(this)}>Send consent SMS & e-mail</Button>
                                                                : null}

                                                                {fulQuoteResp.QuotationNo && breakin_flag == 0 && values.gateway != "" && paymentButton === true ?
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
                                <Modal className="" bsSize="md"
                                    show={show}
                                    onHide={this.handleClose}>
                                    <div className="otpmodal">
                                    <Modal.Header closeButton />
                                        <Modal.Body>
                                            <Otp
                                                quoteNo={fulQuoteResp.QuotationNo}
                                                duePremium={fulQuoteResp.DuePremium}
                                                refNumber={refNumber}
                                                // whatsapp={whatsapp}
                                                reloadPage={(e) => this.handleOtp(e)}
                                            />
                                        </Modal.Body>
                                    </div>
                                </Modal>
                            </div> : step_completed == "" ? "Forbidden" : null }
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
    connect(mapStateToProps, mapDispatchToProps)(PremiumMISCD)
);
