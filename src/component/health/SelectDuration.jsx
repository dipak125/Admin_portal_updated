import React, { Component } from 'react';
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
insureValue: "5"    
}

const today = moment().add(30, 'days');;
    const disableFutureDt = current => {
    return current.isBefore(today)
  }

const sum_assured = {
    "100000.00" : 1,
    "150000.00" : 2,
    "200000.00" : 3,
    "250000.00" : 4,
    "300000.00" : 5,
    "350000.00" : 6,
    "400000.00" : 7,
    "450000.00" : 8,
    "500000.00" : 9
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
    })
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
        serverResponse: []
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
        this.props.history.push(`/MedicalDetails/${productId}`);
    }

    handleSubmit = (values) => {
        const {productId} = this.props.match.params
        const {serverResponse} = this.state
        const formData = new FormData(); 
        let encryption = new Encryption();

       // formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        let policy_holder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') : 0

       /* formData.append('start_date', serverResponse.EffectiveDate);
        formData.append('end_date', serverResponse.ExpiryDate);
        formData.append('gross_premium', serverResponse.GrossPremium);
        formData.append('service_tax', serverResponse.TGST);
        formData.append('swatch_bharat_cess', '0');
        formData.append('krishi_kalayan_cess', '0');
        formData.append('net_premium', serverResponse.DuePremium);
        formData.append('sum_insured', values.insureValue);
        */


        const post_data = {
            'policy_holder_id':policy_holder_id,
            'start_date':serverResponse.EffectiveDate,
            'end_date':serverResponse.ExpiryDate,
            'gross_premium':serverResponse.GrossPremium,
            'service_tax':serverResponse.TGST,
            'swatch_bharat_cess':0,
            'krishi_kalayan_cess':0,
            'net_premium':serverResponse.DuePremium,
            'sum_insured':values.insureValue,
            'page_name': `SelectDuration/${productId}`
        }
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))


        this.props.loadingStart();
        axios
        .post(`/duration-premium`, formData)
        .then(res => { 
            this.props.history.push(`/Address/${productId}`);
        })
        .catch(err => {
    
          this.props.loadingStop();
        });     
        this.props.loadingStop();

    }

    getAccessToken = () => {
        axios
          .post(`/callTokenService`)
          .then(res => {
            if(res.data.access_token){ 
                this.setState({
                    accessToken: res.data.access_token
                }) 
                let value = []
                value['polStartDate'] = new Date()
                value['polEndDate'] = new Date(moment(value['polStartDate']).add(1, 'years').format("YYYY-MM-DD"))
                this.props.loadingStop();
                this.quote(value)
            }
            else {
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 180 22 1111");
                this.props.loadingStop();
            }
          })
          .catch(err => {
            this.setState({
                accessToken: []
            });
            this.props.loadingStop();
          });
      }

      getPolicyHolderDetails = () => {
        this.props.loadingStart();
        axios
          .get(`/policy-holder/${localStorage.getItem('policyHolder_id')}`)
          .then(res => { 
            this.setState({
                policyHolderDetails: res.data.data.policyHolder
            }) 
            this.getAccessToken()
          })
          .catch(err => {
            this.setState({
                policyHolderDetails: []
            });
            this.props.loadingStop();
          });
      }

      quote = (value) => {
      const {accessToken} = this.state
      if(accessToken)
      {   
        let si = '';
        switch (this.state.policyHolderDetails['request_data']['sum_insured']) {
            case "100000.00":
                si = '1';
                break;
            case "150000.00":
                si = '2';
                break;
            case "200000.00":
                si = '3';
                break;
            case "250000.00":
                si = '4';
                break;
            case "300000.00":
                si = '5';
                break;
            case "350000.00":
                si = '6';
                break;
            case "400000.00":
                si = '7';
                break;
            case "450000.00":
                si = '8';
                break;
            case "500000.00":
                si = '9';
                break;
            default:
                si = '5';
        }
        // console.log('sum_insured', si);
        let polStartDate = moment(value.polStartDate).format("YYYY-MM-DD");
        let polEndDate = moment(value.polEndDate).format("YYYY-MM-DD");
        let insureValue = value.insureValue ? value.insureValue : si;
        const formData = new FormData(); 
        this.props.loadingStart();
      /*formData.append('id', localStorage.getItem('policyHolder_id'));
        formData.append('policyStartDate', polStartDate);
      formData.append('policyEndDate', polEndDate);
      formData.append('insureValue', insureValue);
      formData.append('access_token', accessToken);*/
      console.log('insureValue', insureValue);


      const post_data = {
        'id':localStorage.getItem('policyHolder_id'),
        'policyStartDate':polStartDate,
        'policyEndDate':polEndDate,
        'insureValue':insureValue,
        'access_token':accessToken
    }
    let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios
          .post(`/quickQuoteService`, formData)
          .then(res => { 
          if(res.data.AdjustedPremium){
              this.setState({
                  serverResponse: res.data,
                  error: []
              }) 
          }else {
              this.setState({
                  serverResponse: res.data,
                  error: res.data
              }) 
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
      else {
        swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 180 22 1111");
    }
      
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




    componentDidMount() {
        this.getPolicyHolderDetails();
        // this.getAccessToken();
      }

    render() {
        const {productId} = this.props.match.params
        const {policyHolderDetails, serverResponse, error, EndDate, endDateFlag} = this.state
        const request_data = policyHolderDetails ? policyHolderDetails.request_data:null;
        let start_date = request_data && request_data.start_date ? new Date(request_data.start_date): '';

        // let end_date = endDateFlag ? ( EndDate ? new Date(EndDate) : (request_data && request_data.end_date ? new Date(request_data.end_date) : "") ) 
        // : (request_data && request_data.end_date ? new Date(request_data.end_date) : "");

        let end_date = request_data && request_data.end_date ? new Date(request_data.end_date) : "";
          

        const newInitialValues = Object.assign(initialValues, {
            polStartDate: start_date ? start_date : new Date,
            polEndDate: end_date  ? end_date : new Date(moment().add(1, 'years').format("YYYY-MM-DD")),
            // insureValue: policyHolderDetails && policyHolderDetails.request_data && policyHolderDetails.request_data.sum_insured ? Math.floor(policyHolderDetails.request_data.sum_insured) : initialValues.insureValue
            insureValue: policyHolderDetails && policyHolderDetails.request_data && policyHolderDetails.request_data.sum_insured ? sum_assured[policyHolderDetails.request_data.sum_insured] : initialValues.insureValue
        })

        // const errMsg =  error && error.messages && error.messages.length > 0 ? error.messages.map((msg, qIndex)=>{  
        //     return(
        //         <h5> {msg.message}</h5>                   
        //     )                                                
        // }) : null
        const errMsg =  error && error.message ? (            
            <span className="errorMsg"><h6><strong>Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111</strong></h6></span>                                
        ) : null 
                                                        
       
        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
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
                                                            Select Sum Insured
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={8}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="insureValue"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.insureValue}                                                                    
                                                                    className="formGrp"
                                                                    onChange = {(e) => {
                                                                    setFieldTouched("insureValue")
                                                                    setFieldValue("insureValue", e.target.value);
                                                                    this.handleAmountChange(e)
                                                                    }
                                                                }
                                                                >
                                                                <option value="">Select sum insured</option>
                                                                    <option value="1" >100 000</option>
                                                                    <option value="2" >150 000</option>
                                                                    <option value="3" >200 000</option>
                                                                    <option value="4" >250 000</option>
                                                                    <option value="5" >300 000</option>
                                                                    <option value="6" >350 000</option>
                                                                    <option value="7" >400 000</option>
                                                                    <option value="8" >450 000</option>
                                                                    <option value="9" >500 000</option>
                                                                </Field>    
                                                                {errors.insureValue && touched.insureValue ? (
                                                                <span className="errorMsg">{errors.insureValue}</span>
                                                                ) : null} 
                                                            </div>
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
                                                            <p><strong>Rs:</strong> { serverResponse ? (serverResponse.message ? 0 : serverResponse.DuePremium ) : 0}</p>
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
                                                <Row><div>{errMsg}</div></Row>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">6000+ Network Hospitals for you to avail cashless facility</h3>
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