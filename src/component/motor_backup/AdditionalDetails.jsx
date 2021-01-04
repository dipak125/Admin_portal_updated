import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Footer from '../common/footer/Footer';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import moment from "moment";

const initialValue = {
    first_name:"Tanmoy",
    last_name:"Ghosh",
    gender:"m",
    dob:new Date("1986-11-15"),
    pancard:"6987589",
    location:"barasat",
    district:"north 24",
    pincode:"700126",
    is_carloan:"",
    bank_name:"SBI",
    bank_branch:"Kolkata",
    nominee_relation_with:"mother",
    nominee_first_name:"Argha",
    nominee_last_name:"Ghosh",
    nominee_gender:"m",
    nominee_dob:new Date("1986-11-15"),
}

class AdditionalDetails extends Component {


    state = {
        showEIA: false,
        is_eia_account: '',
        showLoan: false,
        is_loan_account: '',
        insurerList: []
    };
    

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    showEIAText = (value) =>{
        if(value == 1){
            this.setState({
                showEIA:true,
                is_eia_account:1
            })
        }
        else{
            this.setState({
                showEIA:false,
                is_eia_account:0
            })
        }
    }

    showLoanText = (value) =>{
        if(value == 1){
            this.setState({
                showLoan:true,
                is_loan_account:1
            })
        }
        else{
            this.setState({
                showLoan:false,
                is_loan_account:0
            })
        }
    }

    otherComprehensive = (productId) => {
        this.props.history.push(`/OtherComprehensive/${productId}`);
    }

    getInsurerList = () => {
        this.props.loadingStart();
        axios
          .get(`/company`)
          .then(res => {
            this.setState({
                insurerList: res.data.data
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
                insurerList: []
            });
            this.props.loadingStop();
          });
      }

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const formData = new FormData(); 

        for (const key in values) {
            if (values.hasOwnProperty(key)) {
              if(key == "dob" || key == "nominee_dob"){
                formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
              }
              else {
                 formData.append(key, values[key]);
              }          
            }
          }
        formData.append('menumaster_id',1);
        formData.append('policy_holder_id', localStorage.getItem('policyHolder_id'));
        this.props.loadingStart();
        axios
        .post(`/owner-details`, formData)
        .then(res => { 
            // this.props.loadingStop();
            this.props.history.push(`/Premium/${productId}`);
        })
        .catch(err => {
    
          this.props.loadingStop();
          this.props.history.push(`/Premium/${productId}`);
        });

    }

    componentDidMount() {
        this.getInsurerList();
    }

   

    render() {
        const {showEIA, is_eia_account, showLoan, is_loan_account, insurerList} = this.state
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
                <section className="brand m-t-11 m-b-25">
                    <div className="brand-bg">
                        <div className="d-flex justify-content-left">
                            <div className="brandhead m-b-10">
                                <h4>You are just few steps away in getting your policy ready. Please share a few more details. </h4>
                            </div>
                        </div>

                        <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                        // validationSchema={validateNominee}
                        >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                        return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="d-flex justify-content-left carloan">
                                    <h4> Taken Car Loan</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <div className="d-inline-flex m-b-35">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name='is_carloan'                                            
                                                    value='1'
                                                    key='1'  
                                                    onChange={(e) => {
                                                        setFieldValue(`is_carloan`, e.target.value);
                                                        this.showLoanText(1);
                                                    }}
                                                    checked={values.is_carloan == '1' ? true : false}
                                                />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name='is_carloan'                                            
                                                    value='0'
                                                    key='1'  
                                                    onChange={(e) => {
                                                        setFieldValue(`is_carloan`, e.target.value); 
                                                        this.showLoanText(0);  
                                                    }}
                                                    checked={values.is_carloan == '0' ? true : false}
                                                />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </Col>
                                    {showLoan || is_loan_account == 1 ?
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                    name='bank_name'
                                                    type="text"
                                                    placeholder="Bank Name"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.bank_name}                                                                            
                                            />
                                                {errors.bank_name && touched.bank_name ? (
                                            <span className="errorMsg">{errors.bank_name}</span>
                                            ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                    name='bank_branch'
                                                    type="text"
                                                    placeholder="Bank Branch"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.bank_branch}                                                                            
                                            />
                                                {errors.bank_branch && touched.bank_branch ? (
                                            <span className="errorMsg">{errors.bank_branch}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> Vehicle Details</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>    
                                <Row>
                                    <Col sm={12} md={6} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="engineNo"
                                                    type="text"
                                                    placeholder="Engine Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                                {errors.engineNo && touched.engineNo ? (
                                                    <span className="errorMsg">{errors.engineNo}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={6} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="chasisNo"
                                                    type="text"
                                                    placeholder="Chasis Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                                {errors.chasisNo && touched.chasisNo ? (
                                                    <span className="errorMsg">{errors.chasisNo}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

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
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            
                                            <DatePicker
                                                name="prevStartDate"
                                                minDate={new Date('1/1/1900')}
                                                maxDate={new Date()}
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Previous policy start date"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                className="datePckr"
                                                selected={values.prevStartDate}
                                                onChange={(val) => {
                                                    setFieldTouched('prevStartDate');
                                                    setFieldValue('prevStartDate', val);
                                                }}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <DatePicker
                                                name="prevEndDate"
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="Previous policy end date"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                className="datePckr"
                                                selected={values.prevEndDate}
                                                onChange={(val) => {
                                                    setFieldTouched('prevEndDate');
                                                    setFieldValue('prevEndDate', val);
                                                }}      
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='policyType'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                                value = {values.policyType}
                                            >
                                                <option value="">Select Policy Type</option>
                                                <option value="male">Liability Policy</option>
                                                <option value="female">Package Policy</option>
                                            </Field>     
                                            {errors.policyType && touched.policyType ? (
                                            <span className="errorMsg">{errors.policyType}</span>
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
                                                name='policyCompany'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                                <option value="">Select Insurer Company</option>
                                                {insurerList.map((insurer, qIndex) => ( 
                                                    <option>{insurer.name}</option>
                                                ))}
                                            </Field>     
                                            {errors.policyCompany && touched.policyCompany ? (
                                            <span className="errorMsg">{errors.policyCompany}</span>
                                            ) : null}          
                                            </div>
                                        </FormGroup>
                                    </Col>

                                    <Col sm={12} md={6} lg={6}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <Field
                                                    name="prevInsurerAddress"
                                                    type="text"
                                                    placeholder="Previous Insurer Address"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                                {errors.prevInsurerAddress && touched.prevInsurerAddress ? (
                                                    <span className="errorMsg">{errors.prevInsurerAddress}</span>
                                                ) : null}
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> Owners Details</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='first_name'
                                                type="text"
                                                placeholder="Full Name "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.first_name}                                                                            
                                            />
                                                {errors.first_name && touched.first_name ? (
                                            <span className="errorMsg">{errors.first_name}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='gender'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                            <option value="">Select gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>     
                                            {errors.gender && touched.gender ? (
                                            <span className="errorMsg">{errors.gender}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <DatePicker
                                            name="dob"
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
                                            selected={values.dob}
                                            onChange={(val) => {
                                                setFieldTouched('dob');
                                                setFieldValue('dob', val);
                                                }}
                                        />
                                        {errors.dob && touched.dob ? (
                                            <span className="errorMsg">{errors.dob}</span>
                                        ) : null}  
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='pancard'
                                                type="text"
                                                placeholder="PAN Card No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.pancard}                                                                            
                                            />
                                            {errors.pancard && touched.pancard ? (
                                            <span className="errorMsg">{errors.pancard}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='address'
                                                type="text"
                                                placeholder="Address "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.address}                                                                            
                                            />
                                            {errors.address && touched.address ? (
                                            <span className="errorMsg">{errors.address}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='pincode'
                                                type="text"
                                                placeholder="Pincode "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.pincode}                                                                            
                                            />
                                            {errors.pincode && touched.pincode ? (
                                            <span className="errorMsg">{errors.pincode}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='location'
                                                type="text"
                                                placeholder="Location "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.location}                                                                            
                                            />
                                            {errors.location && touched.location ? (
                                            <span className="errorMsg">{errors.location}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> Nominee Details</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='nominee_first_name'
                                                type="text"
                                                placeholder="Name "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.nominee_first_name}                                                                            
                                            />
                                            {errors.nominee_first_name && touched.nominee_first_name ? (
                                            <span className="errorMsg">{errors.nominee_first_name}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name='nominee_gender'
                                                component="select"
                                                autoComplete="off"                                                                        
                                                className="formGrp"
                                            >
                                            <option value="">Select gender</option>
                                                <option value="m">Male</option>
                                                <option value="f">Female</option>
                                            </Field>     
                                            {errors.nominee_gender && touched.nominee_gender ? (
                                            <span className="errorMsg">{errors.nominee_gender}</span>
                                            ) : null}              
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <DatePicker
                                            name="nominee_dob"
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
                                            selected={values.nominee_dob}
                                            onChange={(val) => {
                                                setFieldTouched('nominee_dob');
                                                setFieldValue('nominee_dob', val);
                                                }}
                                        />
                                        {errors.nominee_dob && touched.nominee_dob ? (
                                            <span className="errorMsg">{errors.nominee_dob}</span>
                                        ) : null}  
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name="nominee_relation_with"
                                                component="select"
                                                autoComplete="off"
                                                value={values.nominee_relation_with}
                                                className="formGrp"
                                            >
                                            <option value="">Relation with Primary Insured</option>
                                            <option value="father">father</option>
                                            <option value="mother">Mother</option>
                                            <option value="spouse">Spouse</option>
                                            </Field>     
                                            {errors.nominee_relation_with && touched.nominee_relation_with ? (
                                                <span className="errorMsg">{errors.nominee_relation_with}</span>
                                            ) : null}        
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <h4 className="fs-16">Do you have EIA account</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="d-inline-flex m-b-35">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='eIA'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`eIA`, e.target.value);
                                                            this.showEIAText(1);
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
                                                            this.showEIAText(0);
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
                                        </FormGroup>
                                    </Col>
                                    {showEIA || is_eia_account == 1 ?
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="eia_account_no"
                                                type="text"
                                                placeholder="EIA Number"
                                                autoComplete="off"
                                                value = {values.eia_account_no}
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.eia_account_no && touched.eia_account_no ? (
                                            <span className="errorMsg">{errors.eia_account_no}</span>
                                            ) : null}                                             
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
                                </Row> 
                                <div className="d-flex justify-content-left resmb">
                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.otherComprehensive.bind(this,productId)}>
                                    {isSubmitting ? 'Wait..' : 'Back'}
                                </Button> 
                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                    {isSubmitting ? 'Wait..' : 'Next'}
                                </Button> 
                                </div>

                            </Col>

                            <Col sm={12} md={3} lg={3}>
                                <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                            </Col>
                        </Row>
                        </Form>
                        );
                        }}
                        </Formik>
                    </div>
                </section>
                </div>
                <Footer />
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(AdditionalDetails));