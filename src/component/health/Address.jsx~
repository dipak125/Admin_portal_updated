import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
// import ReactTooltip from "react-tooltip";
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";

import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'

const maxDob = dateformat(new Date(), 'mm/dd/yyyy');

const initialValues = {
    proposerAsInsured: "",
    fname: "",
    lname: "",
    dob: "",
    gender: "",
    panNo: "",
    phoneNo: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    pincode: "",
    area: "",
    state: "",
    eIA: ""
    };

const validateAddress =  Yup.object().shape({
    proposerAsInsured: Yup.string()
        .required(function() {
            return "Please select a value"
        }),
    lname: Yup.string().required(function() {
        return "Please enter a value"
    }),
    fname: Yup.string(function() {
        return "Please enter a value"
    }).required(function() {
        return "Please enter a value"
    })
        .min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 3 chracters"
        })
        .matches(/^[A-Za-z][A-Za-záéíñóúüÁÉÍÑÓÚÜ\s\-']*[A-Za-z\s]$/, function() {
            return "Please enter valid name"
        }),
    address1: Yup.string()
        .required(function() {
            return "Enter plot number."
        }),
    address2: Yup.string()
        .required(function() {
            return "Enter building name / number"
        }),
    address3: Yup.string()
        .required(function() {
            return "Enter street name"
        }),
    email: Yup.string()
        .required( function() {
            return "Please enter email"
        })
        .email( function() {
            return "Please enter valid email"
        }),
    dob: Yup
        .date()
        .required( function() {
            return "Please enter DOB"
        })
        //.max(maxDob, 'Date of birth should be equal or earlier on ${max}')
        .max(maxDob, function() {
            return "Date should not be future date"
        })
        .test(
            "18YearsChecking",
            function() {
                return "Age sgould me minium 18 years"
            },
            function (value) {
                if (value) {
                    const ageObj = new PersonAge();
                    return ageObj.whatIsMyAge(value) >= 18;
                }
                return true;
            }
        ),
    phoneNo: Yup.string()
        .required(function() {
            return "Please enter phone number"
        })
        .matches(/^([0-9\s\-\+\(\)]*)$/, function() {
            return "Invalid number"
        })
        .min(8, function() {
            return "Phone number should be minimum 8 digits"
        })
        .max(12, function() {
            return "Phone number should be maximum 12 digits"
        }),
    gender: Yup.string()
        .required(function() {
            return "Select gender"
        }),
    panNo: Yup.string()
        .required(function() {
            return "Enter PAN number"
        }),
    pincode: Yup.string()
        .required(function() {
            return "Enter pin code"
        }),

    area: Yup.string()
        .required(function() {
            return "Select area"
        }),
    state: Yup.string()
        .required(function() {
            return "Enter stater"
        }),
    eIA: Yup.string()
        .required(function() {
            return "Select eIA option"
        }),

});

class Address extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    sumInsured = (productId) => {
        this.props.history.push(`/SelectDuration/${productId}`);
    }

    handleSubmit = (event) => {
        const {productId} = this.props.match.params
        this.props.history.push(`/NomineeDetails/${productId}`);
    }

    render() {
        const {productId} = this.props.match.params
        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">

                                    <Formik initialValues={initialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateAddress}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                    return (
                                    <Form>
                                        <div className="d-flex justify-content-left align-items-center">
                                            <div className="proposr m-r-60"><p>Is the Proposer same as insured</p></div>
                                            <div className="d-inline-flex">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='proposerAsInsured'                                            
                                                        value='1'
                                                        key='0'  
                                                        onChange={(e) => {
                                                            setFieldValue(`proposerAsInsured`, e.target.value);
                                                        }}
                                                        checked={values.proposerAsInsured == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='proposerAsInsured'                                            
                                                        value='0'
                                                        key='0'  
                                                        onChange={(e) => {
                                                            setFieldValue(`proposerAsInsured`, e.target.value);
                                                        }}
                                                        checked={values.proposerAsInsured == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.proposerAsInsured && touched.proposerAsInsured ? (
                                                        <span className="errorMsg">{errors.proposerAsInsured}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Tell us more about the Insured Members</h4>
                                        </div>


                                        <Row>
                                            <Col sm={12} md={9} lg={9}>
                                                <div className="d-flex justify-content-left prsnlinfo">
                                                    <div className="W12">Self</div>


                                                    <Row>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name="fname"
                                                                        type="text"
                                                                        placeholder="First Name"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value={values.fname}
                                                                    />
                                                                    {errors.fname && touched.fname ? (
                                                                    <span className="errorMsg">{errors.fname}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                            name="lname"
                                                                            type="text"
                                                                            placeholder="Last Name"
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value={values.lname}
                                                                    />
                                                                    {errors.lname && touched.lname ? (
                                                                    <span className="errorMsg">{errors.lname}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <DatePicker
                                                                    name="dob"
                                                                    minDate={new Date()}
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="DOB"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    maxDate={new Date()}
                                                                    minDate={new Date(1/1/1900)}
                                                                    className="datePckr"
                                                                    onChange={(value) => {
                                                                        setFieldTouched("dob");
                                                                        setFieldValue("dob", value);
                                                                      }}
                                                                    selected={values.dob}
                                                                />
                                                                {errors.dob && touched.dob ? (
                                                                    <span className="errorMsg">{errors.dob}</span>
                                                                ) : null}
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name="gender"
                                                                        component="select"
                                                                        autoComplete="off"
                                                                        value={values.gender}
                                                                        className="formGrp"
                                                                    >
                                                                    <option value="">Select gender</option>
                                                                        <option value="male">Male</option>
                                                                        <option value="female">Female</option>
                                                                    </Field>     
                                                                    {errors.gender && touched.gender ? (
                                                                        <span className="errorMsg">{errors.gender}</span>
                                                                    ) : null}                    
                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                    </Row>
                                                </div>

                                                <Row className="m-b-25">
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="panNo"
                                                                type="text"
                                                                placeholder="PAN NO"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.panNo}
                                                            />
                                                            {errors.panNo && touched.panNo ? (
                                                            <span className="errorMsg">{errors.panNo}</span>
                                                            ) : null}                                        
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="phoneNo"
                                                                type="text"
                                                                placeholder="PHONE NO"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.phoneNo}
                                                            />
                                                            {errors.phoneNo && touched.phoneNo ? (
                                                            <span className="errorMsg">{errors.phoneNo}</span>
                                                            ) : null}  
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                        <Field
                                                            name="email"
                                                            type="text"
                                                            placeholder="EMAIL"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.email}
                                                        />
                                                        {errors.email && touched.email ? (
                                                        <span className="errorMsg">{errors.email}</span>
                                                        ) : null}  
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex justify-content-left carloan">
                                                    <h4> Communication Address</h4>
                                                </div>

                                                <Row className="m-b-45">
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address1"
                                                                    type="text"
                                                                    placeholder="Plot / Flat No."
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address1}
                                                                />
                                                                {errors.address1 && touched.address1 ? (
                                                                <span className="errorMsg">{errors.address1}</span>
                                                                ) : null}                                                             
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address2"
                                                                    type="text"
                                                                    placeholder="Building Name / Number"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address2}
                                                                />
                                                                {errors.address2 && touched.address2 ? (
                                                                <span className="errorMsg">{errors.address2}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address3"
                                                                    type="text"
                                                                    placeholder="Street Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address3}
                                                                />
                                                                {errors.address3 && touched.address3 ? (
                                                                <span className="errorMsg">{errors.address3}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="pincode"
                                                                    type="text"
                                                                    placeholder="Pincode"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.pincode}
                                                                />
                                                                {errors.pincode && touched.pincode ? (
                                                                <span className="errorMsg">{errors.pincode}</span>
                                                                ) : null}                                                   
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                        <div className="formSection">
                                                                <Field
                                                                    name="area"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.area}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select Area</option>
                                                                    <option value="area1">Area 1</option>
                                                                    <option value="area2">Area 2</option>
                                                                </Field>     
                                                                {errors.area && touched.area ? (
                                                                    <span className="errorMsg">{errors.area}</span>
                                                                ) : null}     
                                                                </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="state"
                                                                    type="text"
                                                                    placeholder="State"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.state}
                                                                />
                                                                {errors.state && touched.state ? (
                                                                <span className="errorMsg">{errors.state}</span>
                                                                ) : null}           
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex justify-content-left align-items-center m-b-40">
                                                
                                            <div className="proposr m-r-60"><p>Do you have an eIA number? 
                                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" /></a>
                                            </OverlayTrigger></p>
                            
                              
                                                </div>
                                            <div className="d-inline-flex">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                        }}
                                                        checked={values.eIA == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                        }}
                                                        checked={values.eIA == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.eIA && touched.eIA ? (
                                                        <span className="errorMsg">{errors.eIA}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.sumInsured.bind(this, productId )}>
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Continue'}
                                        </Button> 
                                            
                                        </div>
                                        </Col>                                       
                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">113 Operating Branches and Satellite Presence in 350+ locations </h3>
                                                </div>
                                            </Col>
                                        </Row>
                                        </Form>
                                        );
                                    }}
                                    </Formik>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Address));