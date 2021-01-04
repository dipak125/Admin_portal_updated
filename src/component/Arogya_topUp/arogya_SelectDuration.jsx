import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import { addDays } from 'date-fns';
import Footer from '../common/footer/Footer';
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment from "moment";
import swal from 'sweetalert';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from "yup";
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes
} from "../../shared/validationFunctions";

import Encryption from '../../shared/payload-encryption';

let minSumInsured = 100000;
let maxSumInsured = 5000000;
let minSumTenure = 1;
let maxSumTenure = 3;
let minSumDeductable = 100000;
let maxSumDeductable = 1000000;
let defaultSliderVal = 2500000;
let defaultdeductibleSliderValue = 400000;
let defaulttenureSliderValue = 2;

const initialValues = {
    polStartDate: "",
    polEndDate: "",
    insureValue: "5",
    select_sum_insured: "",
    select_deductible: "",
    select_tenure: "",
}

const today = moment().add(30, 'days');;
const disableFutureDt = current => {
    return current.isBefore(today)
}

const sum_assured = {
    "100000.00": 1,
    "150000.00": 2,
    "200000.00": 3,
    "250000.00": 4,
    "300000.00": 5,
    "350000.00": 6,
    "400000.00": 7,
    "450000.00": 8,
    "500000.00": 9
}

const validateDuration = Yup.object().shape({
    polStartDate: Yup.date().required("Please enter start date").test(
        "checkGreaterTimes",
        "Start date must be less than end date",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.polEndDate);
            }
            return true;
        }
    ).test(
        "checkStartDate",
        "Enter Start Date",
        function (value) {
            if (this.parent.polEndDate != undefined && value == undefined) {
                return false;
            }
            return true;
        }
    ),
    polEndDate: Yup.date().required("Please enter end date").test(
        "checkGreaterTimes",
        "End date must be greater than start date",
        function (value) {
            if (value) {
                return checkGreaterTimes(value, this.parent.polStartDate);
            }
            return true;
        }
    ).test(
        "checkEndDate",
        "Enter End Date",
        function (value) {
            if (this.parent.polStartDate != undefined && value == undefined) {
                return false;
            }
            return true;
        }
    ),
    // slider_sum_insured: Yup.string().required(function () {
    //     return "Please enter sum insured"
    // })
})

class arogya_SelectDuration extends Component {

    state = {
        accessToken: "",
        policyHolderDetails: [],
        polStartDate: "",
        EndDate: "",
        insureValue: "",
        error: [],
        endDateFlag: false,
        serverResponse: [],
        SliderVal: '',
        sliderVal: '',
    };


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    medicalQuestions = (productId) => {
        this.props.history.push(`/arogya_MedicalDetails/${productId}`);
    }

    handleSubmit = (values) => {
        let defaultSliderValue = 0
        // let defaultSumSliderValue = 0
        // let defaultdeductibleSliderValue = 0
        // let defaulttenureSliderValue = 0
        const { productId } = this.props.match.params
        const { serverResponse, SliderVal} = this.state
        const formData = new FormData();
        let encryption = new Encryption();

        // formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        let policy_holder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') : 0
        let SumInsuredsliderVal = values.slider_sum_insured ? values.slider_sum_insured : 0
        let deductibleSliderVal = values.slider_deductible ? values.slider_deductible : 0
        let tenureSliderVal = values.slider_tenure ? values.slider_tenure : 0


        const post_data = {
            'page_name': 'arogya_SelectDuration/12',
            'policy_holder_id': policy_holder_id,
            'start_date': serverResponse.EffectiveDate,
            'end_date': serverResponse.ExpiryDate,
            'gross_premium': serverResponse.GrossPremium,
            'service_tax': serverResponse.TGST,
            'swatch_bharat_cess': 0,
            'krishi_kalayan_cess': 0,
            'net_premium': serverResponse.DuePremium,
            // 'sum_insured':values.insureValue,
            // 'sum_insured': SliderVal ? parseInt(SliderVal) : parseInt(defaultSliderValue),
            // 'deductible': deductibleSliderVal ? parseInt(deductibleSliderVal) : parseInt(defaultSliderValue),
            // 'tenure_year': tenureSliderVal ? parseInt(tenureSliderVal) : parseInt(defaultSliderValue),
            'sum_insured': parseInt(SumInsuredsliderVal),
            'deductible': parseInt(deductibleSliderVal),
            'tenure_year': parseInt(tenureSliderVal),
        }
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        
        console.log('Handle--submit----',post_data)
        this.props.loadingStart();
        axios
            .post(`/arogya-topup/duration-premium`, formData)
            .then(res => {
                this.props.history.push(`/arogya_Address/${productId}`);
            })
            .catch(err => {
                let decryptResp = JSON.parse(encryption.decrypt(err.data))
                console.log("decrypt---error--", decryptResp)
                this.props.loadingStop();
            });
        this.props.loadingStop();

    }


    getPolicyHolderDetails = () => {
        this.props.loadingStart();
        let encryption = new Encryption();
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        console.log("policyHolderDetails-----", this.policyHolderDetails)
        axios.get(`arogya-topup/health-policy-details/${policyHolder_refNo}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt", decryptResp.data.policyHolder)
                let policyHolderDetails= decryptResp.data.policyHolder
                this.setState({
                    policyHolderDetails: policyHolderDetails,
                    SliderVal: decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data.sum_insured : 0, 

                    deductibleSliderVal: decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data.deductible : 0, 

                    tenureSliderVal: decryptResp.data.policyHolder && decryptResp.data.policyHolder.request_data ? decryptResp.data.policyHolder.request_data.tenure_year : 0
                })
                var values = []
                let policyDetails = policyHolderDetails && policyHolderDetails.request_data ? policyHolderDetails.request_data : [] 

                values['polStartDate'] = policyDetails && policyDetails.start_date ? moment(policyDetails.start_date).format("YYYY-MM-DD") : new Date()
                values['polEndDate'] = policyDetails && policyDetails.end_date ? moment(policyDetails.end_date).format("YYYY-MM-DD") : new Date(moment(values['polStartDate']).add(1, 'years').format("YYYY-MM-DD"))
                values['slider_sum_insured'] = policyDetails && policyDetails.sum_insured ? parseInt(policyDetails.sum_insured) : defaultSliderVal
                values['slider_deductible'] = policyDetails && policyDetails.deductible ? parseInt(policyDetails.deductible) : defaultdeductibleSliderValue
                values['slider_tenure'] = policyDetails && policyDetails.tenure_year ? parseInt(policyDetails.tenure_year) : defaulttenureSliderValue

                this.quote(values)
            })
            .catch(err => {
                this.setState({
                    policyHolderDetails: []
                });
                this.props.loadingStop();
            });
    }

    SliderValue = (value) => {
        this.setState({
            SliderVal: value,
            serverResponse: [],
            error: []
        })
    }
    deductibleSliderValue = (value) => {
        this.setState({
            deductibleSliderVal: value,
            serverResponse: [],
            error: []
        })
    }
    tenureSliderValue = (value) => {
        this.setState({
            tenureSliderVal: value,
            serverResponse: [],
            error: []
        })
    }

    quote = (values) => {
        let polStartDate = moment(values.polStartDate).format("YYYY-MM-DD");
        let polEndDate = moment(values.polEndDate).format("YYYY-MM-DD");
        let SumInsuredsliderVal = values.slider_sum_insured ? values.slider_sum_insured : 0
        let deductibleSliderVal = values.slider_deductible ? values.slider_deductible : 0
        let tenureSliderVal = values.slider_tenure ? values.slider_tenure : 0
        const formData = new FormData();
        this.props.loadingStart();

        const post_data = {
            'policy_reference_no': localStorage.getItem('policyHolder_refNo'),
            'start_date': polStartDate,
            'end_date': polEndDate,
            'sum_insured': parseInt(SumInsuredsliderVal),
            'deductible': parseInt(deductibleSliderVal),
            'tenure_year': parseInt(tenureSliderVal),
        }
        console.log('post_data-----', post_data);

        let encryption = new Encryption();
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        axios
            .post(`/arogya-topup/fullQuoteServiceArogyaTopup`, formData)
            .then(res => {
                // let decryptResp = JSON.parse(encryption.decrypt(res.data))
                let decryptResp = res.data
                console.log("decrypt---quote--service---", decryptResp)

                if (decryptResp.PolicyObject && decryptResp.UnderwritingResult && decryptResp.UnderwritingResult.Status == "Success") {
                    this.setState({
                        fulQuoteResp: decryptResp.PolicyObject,
                        serverResponse: decryptResp.PolicyObject,
                        error: []
                    })
                }
                else if (decryptResp.PolicyObject && decryptResp.UnderwritingResult && decryptResp.UnderwritingResult.Status == "Fail") {
                    this.setState({
                        fulQuoteResp: decryptResp.PolicyObject,
                        serverResponse: [],
                        error: { "message": 1 }
                    })
                }
                else {
                    this.setState({
                        fulQuoteResp: [],
                        error: decryptResp.ValidateResult,
                        serverResponse: []
                    });
                }
                this.props.loadingStop();
            })
            .catch(err => {
                // let decryptResp = JSON.parse(encryption.decrypt(err.data))
                let decryptResp = err.data
                console.log("decrypt---quote--service---", decryptResp)
                this.setState({
                    serverResponse: []
                });
                this.props.loadingStop();
            });
    }


    handleChange = (value) => {
        let endDate = moment(value).add(1, 'years').format("YYYY-MM-DD")
        this.setState({
            EndDate: endDate,
            endDateFlag: true,
            serverResponse: [],
            error: []
        })
    }
    handleAmountChange = (e) => {
        this.setState({
            serverResponse: [],
            error: []
        })
    }




    componentDidMount() {
        this.getPolicyHolderDetails();
        // this.getAccessToken();
    }

    render() {
        const { productId } = this.props.match.params
        const { policyHolderDetails, serverResponse, error, EndDate, endDateFlag } = this.state
        const request_data = policyHolderDetails ? policyHolderDetails.request_data : null;
        let start_date = request_data && request_data.start_date ? new Date(request_data.start_date) : '';
        const { SliderVal, deductibleSliderVal, tenureSliderVal } = this.state

        let end_date = request_data && request_data.end_date ? new Date(request_data.end_date) : "";
        // console.log("policyHolderDetails-----", this.state.policyHolderDetails.request_data.deductible)


        const newInitialValues = Object.assign(initialValues, {
            polStartDate: start_date ? start_date : new Date,
            polEndDate: end_date ? end_date : new Date(moment().add(1, 'years').format("YYYY-MM-DD")),
            // insureValue: policyHolderDetails && policyHolderDetails.request_data && policyHolderDetails.request_data.sum_insured ? Math.floor(policyHolderDetails.request_data.sum_insured) : initialValues.insureValue
            // insureValue: policyHolderDetails && policyHolderDetails.request_data && policyHolderDetails.request_data.sum_insured ? sum_assured[policyHolderDetails.request_data.sum_insured] : initialValues.insureValue,

            slider_sum_insured: SliderVal ? SliderVal : defaultSliderVal, 

            slider_deductible: deductibleSliderVal ? deductibleSliderVal : defaultdeductibleSliderValue,
            
            slider_tenure: tenureSliderVal ? tenureSliderVal : defaulttenureSliderValue,
        })

        const errMsg = error && error.message ? (
            <span className="errorMsg"><h6><strong>Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111</strong></h6></span>
        ) : null

        console.log("serverResponse--------------- ", serverResponse)

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">Arogya Top Up Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Select the duration for your Health Insurance</h4>
                                        </div>
                                        <Formik initialValues={newInitialValues}
                                            onSubmit={serverResponse && serverResponse != "" ? (serverResponse.message ? this.quote : this.handleSubmit) : this.quote}
                                            validationSchema={validateDuration}
                                        >
                                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                                console.log("errors--------------- ", errors)
                                                return (
                                                    <Form>
                                                        <Row>
                                                            <Col sm={12} md={9} lg={9}>

                                                                <Row className="m-b-25">
                                                                    <Col sm={12} md={3} lg={3}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                Policy Start Date
                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={3}>
                                                                        <FormGroup>
                                                                            <DatePicker
                                                                                name="polStartDate"
                                                                                minDate={new Date()}
                                                                                maxDate={addDays(new Date(), 30)}
                                                                                showDisabledMonthNavigation
                                                                                dateFormat="dd MMM yyyy"
                                                                                placeholderText="Start Date"
                                                                                dropdownMode="select"
                                                                                className="datePckr"
                                                                                onChange={(value) => {
                                                                                    setFieldTouched("polStartDate");
                                                                                    setFieldValue("polStartDate", value);
                                                                                    setFieldValue("polEndDate", addDays(new Date(), 364));
                                                                                    this.handleChange(value);
                                                                                }}
                                                                                selected={values.polStartDate}
                                                                            />
                                                                            {errors.polStartDate && touched.polStartDate ? (
                                                                                <span className="errorMsg">{errors.polStartDate}</span>
                                                                            ) : null}
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col sm={12} md={3} lg={3}>
                                                                        <FormGroup>
                                                                            Policy End Date
                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={3}>
                                                                        <FormGroup>
                                                                            <DatePicker
                                                                                name="polEndDate"
                                                                                dateFormat="dd MMM yyyy"
                                                                                placeholderText="End Date"
                                                                                disabled={true}
                                                                                className="datePckr"
                                                                                selected={addDays(new Date(values.polStartDate), 364)}
                                                                            />
                                                                            {errors.polEndDate && touched.polEndDate ? (
                                                                                <span className="errorMsg">{errors.polEndDate}</span>
                                                                            ) : null}
                                                                        </FormGroup>
                                                                    </Col>

                                                                </Row>
                                                                <Row>
                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                Select Sum Insured
                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={2}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name="select_sum_insured"
                                                                                    type="text"
                                                                                    placeholder=""
                                                                                    autoComplete="off"
                                                                                    className="premiumslid"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={SliderVal ? SliderVal : defaultSliderVal}
                                                                                />
                                                                                {errors.sum_insured_value && touched.sum_insured_value ? (
                                                                                    <span className="errorMsg">{errors.sum_insured_value}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col sm={12} md={12} lg={6}>
                                                                        <FormGroup>
                                                                            <input type="range" className="W-90 slider-riage"
                                                                                name='slider_sum_insured'
                                                                                // defaultValue= {defaultSumSliderValue}
                                                                                min={minSumInsured}
                                                                                max={maxSumInsured}
                                                                                step='100000'
                                                                                value={values.slider_sum_insured}
                                                                                onChange={(e) => {
                                                                                    setFieldTouched("slider_sum_insured");
                                                                                    setFieldValue("slider_sum_insured", e.target.value);
                                                                                    this.SliderValue(e.target.value)
                                                                                }}
                                                                            />
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                Select Deductible
                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={2}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name="select_deductible"
                                                                                    type="text"
                                                                                    placeholder=""
                                                                                    autoComplete="off"
                                                                                    className="premiumslid"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={deductibleSliderVal ? deductibleSliderVal : defaultdeductibleSliderValue}
                                                                                />
                                                                                {errors.deductible_value && touched.deductible_value ? (
                                                                                    <span className="errorMsg">{errors.deductible_value}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col sm={12} md={12} lg={6}>
                                                                        <FormGroup>
                                                                            <input type="range" className="W-90 slider-riage"
                                                                                name='slider_deductible'
                                                                                // defaultValue= {defaultdeductibleSliderValue}
                                                                                min={minSumDeductable}
                                                                                max={maxSumDeductable}
                                                                                step='100000'
                                                                                value={values.slider_deductible}
                                                                                onChange={(e) => {
                                                                                    setFieldTouched("slider_deductible");
                                                                                    setFieldValue("slider_deductible", e.target.value);
                                                                                    this.deductibleSliderValue(e.target.value)
                                                                                }}
                                                                            />
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>
                                                                <Row>
                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                Select Tenure (Year)
                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={2}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name="select_tenure"
                                                                                    type="text"
                                                                                    placeholder=""
                                                                                    autoComplete="off"
                                                                                    className="premiumslid"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                    value={tenureSliderVal ? tenureSliderVal : defaulttenureSliderValue}
                                                                                />
                                                                                {errors.select_tenure && touched.select_tenure ? (
                                                                                    <span className="errorMsg">{errors.select_tenure}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>

                                                                    <Col sm={12} md={12} lg={6}>
                                                                        <FormGroup>
                                                                            <input type="range" className="W-90 slider-riage"
                                                                                name='slider_tenure'
                                                                                // defaultValue= {defaulttenureSliderValue}
                                                                                min={minSumTenure}
                                                                                max={maxSumTenure}
                                                                                step='1'
                                                                                value={values.slider_tenure}
                                                                                onChange={(e) => {
                                                                                    setFieldTouched("slider_tenure");
                                                                                    setFieldValue("slider_tenure", e.target.value);
                                                                                    this.tenureSliderValue(e.target.value)
                                                                                }}
                                                                            />
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>
                                                                <div className="d-flex justify-content-left carloan m-b-25">
                                                                    <h4> Premium</h4>
                                                                </div>
                                                                <Row>
                                                                    <Col sm={12}>
                                                                        <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                                                            <p>Your Total Premium for One Year :</p>
                                                                            {/* <p><strong>Rs:</strong> { serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium ) : 0}</p> */}
                                                                            <p><strong>Rs:</strong> {serverResponse ? serverResponse.DuePremium : 0}</p>
                                                                        </div>
                                                                    </Col>

                                                                    <Col sm={12}>
                                                                        <div className="justify-content-left align-items-center list m-b-30">
                                                                            <p>Your Health Insurance covers you for following :</p>
                                                                            <ul>
                                                                                <li>Your hospital room rent,boarding expenses and doctor fees</li>
                                                                                <li>Nursing expenses.Operation theatre and ICU charges</li>
                                                                                <li>Medicines that you consume during the hospital stay</li>
                                                                                <li>Road Ambulance Charges</li>
                                                                                <li>Pre and Post hospitalization expenses up to 30 and 60 days respectively</li>
                                                                            </ul>
                                                                        </div>
                                                                    </Col>
                                                                    <div className="d-flex justify-content-left resmb">
                                                                        <Button className={`backBtn`} type="button" onClick={this.medicalQuestions.bind(this, productId)} >
                                                                            Back
                                                    </Button>
                                                                        {serverResponse && serverResponse != "" ? (serverResponse.message ?
                                                                            <Button className={`proceedBtn`} type="submit"  >
                                                                                Recalculate
                                                     </Button> : <Button className={`proceedBtn`} type="submit"  >
                                                                                Continue
                                                    </Button>) : <Button className={`proceedBtn`} type="submit"  >
                                                                                Recalculate
                                                    </Button>}

                                                                    </div>
                                                                </Row>
                                                                <Row><div>&nbsp;</div></Row>
                                                                <Row><div>{errMsg}</div></Row>
                                                            </Col>

                                                            <Col sm={12} md={3}>
                                                                <div className="regisBox grossbox">
                                                                    {/* <h5 className="medihead">Gross Premium : <span>₹ {serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium) : 0}</span></h5> */}
                                                                    <table class="table">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>Gross Premium:</td>
                                                                                <td>₹{Math.round(serverResponse ? (serverResponse.message ? 0 : serverResponse.BeforeVatPremium) : 0)}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>GST:</td>
                                                                                <td>₹{Math.round(serverResponse ? (serverResponse.message ? 0 : serverResponse.TGST) : 0)}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Net Premium:</td>
                                                                                <td>₹{serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium) : 0}</td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </Col>

                                                        </Row>
                                                    </Form>
                                                );
                                            }}
                                        </Formik>
                                    </div>
                                </section>
                                <Footer />
                            </div>
                        </div>
                    </div>
                </BaseComponent>

            </>
        );
    }
}

const mapStateToProps = state => {
    return {
        loading: state.loader.loading
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop())
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(arogya_SelectDuration));