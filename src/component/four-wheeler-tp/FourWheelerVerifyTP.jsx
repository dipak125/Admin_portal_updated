import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import Encryption from '../../shared/payload-encryption';
import * as Yup from "yup";
import swal from 'sweetalert';
import moment from "moment";
import {  PersonAge } from "../../shared/dateFunctions";
import { addDays } from 'date-fns';
import {
    checkGreaterTimes,
    checkGreaterStartEndTimes, validRegistrationNumber
  } from "../../shared/validationFunctions";


let encryption = new Encryption();

const ageObj = new PersonAge();
const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment(minDate).add(30, 'day').calendar();
const minRegnDate = moment().subtract(18, 'years').calendar();

const fuel = {
    1: 'Petrol',
    2: 'Diesel'
}

const initialValue = {
    registration_no: "",
    chasis_no: "",
    chasis_no_last_part: "",
    cng_kit: 0,
    // cngKit_Cost: 0,
    engine_no: "",
    vahanVerify: false,
    newRegistrationNo: "",
    previous_start_date: "",
    previous_end_date: "",
    previous_policy_no: "",
    previous_policy_name: "",
    insurance_company_id: 0,
    policy_type_id: "",
    puc: '1'
}
const ComprehensiveValidation = Yup.object().shape({

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",       
        then: Yup.string(),
        otherwise: Yup.string().required('Please provide registration number')
        .test(
            "last4digitcheck",
            function() {
                return "Invalid Registration number"
            },
            function (value) {
                if (value && (value != "" || value != undefined)) {             
                    return validRegistrationNumber(value);
                }   
                return true;
            }
        )
    }),

    puc: Yup.string().required("Please verify pollution certificate to proceed"),

    chasis_no_last_part:Yup.string().required('This field is required')
    .matches(/^([0-9]*)$/, function() {
        return "Invalid number"
    })
    .min(5, function() {
        return "Chasis no. should be last 5 digit"
    })
    .max(5, function() {
        return "Chasis no. should be last 5 digit"
    }),

    engine_no:Yup.string().required('Engine no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid engine number"
    })
    .min(5, function() {
        return "Engine no. should be minimum 5 characters"
    })
    .max(17, function() {
        return "Engine no. should be maximum 17 characters"
    }),

    chasis_no:Yup.string().required('Chasis no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid chasis number"
    })
    .min(5, function() {
        return "Chasis no. should be minimum 5 characters"
    })
    .max(17, function() {
        return "Chasis no. should be maximum 17 characters"
    }),

    vahanVerify:Yup.boolean().notRequired('Please verify chasis number')
    .test(
        "vahanVerifyChecking",
        function() {
            return "Please verify chasis number"
        },
        function (value) {
            if (value == false && this.parent.chasis_no_last_part && this.parent.chasis_no_last_part.length == 5) {  
                return false;
            }
            return true;
        }
    ),

    previous_start_date:Yup.date()
    .notRequired('Previous Start date is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter Start date"
        },
        function (value) {
            if (this.parent.policy_type_id == 2 && !value) {   
                return false;    
            }
            return true;
        }
    ).test(
        "checkGreaterTimes",
        "Start date must be less than end date",
        function (value) {
            if (value) {
                return checkGreaterStartEndTimes(value, this.parent.previous_end_date);
            }
            return true;
        }
    ).test(
      "checkStartDate",
      "Enter Start Date",
      function (value) {       
          if ( this.parent.previous_end_date != undefined && value == undefined) {
              return false;
          }
          return true;
      }
    ),
    previous_end_date:Yup.date()
    .notRequired('Previous end date is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter end date"
        },
        function (value) {
            if (this.parent.policy_type_id == 2 && !value) {   
                return false;    
            }
            return true;
        }
    ).test( 
        "checkGreaterTimes",
        "End date must be greater than start date",
        function (value) {
            if (value) {
                return checkGreaterTimes(value, this.parent.previous_start_date);
            }
            return true;
        }
        ).test(
        "checkEndDate",
        "Enter End Date",
        function (value) {     
            if ( this.parent.previous_start_date != undefined && value == undefined) {
                return false;
            }
            return true;
        }
    ),
    previous_policy_name:Yup.string()
    .notRequired('Please select Policy Type')
    .test(
        "currentMonthChecking",
        function() {
            return "Please select Policy Type"
        },
        function (value) {
            if (this.parent.policy_type_id == 2 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    insurance_company_id:Yup.number()
    .notRequired('Insurance company is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous insurance company"
        },
        function (value) {
            if (this.parent.policy_type_id == 2 && !value) {   
                return false;    
            }
            return true;
        }
    ),
    previous_city:Yup.string()
    .notRequired('Previous city is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous insurance company city"
        },
        function (value) {
            if (this.parent.policy_type_id == 2 && !value) {   
                return false;    
            }
            return true;
        }
    )
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/, 
        function() {
            return "Please enter valid address"
        }),

    previous_policy_no:Yup.string()
    .notRequired('Previous policy number is required')
    .test(
        "currentMonthChecking",
        function() {
            return "Please enter previous policy number"
        },
        function (value) {
            if (this.parent.policy_type_id == 2 && !value) {   
                return false;    
            }
            return true;
        }
    )
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/, 
        function() {
            return "Please enter valid policy number"
        }).min(6, function() {
            return "Policy No. must be minimum 6 chracters"
        })
        .max(28, function() {
            return "Policy No. must be maximum 28 chracters"
        }),

   
});



class FourWheelerVerifyTP extends Component {

        state = {
            previousPolicy: [],
            motorInsurance: [],
            vahanDetails: [],
            vahanVerify: false,
            policyCoverage: [],
            regno:'',
            chasiNo:'',
            engineNo:'',
            length:15,
            insurerList: [],
            vehicleDetails: [],
            step_completed: "0",
            request_data: []
        };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    selectVehicleBrand = (productId) => {
        if(localStorage.getItem('brandEdit') == '1') {
            localStorage.setItem('newBrandEdit', 1)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            localStorage.setItem('newBrandEdit', '2')
        }
        this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`);
    }

    selectBrand = (productId) => {
        this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`);
    }

    otherComprehensive = (productId) => {      
        this.props.history.push(`/four_wheeler_OtherComprehensiveTP/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        this.props.loadingStart();
        axios.get(`four-wh-tp/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decryptResp====", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                this.getInsurerList()
                this.setState({
                    motorInsurance, previousPolicy,vehicleDetails,step_completed,request_data,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }



    getVahanDetails = async(values, setFieldTouched, setFieldValue, errors) => {

        const formData = new FormData();
        if(values.newRegistrationNo == "NEW") {
            formData.append("regnNo", values.newRegistrationNo);
            setFieldTouched('registration_no');
            setFieldValue('registration_no', values.newRegistrationNo);
        }
        else {
            formData.append("regnNo", values.registration_no);
        }

        formData.append("chasiNo", values.chasis_no_last_part);
        formData.append("policy_holder_id", this.state.request_data.policyholder_id);
        
        if(errors.registration_no || errors.chasis_no_last_part) {
            swal("Please provide correct Registration number and Chasis number")
        }
        else {
            if(values.newRegistrationNo != "NEW") {
                this.props.loadingStart()
                await axios
                .post(`/getVahanDetails`,formData)
                .then((res) => {
                    this.setState({
                    vahanDetails: res.data,
                    vahanVerify:  true 
                    });

                    if(this.state.vahanDetails.data[0].chasiNo){
                        this.setState({chasiNo: this.state.vahanDetails.data[0].chasiNo})
                    }

                    if(this.state.vahanDetails.data[0].engineNo){
                        this.setState({engineNo: this.state.vahanDetails.data[0].engineNo})
                    }

                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true)
                    setFieldTouched('engine_no')
                    setFieldValue('engine_no', this.state.engineNo)
                    setFieldTouched('chasis_no')
                    setFieldValue('chasis_no', this.state.chasiNo)

                    this.props.loadingStop();
                })
                .catch((err) => {
                    this.setState({
                        vahanDetails: [],
                        vahanVerify:  true 
                    });
                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true) 
                    // swal("Please provide correct Registration number and Chasis number")
                    this.props.loadingStop();
                });
            }
            else {
                this.props.loadingStart()
                    this.setState({
                    vahanDetails: [],
                    vahanVerify:  true 
                    });
    
                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true) 
    
                    this.props.loadingStop();
            }

        }
    };

    getInsurerList = () => {
        axios
          .get(`/company/1`)
          .then(res => {
            this.setState({
                insurerList: res.data.data
            });
          })
          .catch(err => {
            this.setState({
                insurerList: []
            });
            this.props.loadingStop();
          });
    }


    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { motorInsurance, request_data } = this.state
        
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if(motorInsurance.policytype_id == '3'){
            post_data = {
                'policy_holder_id': request_data.policyholder_id,
                'menumaster_id': 1,
                'registration_no': values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'engine_no': values.engine_no,
                'prev_policy_flag': 0,
                'cng_kit': 0,
                'page_name': `four_wheeler_verifyTP/${productId}`,
            }
        }
        else {
            post_data = {
                'policy_holder_id': request_data.policyholder_id,
                'menumaster_id': 1,
                'registration_no': values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'engine_no': values.engine_no,
                'prev_policy_flag': 1,
                'previous_start_date':moment(values.previous_start_date).format("YYYY-MM-DD"),
                'previous_end_date':moment(values.previous_end_date).format("YYYY-MM-DD"),
                'previous_policy_no': values.previous_policy_no,
                'previous_policy_name':values.previous_policy_name,
                'insurance_company_id':values.insurance_company_id,
                'cng_kit': 0,
                'previous_city':values.previous_city,
                'page_name': `four_wheeler_verifyTP/${productId}`,
                        
            }
        }
        // console.log('post_data',post_data)
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('four-wh-tp/previous-vehicle-details', formData).then(res => {
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            // console.log('decryptResp-----', decryptResp)
            if (decryptResp.error == false) {
                this.props.history.push(`/four_wheeler_additional_detailsTP/${productId}`);
            }
            else {
                swal(decryptResp.msg)
            }

        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
            let decryptErr = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptErr-----', decryptErr)
        })
    }


regnoFormat = (e, setFieldTouched, setFieldValue) => {
        
        let regno = e.target.value
        // this.setState({fastLaneData: [], brandView: '0', vehicleDetails: []})
        // let brandEdit = {'brandEdit' : 1}
        // this.props.setData(brandEdit)
        // let formatVal = ""
        // let regnoLength = regno.length
        // var letter = /^[a-zA-Z]+$/;
        // var number = /^[0-9]+$/;
        // let subString = regno.substring(regnoLength-1, regnoLength)
        // let preSubString = regno.substring(regnoLength-2, regnoLength-1)
    
        // if(subString.match(letter) && preSubString.match(letter) && regnoLength == 3) {        
        //     formatVal = formatVal = regno.substring(0, regnoLength-1) + " " +subString
        // }
        // else if(subString.match(letter) && preSubString.match(letter)) {
        //     formatVal = regno
        // }
        // else if(subString.match(number) && preSubString.match(number) && regnoLength == 6) {
        //     formatVal = formatVal = regno.substring(0, regnoLength-1) + " " +subString
        // } 
        // else if(subString.match(number) && preSubString.match(number) && regnoLength == 11 && regno.substring(3, 4).match(letter) && regno.substring(5, 7).match(number) ) {
        //     formatVal = formatVal = regno.substring(0, 7) + " " +regno.substring(7, 11)
        // } 
        // else if(subString.match(number) && preSubString.match(letter)) {        
        //     formatVal = regno.substring(0, regnoLength-1) + " " +subString      
        // } 
        // else if(subString.match(letter) && preSubString.match(number)) {
        //     formatVal = regno.substring(0, regnoLength-1) + " " +subString   
        // } 
        
        // else formatVal = regno.toUpperCase()
        
        e.target.value = regno.toUpperCase()

    }


    componentDidMount() {
        this.fetchData()
    }


    render() {
        const {insurerList, vahanDetails, error, vehicleDetails, vahanVerify, previousPolicy, motorInsurance, step_completed} = this.state
        const {productId} = this.props.match.params 

        let newInitialValues = Object.assign(initialValue, {
            registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
            chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : "",
            chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
            engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : "",
            vahanVerify: vahanVerify,
            previous_start_date: previousPolicy && previousPolicy.start_date ? new Date(previousPolicy.start_date) : "",
            previous_end_date: previousPolicy && previousPolicy.end_date ? new Date(previousPolicy.end_date) : "",
            previous_policy_name: previousPolicy && previousPolicy.name ? previousPolicy.name : "",
            // insurance_company_id: previousPolicy && previousPolicy.insurancecompany && previousPolicy.insurancecompany.Id ? previousPolicy.insurancecompany.Id : "",
            insurance_company_id: previousPolicy && previousPolicy.insurancecompany_id ? previousPolicy.insurancecompany_id : "",
            previous_city: previousPolicy && previousPolicy.city ? previousPolicy.city : "",
            previous_policy_no: previousPolicy && previousPolicy.policy_no ? previousPolicy.policy_no : "",
            newRegistrationNo:  motorInsurance.registration_no &&  motorInsurance.registration_no == "NEW" ? motorInsurance.registration_no : "",
            policy_type_id: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : ""

        });

        const errMsg =
            error && error.message ? (
                <span className="errorMsg">
                <h6>
                    <strong>
                    Thank you for showing your interest for buying product.Due to some
                    reasons, we are not able to issue the policy online.Please call
                    180 22 1111
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
                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                { step_completed >= '3' && vehicleDetails.vehicletype_id == '6' ?
                <section className="brand m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead">
                            <h4 className="fs-18 m-b-30">Please share your vehicle details.</h4>
                            <h5>{errMsg}</h5>
                        </div>
                    </div>
                    <Formik initialValues={newInitialValues} 
                    onSubmit={ this.handleSubmit} 
                    validationSchema={ComprehensiveValidation}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                            
                    return (
                        <Form>
                        <FormGroup>
                                <div className="carloan">
                                    <h4> Please verify your vehicle</h4>
                                </div>
                            </FormGroup>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <Row>
                                <Col sm={12} md={6} lg={5}>
                                <Row>
                                    
                                <Col sm={12} md={5} lg={6}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        Registration No:
                                        </div>
                                    </FormGroup>
                                    </Col>
                            
                                    <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                    <Field
                                                        type="text"
                                                        name='registration_no' 
                                                        autoComplete="off"
                                                        className="premiumslid"    
                                                        value= {values.registration_no}
                                                        maxLength={this.state.length}
                                                        onInput={e=>{
                                                            this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                        }}                                                 
                                                    /> 
                                                {errors.registration_no ? (
                                                    <span className="errorMsg">{errors.registration_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                </Col>

                                <Col sm={12} md={6} lg={4}>
                                <Row sm={12} md={6} lg={4}>
                                <Col sm={12} md={5} lg={6}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        Please Enter Last 5 digits of Chassis no.
                                        </div>
                                    </FormGroup>
                                </Col>
                                    
                                <Col sm={12} md={5} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                    <Field
                                                        type="text"
                                                        name='chasis_no_last_part' 
                                                        autoComplete="off"
                                                        className="premiumslid"       
                                                        value= {values.chasis_no_last_part}
                                                        maxLength="5"       
                                                        onChange = {(e) => {
                                                            setFieldValue('vahanVerify', false)

                                                            setFieldTouched('chasis_no_last_part')
                                                            setFieldValue('chasis_no_last_part', e.target.value)                       
                                                        }}                           
                                                        
                                                    />
                                                    {errors.chasis_no_last_part && touched.chasis_no_last_part ? (
                                                    <span className="errorMsg">{errors.chasis_no_last_part}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                </Col>

                                <Col sm={12} md={6} lg={2}>
                                    <FormGroup>
                                    
                                        <Button className="btn btn-primary vrifyBtn" onClick= {!errors.chasis_no_last_part ? this.getVahanDetails.bind(this,values, setFieldTouched, setFieldValue, errors) : null}>Verify</Button>
                                        {errors.vahanVerify ? (
                                                <span className="errorMsg">{errors.vahanVerify}</span>
                                            ) : null}
                                    </FormGroup>
                                </Col>
                                </Row>
                                    
                                {values.vahanVerify && !errors.chasis_no_last_part ?
                                <Row>
                                    <Col sm={12} md={6} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="engine_no"
                                                    type="text"
                                                    placeholder="Engine Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.engine_no.toUpperCase()}
                                                    maxLength="17"
                                                    onChange = {(e) => {
                                                        setFieldTouched('engine_no')
                                                        setFieldValue('engine_no', e.target.value)                       
                                                    }}  
                                                />
                                                {errors.engine_no && touched.engine_no ? (
                                                    <span className="errorMsg">{errors.engine_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={6} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="chasis_no"
                                                    type="text"
                                                    placeholder="Chasis Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.chasis_no.toUpperCase()}
                                                    maxLength="17"
                                                    onChange = {(e) => {
                                                        setFieldTouched('chasis_no')
                                                        setFieldValue('chasis_no', e.target.value)                       
                                                    }} 
                                                />
                                                {errors.chasis_no && touched.chasis_no ? (
                                                    <span className="errorMsg">{errors.chasis_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                : null}
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {values.policy_type_id == '2' ? 
                                <Fragment>
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> Previous Policy Details</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={11} lg={4}>
                                        <FormGroup>

                                            <DatePicker
                                                name="previous_start_date"
                                                minDate={new Date(minDate)}
                                                maxDate={new Date(maxDate)}
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Previous policy start date"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                className="datePckr inputfs12"
                                                selected={values.previous_start_date}
                                                onChange={(val) => {
                                                    setFieldValue('previous_start_date', val);
                                                    setFieldValue("previous_end_date", addDays(new Date(val), 365));
                                                }}
                                            />
                                            {errors.previous_start_date && touched.previous_start_date ? (
                                                <span className="errorMsg">{errors.previous_start_date}</span>
                                            ) : null}
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={11} lg={4}>
                                        <FormGroup>
                                            <DatePicker
                                                name="previous_end_date"
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Previous policy end date"
                                                disabled = {true}
                                                dropdownMode="select"
                                                className="datePckr inputfs12"
                                                selected={values.previous_end_date}
                                                onChange={(val) => {
                                                    setFieldTouched('previous_end_date');
                                                    setFieldValue('previous_end_date', val);
                                                }}
                                            />
                                            {errors.previous_end_date && touched.previous_end_date ? (
                                                <span className="errorMsg">{errors.previous_end_date}</span>
                                            ) : null}
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={11} lg={3}>
                                        <FormGroup>
                                            <div className="formSection">
                                                <Field
                                                    name='previous_policy_name'
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value = {values.previous_policy_name}
                                                    // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                >
                                                    <option value="">Select Policy Type</option>
                                                    <option value="1">Package</option>
                                                    <option value="2">Liability Only</option>  
                                        
                                                </Field>
                                                {errors.previous_policy_name && touched.previous_policy_name ? (
                                                    <span className="errorMsg">{errors.previous_policy_name}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={6} lg={6}>
                                    <FormGroup>
                                        <div className="formSection">
                                        <Field
                                            name='insurance_company_id'
                                            component="select"
                                            autoComplete="off"                                                                        
                                            className="formGrp"
                                        >
                                            <option value="">Select Insurer Company</option>
                                            {insurerList.map((insurer, qIndex) => ( 
                                                <option value= {insurer.Id}>{insurer.name}</option>
                                            ))}
                                        </Field>     
                                        {errors.insurance_company_id && touched.insurance_company_id ? (
                                        <span className="errorMsg">{errors.insurance_company_id}</span>
                                        ) : null}          
                                        </div>
                                    </FormGroup>
                                    </Col>

                                    <Col sm={12} md={5} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="previous_city"
                                                    type="text"
                                                    placeholder="Previous Insurer Address"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    
                                                />
                                                {errors.previous_city && touched.previous_city ? (
                                                    <span className="errorMsg">{errors.previous_city}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <Row>
                                <Col sm={12} md={5} lg={5}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="previous_policy_no"
                                                    type="text"
                                                    placeholder="Previous Policy Number"
                                                    autoComplete="off"
                                                    maxLength="28"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    
                                                />
                                                {errors.previous_policy_no && touched.previous_policy_no ? (
                                                    <span className="errorMsg">{errors.previous_policy_no}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>   
                                </Row>
                                <Row>
                                <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                </Fragment> 
                              : null}

                               <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                            <div className="col-md-15">
                                                <div className="brandhead"> 
                                                    I/we hold a valid and effective PUC and/or fitness certificate, as applicable, for the vehicle mentioned herein and undertake to renew the same during the policy period
                                                    <div className="carloan">
                                                        <h4> </h4>
                                                    </div>
                                                        <div className="d-inline-flex m-b-15">
                                                            <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='puc'
                                                                        value='1'
                                                                        key='1'
                                                                        checked = {values.puc == '1' ? true : false}
                                                                        onChange = {() =>{
                                                                            setFieldTouched('puc')
                                                                            setFieldValue('puc', '1');
                                                                        }  
                                                                        }
                                                                    />
                                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                </label>
                                                            </div>
                                                            <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='puc'
                                                                        value='2'
                                                                        key='1'
                                                                        checked = {values.puc == '2' ? true : false}
                                                                        onChange = {() =>{
                                                                            setFieldTouched('puc')
                                                                            setFieldValue('puc', '2');
                                                                        }  
                                                                        }
                                                                    />
                                                                    <span className="checkmark " /><span className="fs-14"> No</span>
                                                                </label>
                                                                {errors.puc && touched.puc ? (
                                                                    <span className="errorMsg">{errors.puc}</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                </div>
                                            </div> 
                                            
                                        </FormGroup>
                                    </Col>
                                </Row>

                                    <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  onClick= {this.otherComprehensive.bind(this,productId)}>
                                            Back
                                        </Button> 
                                        {values.puc == '1' ? 
                                        <Button className={`proceedBtn`} type="submit"  >
                                            Continue
                                        </Button>
                                        : null }
                                        </div>
                                    </Col>


                                    <Col sm={12} md={3}>
                                        <div className="vehbox">
                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                
                                                    <div className="txtRegistr">Registration No.<br />
                                                    {motorInsurance && motorInsurance.registration_no}</div>
                                                    <div>
                                                    <button className="rgistrBtn" type="button" onClick={this.selectBrand.bind(this, productId)}>Edit</button>
                                                    </div>
                                            </div>

                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                <div className="txtRegistr">Car Brand<br/>
                                                    <strong>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong></div>
                                                <div><button className="rgistrBtn" type="button" onClick= {this.selectBrand.bind(this,productId)}>Edit</button></div>
                                            </div>

                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                    <div className="txtRegistr">Car Model<br/>
                                                    <strong>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</strong></div>
                                                <div><button className="rgistrBtn" type="button" onClick= {this.selectVehicleBrand.bind(this,productId)}>Edit</button></div>          
                                            </div>

                                            <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                <div className="txtRegistr">Fuel Type<br/>
                                                    <strong>{vehicleDetails && vehicleDetails.varientmodel && fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)]} </strong></div>
                                            </div>
                                        </div>
                                    </Col>

                                </Row>
                                </Form>
                                );
                            }}
                        </Formik>
                    </section> 
                      : step_completed == "" ? "Forbidden" : null } 
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(FourWheelerVerifyTP));