import React, { Component, Fragment } from 'react';
import BaseComponent from '.././BaseComponent';
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


const initialValues = {
polStartDate: "",
polEndDate: "",
insureValue: "5",
ksbperiod_id: "3",
installment_premium_payment: "0",
ksbplan_id: "1"
}

const today = moment().add(30, 'days');;
    const disableFutureDt = current => {
    return current.isBefore(today)
  }

  const Coverage = {

    "TELECO": "Tele Consultation",
    "HO_BEN": "Hospitalization Benefit",
    "GPA_SC": "Personal Accident",
    "HOSP_CASH": "Hospital Daily Cash",
    "CONVEY_ALLOW": "Conveyance Allowance Benefit",
    "GPA_SC_AD": "Accidental Death",
    "GPA_SC_PTD": "Permanent Total Disablement",
}
const validateDuration =  Yup.object().shape({
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
          if ( this.parent.polEndDate != undefined && value == undefined) {
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
        if ( this.parent.polStartDate != undefined && value == undefined) {
            return false;
        }
        return true;
    }
    ),
    insureValue: Yup.string().required(function() {
        return "Please enter sum insured"
    }),
    ksbplan_id: Yup.string().required('Please select Plan'),
    // ksbperiod_id: Yup.string().required('Please select payment type'),
    // installment_premium_payment: Yup.string().required('Please select instalment facility'),
})

class SelectDuration extends Component {

    state = {
        accessToken: "",
        policyHolderDetails: [],
        polStartDate: "",
        EndDate: "",
        insureValue: "" ,
        error: [],
        endDateFlag: false,
        serverResponse: [],
        insurePlan: [],
        ksbinfo: [],
        insurePeriod: [],
        fulQuoteResp: [],
        showInstallment:false,
        installment_premium_payment:'',
        validation_error: []
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
        this.props.history.push(`/PreExistingDisease_KSB/${productId}`);
    }

    handleSubmit = (values) => {
        const {productId} = this.props.match.params
        const {serverResponse} = this.state
        const formData = new FormData(); 
        let encryption = new Encryption();
        let policy_holder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') : 0

        const post_data = {
            'policy_holder_id':policy_holder_id,
            'start_date':serverResponse.EffectiveDate,
            'end_date': moment(serverResponse.ExpiryDate).format("YYYY-MM-DD"),
            'ksbplan_id': values.ksbplan_id,
            'ksbperiod_id': values.ksbperiod_id,
            'installment_premium_payment': values.installment_premium_payment,
            'page_name': `SelectDuration_KSB/${productId}`,
        
        }
        console.log("post_data---------- ", post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

        this.props.loadingStart();
        axios
        .post(`ksb/duration-premium`, formData)
        .then(res => { 
            this.props.loadingStop();
            this.props.history.push(`/Address_KSB/${productId}`);
        })
        .catch(err => {
          this.props.loadingStop();
        });     

    }


      getPolicyHolderDetails = () => {
        this.props.loadingStart();
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        axios
          .get(`ksb/details/${policyHolder_refNo}`)
          .then(res => { 
            let ksbinfo =  res.data.data.policyHolder && res.data.data.policyHolder.ksbinfo  ? res.data.data.policyHolder.ksbinfo: []
            let installment_premium_payment = res.data.data.policyHolder.ksbinfo && res.data.data.policyHolder.ksbinfo.installment_premium_payment == 0 ? "0" : res.data.data.policyHolder.ksbinfo.installment_premium_payment
            this.setState({
                policyHolderDetails: res.data.data.policyHolder, ksbinfo, installment_premium_payment
            }) 
            // console.log('policyHolderDetails', this.state.policyHolderDetails)
            // console.log('ksbinfo', this.state.ksbinfo)
            this.fetchInsurePlan()
          })
          .catch(err => {
            this.setState({
                policyHolderDetails: []
            });
            this.props.loadingStop();
          });
      }

      quote = (value) => {
        //console.log('value', value)
        const {accessToken} = this.state 
        if (value.polStartDate === null){
            value['polStartDate'] = new Date()
            value['polEndDate'] = new Date(moment(value['polStartDate']).add(1, 'years').format("YYYY-MM-DD")) 
        }
        if (value.ksbplan_id === 0){
            value['ksbplan_id'] = '1'
        }
        
        let polStartDate = moment(value.polStartDate).format("YYYY-MM-DD");
        let polEndDate = moment(value.polEndDate).format("YYYY-MM-DD");
        const formData = new FormData(); 
        this.props.loadingStart();

        const post_data = {
            'id':localStorage.getItem('policyHolder_id'),
            'policyStartDate':polStartDate,
            'policyEndDate':polEndDate,
            'ksbplan_id': value.ksbplan_id ,
            'ksbperiod_id': value.ksbperiod_id,
        }
        let encryption = new Encryption();
        // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        formData.append('id',localStorage.getItem('policyHolder_id'))
        formData.append('policyStartDate',polStartDate)
        formData.append('policyEndDate',polEndDate)
        formData.append('ksbplan_id',value.ksbplan_id)
        formData.append('ksbperiod_id',value.ksbperiod_id) 
        formData.append('insureValue',1)
        axios
          .post(`/fullQuoteServiceKSBRetail`, formData)
          .then(res => { 
            if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
              this.setState({
                  fulQuoteResp: res.data.PolicyObject,
                  serverResponse: res.data.PolicyObject,
                  error: [],
                  validation_error: []
              }) 
          }
          else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
              this.setState({
                  fulQuoteResp: res.data.PolicyObject,
                  serverResponse: [],
                  validation_error: [],
                  error: {"message": 1}
              }) 
          }
          else if (res.data.code && res.data.message && res.data.code == "validation failed" && res.data.message == "validation failed") {
            var validationErrors = []
            for (const x in res.data.messages) {
                validationErrors.push(res.data.messages[x].message)
               }
               this.setState({
                fulQuoteResp: [],
                validation_error: validationErrors,
                error: [],
                serverResponse: []
            });
            // swal(res.data.data.messages[0].message)
          }
          else {
            this.setState({
                fulQuoteResp: [],
                error: res.data.ValidateResult,
                validation_error: [],
                serverResponse: []
            });
        }
          this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
              serverResponse: []
            });
            this.props.loadingStop();
          });
      
    }

    handleChange =(value) => {
        let endDate = moment(value).add(1, 'years').format("YYYY-MM-DD")
        this.setState({
            EndDate: endDate,
            endDateFlag: true,
            serverResponse: [],
            error: []
        }) 
    }

    handleAmountChange =(e) => {
        this.setState({
            serverResponse: [],
            error: []
        }) 
    }

    fetchInsurePlan = () => {
        axios.get(`ksbplan`)
        .then(res=>{
            var insurePlan = res.data && res.data.data ? res.data.data : []
            this.setState({
                insurePlan            
            })
            console.log('policyHolderDetails', this.state.policyHolderDetails)
            console.log('ksbinfo', this.state.ksbinfo)
            let value = []
            value['polStartDate'] = this.state.policyHolderDetails.request_data.start_date
            value['polEndDate'] = new Date(moment(value['polStartDate']).add(1, 'years').format("YYYY-MM-DD")) 
            value['ksbplan_id'] = this.state.ksbinfo.ksbplan_id
            value['ksbperiod_id'] = '3'
            this.quote(value)
            //this.fetchPaymentPeriod()
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
    }

    fetchPaymentPeriod = () => {
        axios.get(`ksbperiod`)
        .then(res=>{
            var insurePeriod = res.data && res.data.data ? res.data.data : []
            this.setState({
                insurePeriod            
            })
            // let value = []
            // this.quote(value)
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
    }

    showInstalmentText = (value) =>{
        if(value == 1){
            this.setState({
                showInstallment:true,
                installment_premium_payment:1
            })
        }
        else{
            this.setState({
                showInstallment:false,
                installment_premium_payment:0
            })
        }
    }


    componentDidMount() {
        this.getPolicyHolderDetails();
        // this.getAccessToken();
      }

    render() {
        const {productId} = this.props.match.params
        const {policyHolderDetails, serverResponse, error, EndDate, endDateFlag, fulQuoteResp, insurePlan, ksbinfo, insurePeriod, showInstallment, installment_premium_payment, validation_error } = this.state
        const request_data = policyHolderDetails ? policyHolderDetails.request_data:null;
        let start_date = request_data && request_data.start_date ? new Date(request_data.start_date): '';

        let end_date = request_data && request_data.end_date ? new Date(request_data.end_date) : "";
          
        const newInitialValues = Object.assign(initialValues, {
            polStartDate: start_date ? start_date : new Date,
            polEndDate: end_date  ? end_date : new Date(moment().add(1, 'years').format("YYYY-MM-DD")),
            ksbplan_id: ksbinfo && ksbinfo.ksbplan_id ? ksbinfo.ksbplan_id : "1",
            // ksbperiod_id: ksbinfo && ksbinfo.ksbperiod_id ? ksbinfo.ksbperiod_id : "3",
            // installment_premium_payment: installment_premium_payment,
        })

        const errMsg =  error && error.message ? (            
            <span className="errorMsg"><h6><strong>{error.message}</strong></h6></span>
            // <span className="errorMsg"><h6><strong>Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111</strong></h6></span>                                
        ) : null 

        const validationErrors = 
            validation_error ? (
                validation_error.map((errors, qIndex) => (
                    <span className="errorMsg"><h6>Errors : 
                        <strong>
                            <ul>
                                <li>
                                    {errors}
                                </li>
                            </ul>
                        </strong></h6>
                    </span>
                ))        
        ): null;
                                                        
       
        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">KSB Retail Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div>{errMsg}</div>
                                        <h5>{validationErrors}</h5>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Select the duration for your Health Insurance</h4>                                          
                                        </div>
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.quote : this.handleSubmit ) : this.quote}
                                        validationSchema={validateDuration}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            
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
                                                            disabled = {true}
                                                            className="datePckr"
                                                            selected={addDays(new Date(values.polStartDate), 364)}
                                                        />
                                                        {errors.polEndDate && touched.polEndDate ? (
                                                        <span className="errorMsg">{errors.polEndDate}</span>
                                                        ) : null}
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                        Plan Name
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={8}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                            name="ksbplan_id"
                                                            component="select"
                                                            autoComplete="off"
                                                            value={values.ksbplan_id}
                                                            className="formGrp"
                                                            onChange={(e) => {
                                                                setFieldValue('ksbplan_id', e.target.value);
                                                                this.handleAmountChange(e)
                                                            }}
                                                        >
                                                        <option value="">Select Plan</option> 
                                                        {insurePlan.map((plan, qIndex) => ( 
                                                            <option value={plan.id}>{plan.descriptions}</option>
                                                        ))}
                                                        </Field>  
                                                        {errors.ksbplan_id && touched.ksbplan_id ? (
                                                            <span className="errorMsg">{errors.ksbplan_id}</span>
                                                        ) : null}    
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    
                                                    {/* <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                        Installment Premium Payment
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={2}>
                                                        <FormGroup>
                                                            <div className="p-r-25">
                                                            <label className="customRadio3">
                                                            <Field
                                                                type="radio"
                                                                name='installment_premium_payment'                                            
                                                                value='1'
                                                                key='1'  
                                                                onChange={(e) => {
                                                                    setFieldValue(`installment_premium_payment`, e.target.value);
                                                                    this.showInstalmentText(1);
                                                                }}
                                                                checked={values.installment_premium_payment == '1' ? true : false}
                                                            />
                                                                <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                            </label>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={2}>
                                                        <FormGroup>
                                                            <div className="p-r-25">
                                                            <label className="customRadio3">
                                                            <Field
                                                                type="radio"
                                                                name='installment_premium_payment'                                            
                                                                value='0'
                                                                key='1'  
                                                                onChange={(e) => {
                                                                    setFieldValue(`installment_premium_payment`, e.target.value);
                                                                    this.showInstalmentText(0);
                                                                }}
                                                                checked={values.installment_premium_payment == '0' ? true : false}
                                                            />
                                                                <span className="checkmark " /><span className="fs-14"> No</span>
                                                                {errors.installment_premium_payment && touched.installment_premium_payment ? (
                                                                    <span className="errorMsg">{errors.installment_premium_payment}</span>
                                                                ) : null}
                                                            </label>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={4}>
                                                        <FormGroup>
                                                            <div className="p-r-25">
                                                            
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    { showInstallment || installment_premium_payment == 1 ?  
                                                    <Fragment>
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                        Payment Type
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={8}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                            name="ksbperiod_id"
                                                            component="select"
                                                            autoComplete="off"
                                                            value={values.ksbperiod_id}
                                                            className="formGrp"
                                                            onChange={(e) => {
                                                                setFieldValue('ksbperiod_id', e.target.value);
                                                                this.handleAmountChange(e)
                                                            }}
                                                        >
                                                        <option value="">Select Plan</option> 
                                                        {insurePeriod.map((plan, qIndex) => ( 
                                                            <option value={plan.id}>{plan.descriptions}</option>
                                                        ))}
                                                        </Field>  
                                                        {errors.ksbperiod_id && touched.ksbperiod_id ? (
                                                            <span className="errorMsg">{errors.ksbperiod_id}</span>
                                                        ) : null}    
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Fragment> : null } */}

                                                </Row>
                                                
                                                {fulQuoteResp && fulQuoteResp.SumInsured ?
                                                <Fragment>
                                                    <div className="d-flex justify-content-left carloan m-b-25">
                                                        <h4> Sum Insured</h4>
                                                    </div>
                                                    <Row>
                                                        <Col sm={12}>
                                                            <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                                                <p>Your Total Sum Insured for One Year : </p>
                                                                <p><strong>Rs:</strong> {fulQuoteResp ? fulQuoteResp.SumInsured : 0}</p>
                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </Fragment>
                                                : "" }  

                                                <div className="d-flex justify-content-left carloan m-b-25">
                                                    <h4> Premium</h4>
                                                </div>
                                                <Row>  
                                                    <Col sm={12}>
                                                        <div className="d-flex justify-content-between align-items-center premium m-b-25">
                                                            <p>Your Total Premium for One Year : </p>
                                                            <p><strong>Rs:</strong> { fulQuoteResp ? (fulQuoteResp.message ? 0 : fulQuoteResp.DuePremium ) : 0}</p>
                                                        </div>
                                                    </Col>

                                                    <Col sm={12}>
                                                        <div className="justify-content-left align-items-center list m-b-30">
                                                        <p>Your Health Insurance covers you for following :</p>
                                                        <ul><b>Silver</b>
                                                            <li>24 Doctor consultation calls in a year</li>
                                                            <li>1 lakh PA Cover to Primary Insured </li>
                                                        </ul>
                                                        <ul><b>Gold</b>
                                                            <li>36 Doctor Consultation calls in a year</li>
                                                            <li>Hospital Daily Cash Benefit of Rs 250/day up to 30 Days </li>
                                                            <li>3 Lakhs PA Cover to Primary Insured  </li>
                                                        </ul>
                                                        <ul><b>Platinum</b>
                                                            <li>60 Doctor Consultation calls in a year</li>
                                                            <li>Hospital Daily Cash Benefit of Rs 250/day up to 60 Days </li>
                                                            <li>5 Lakhs PA Cover to Primary Insured</li>
                                                        </ul>
                                                        </div>
                                                    </Col>
                                                    <div className="d-flex justify-content-left resmb">
                                                    <Button className={`backBtn`} type="button" onClick= {this.medicalQuestions.bind(this, productId )} >
                                                        Back
                                                    </Button>
                                                    { serverResponse && serverResponse != "" ? (serverResponse.message ? 
                                                         <Button className={`proceedBtn`} type="submit"  >
                                                         Quote
                                                     </Button> : <Button className={`proceedBtn`} type="submit"  >
                                                        Continue
                                                    </Button> ) : <Button className={`proceedBtn`} type="submit"  >
                                                    Quote
                                                    </Button>}
                                                    
                                                    </div>
                                                </Row>
                                                <Row><div>&nbsp;</div></Row>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox medpd">
                                                    <h4 className="txtRegistr resmb-15">
                                                        <p>Ab Kutumb Swasthya Bima Ke Saath Doctor Ki Salah Phone Par</p>
                                                        <p>Kutumb Swasthya Bima is for anyone and everyone who is looking for health insurance that is cost effective and offers great value</p>
                                                    </h4>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(SelectDuration));