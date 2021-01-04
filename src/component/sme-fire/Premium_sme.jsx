import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from "../../store/actions/sme_fire";
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

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Please enter valid reference number"
    }),
    })

class Premium_sme extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            refNo: "",
            whatsapp: "",
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
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policy_holder_ref_no")
        };
    }


    handleClose(e) {
        this.setState({ show: false, });
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
        this.props.history.push(`/AdditionalDetails_SME/${productId}`);
    }

    // removeLocalStorage = (productId) => {
    //     localStorage.removeItem('policy_holder_ref_no')
    // }

    handleSubmit = (values) => {
        console.log("values-----",values)
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


    callBreakin=()=>{

        const formData = new FormData();
        let encryption = new Encryption();
        let policyHolder_id = this.state.policyHolder_refNo ? this.state.policyHolder_refNo : '0'
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        formData.append('ref_no', policyHolder_id) 

        this.props.loadingStart();
        axios.post('breakin/create',formData)
        .then(res=>{
            swal(`Your breakin request has been raised. Your inspection Number: ${res.data.data.inspection_no}`)
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
        })  
    }


    payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment_sme_fire.php?refrence_no=${refNumber}`
    }

    Razor_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/smefire_pay.php?refrence_no=${refNumber}`
    }

    paypoint_payment = () => {
        const { refNumber } = this.state;
        window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
    }

    componentDidMount() {
        this.fetchPolicyDetails()
    }

    getGender = (gender) => {

        if(gender == 'm'){
            return 'Male';
        }else if(gender == 'f'){
            return 'Female';
        }

    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();
  
            this.props.loadingStart();
            axios.get(`sme/details/${policy_holder_ref_no}`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));

                if(decryptResp.data.policyHolder.step_no > 0){

                    this.props.setData({
                        start_date:decryptResp.data.policyHolder.request_data.start_date,
                        end_date:decryptResp.data.policyHolder.request_data.end_date,
                        
                        policy_holder_id:decryptResp.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:decryptResp.data.policyHolder.request_data.id,
                        completed_step:decryptResp.data.policyHolder.step_no,
                        menumaster_id:decryptResp.data.policyHolder.menumaster_id
                    });

                    

                }

                if(decryptResp.data.policyHolder.step_no == 1 || decryptResp.data.policyHolder.step_no > 1){

                    let risk_arr = JSON.parse(decryptResp.data.policyHolder.smeinfo.risk_address);

                    this.props.setRiskData(
                        {
                            house_building_name:risk_arr.house_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:decryptResp.data.policyHolder.smeinfo.pincode,
                            pincode_id:decryptResp.data.policyHolder.smeinfo.pincode_id,

                            buildings_sum_insured:decryptResp.data.policyHolder.smeinfo.buildings_sum_insured,
                            content_sum_insured:decryptResp.data.policyHolder.smeinfo.content_sum_insured,
                            stock_sum_insured:decryptResp.data.policyHolder.smeinfo.stock_sum_insured
                        }
                    );
                }

                // if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

                //     this.props.setSmeOthersDetails({
                    
                //         Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                //         previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                //         previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                //         Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                //         insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                //         previous_city:decryptResp.data.policyHolder.previouspolicy.address
        
                //     });

                // }

                if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){

                    let address = JSON.parse(decryptResp.data.policyHolder.address);

                    this.props.setSmeProposerDetails(
                        {
                            first_name:decryptResp.data.policyHolder.first_name,
                            last_name:decryptResp.data.policyHolder.last_name,
                            salutation_id:decryptResp.data.policyHolder.salutation_id,
                            date_of_birth:decryptResp.data.policyHolder.dob,
                            email_id:decryptResp.data.policyHolder.email_id,
                            mobile:decryptResp.data.policyHolder.mobile,
                            gender:decryptResp.data.policyHolder.gender,
                            pan_no:decryptResp.data.policyHolder.pancard,
                            gstn_no:decryptResp.data.policyHolder.gstn_no,

                            com_street_name:address.street_name,
                            com_plot_no:address.plot_no,
                            com_building_name:address.house_building_name,
                            com_block_no:address.block_no,
                            com_house_flat_no:address.house_flat_no,
                            com_pincode:decryptResp.data.policyHolder.pincode,
                            com_pincode_id:decryptResp.data.policyHolder.pincode_id
                        }
                    );
                }

                let pincode_area_arr = JSON.parse(decryptResp.data.policyHolder.pincode_response);
                
                this.setState(
                    {
                        // salutationName:decryptResp.data.policyHolder.salutation.displayvalue ,
                        // pincodeArea:pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM != null ? pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM : 0,
                        // quoteId:decryptResp.data.policyHolder.request_data.quote_id != null ? decryptResp.data.policyHolder.request_data.quote_id : 0,
                        // gst:decryptResp.data.policyHolder.request_data.service_tax != null ? decryptResp.data.policyHolder.request_data.service_tax : 0,
                        // netPremium:decryptResp.data.policyHolder.request_data.net_premium != null ? decryptResp.data.policyHolder.request_data.net_premium : 0,
                        // finalPremium:decryptResp.data.policyHolder.request_data.payable_premium != null ? decryptResp.data.policyHolder.request_data.payable_premium : 0,

                        salutationName:decryptResp.data.policyHolder.salutation.displayvalue,
                        pincodeArea:pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM,
                        quoteId:decryptResp.data.policyHolder.request_data.quote_id,
                        gst:decryptResp.data.policyHolder.request_data.service_tax,
                        grossPremium:decryptResp.data.policyHolder.request_data.gross_premium,
                        payablePremium:decryptResp.data.policyHolder.request_data.payable_premium,
                        refNumber:decryptResp.data.policyHolder.reference_no,
                        logo:decryptResp.data.policyHolder.bcmaster.paymentgateway.logo,
                        policyHolder:decryptResp.data.policyHolder
                    }
                );

                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                return false;
            })
        
        
    }

    render() {
        const { policyHolder, show, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, relation, memberdetails,nomineedetails, vehicleDetails, breakin_flag } = this.state
        const { productId } = this.props.match.params

        const policyHolder_refNo = queryString.parse(this.props.location.search).access_id ? 
        queryString.parse(this.props.location.search).access_id : 
        localStorage.getItem("policyHolder_refNo")

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

                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SME Pre UW</h4>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                validationSchema={validatePremium}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <section className="brand m-t-11 m-b-25">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead m-b-10">
                                                            <h4>SME FIRE </h4>
                                                        </div>
                                                    </div>
                                                    <div className="brandhead m-b-30">
                                                        <h5>{errMsg}</h5>
                                                        <h5>{paymentErrMsg}</h5>
                                                        <h4>
                                                            {/* Policy Reference Number {fulQuoteResp.QuotationNo} */}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                        <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Proposer Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        <div>
                                                                            {/* <strong>Proposer Details:</strong>
                                                                            <br/> */}
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Title:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.salutationName}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>First Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.first_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Last Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.last_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Email:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.email_id}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Date Of Birth:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{moment(new Date(this.props.date_of_birth)).format('LL')}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Mobile Number:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.mobile}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Gender:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.getGender(this.props.gender)}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>GSTN:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.gstn_no}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Pan No.:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.pan_no}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                    </div>
                                                                </Collapsible>
                                                            </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Communication Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        <div>
                                                                            {/* <strong>Communication Details:</strong>
                                                                            <br/> */}
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>House/Building Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_building_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Street Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_street_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Plot No.:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_plot_no}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Pincode:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_pincode}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Pincode Area:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.pincodeArea}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                    </div>
                                                                </Collapsible>    
                                                            </div>

                                                            <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Premium Details"  open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <Row>
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Premium:
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.payablePremium}
                                                                                </div>
                                                                            </Col>
                                                                            
                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    GST:
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.gst}
                                                                                </div>
                                                                            </Col>

                                                                            <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    Gross Premium:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {this.state.grossPremium}
                                                                                </div>
                                                                            </Col>

                                                                            {/* <Col sm={12} md={3}>
                                                                                <div className="motopremium">
                                                                                    GST:
                                                                                </div>
                                                                            </Col>


                                                                            <Col sm={12} md={3}>
                                                                                <div className="premamount">
                                                                                    ₹ {Math.round(fulQuoteResp.TGST)}
                                                                                </div>
                                                                            </Col> */}
                                                                        </Row>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                           

                                                            <Row>
                                                            <Col sm={12} md={6}>
                                                            </Col>
                                                                <Col sm={12} md={6}>
                                                                    <FormGroup>
                                                                    {/* <div className="paymntgatway">
                                                                        Select Payment Gateway
                                                                        <div>
                                                                        <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" />
                                                                        { policyHolder && policyHolder.bcmaster && policyHolder.bcmaster.paymentgateway && policyHolder.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolder.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                        null
                                                                        }
                                                                        </div>
                                                                    </div> */}
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
                                                                <Button className="backBtn" type="button" onClick={this.additionalDetails.bind(this,productId)}>Back</Button>
                                                                {this.state.quoteId && this.state.quoteId != '' && values.gateway != "" ?
                                                                    <Button type="submit"
                                                                        className="proceedBtn"  type="submit"  disabled={isSubmitting ? true : false}>
                                                                        Generate Policy
                                                                </Button> 
                                                            : null}
                                                            </div>
                                                        </Col>
                                                        <Col sm={12} md={3}>
                                                        <div className="regisBox medpd">
                                                            <h5 className="medihead">Exclusions: </h5>
                                                            <h4>
                                                                <ul>
                                                                    <li className="txtRegistr resmb-15">Shops on wheels</li>
                                                                    <li className="txtRegistr resmb-15">Kutcha Construction</li>
                                                                    <li className="txtRegistr resmb-15">Basement Risks</li>
                                                                    <li className="txtRegistr resmb-15">Shops dealing in Fire-Crackers / Arms / Ammunition, Precious Jewellery </li>
                                                                    <li className="txtRegistr resmb-15">Godown / Standalone Storage Risks</li>
                                                                </ul>
                                                            </h4>
                                                        </div>
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

        policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
        menumaster_id:state.sme_fire.menumaster_id,
        policy_holder_id:state.sme_fire.policy_holder_id,

        start_date: state.sme_fire.start_date,
        end_date: state.sme_fire.end_date,


        house_building_name: state.sme_fire.house_building_name,
        block_no: state.sme_fire.block_no,
        street_name: state.sme_fire.street_name,
        content_sum_insured: state.sme_fire.content_sum_insured,
        house_flat_no: state.sme_fire.house_flat_no,
        pincode: state.sme_fire.pincode,
        pincode_id: state.sme_fire.pincode_id,
        buildings_sum_insured: state.sme_fire.buildings_sum_insured,
        content_sum_insured: state.sme_fire.content_sum_insured,
        stock_sum_insured: state.sme_fire.stock_sum_insured,

        first_name:state.sme_fire.first_name,
        last_name:state.sme_fire.last_name,
        salutation_id:state.sme_fire.salutation_id,
        date_of_birth:state.sme_fire.date_of_birth,
        email_id:state.sme_fire.email_id,
        mobile:state.sme_fire.mobile,
        gender:state.sme_fire.gender,
        pan_no:state.sme_fire.pan_no,
        gstn_no:state.sme_fire.gstn_no,

        com_street_name:state.sme_fire.com_street_name,
        com_plot_no:state.sme_fire.com_plot_no,
        com_building_name:state.sme_fire.com_building_name,
        com_block_no:state.sme_fire.com_block_no,
        com_house_flat_no:state.sme_fire.com_house_flat_no,
        com_pincode:state.sme_fire.com_pincode,
        com_pincode_id:state.sme_fire.com_pincode_id,

        
        previous_start_date:state.sme_fire.previous_start_date,
        previous_end_date:state.sme_fire.previous_end_date,
        Previous_Policy_No:state.sme_fire.Previous_Policy_No,
        insurance_company_id:state.sme_fire.insurance_company_id,
        previous_city:state.sme_fire.previous_city,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData:(data) => dispatch(setSmeData(data)),
        setRiskData:(data) => dispatch(setSmeRiskData(data)),
        setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
        setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Premium_sme)
);
