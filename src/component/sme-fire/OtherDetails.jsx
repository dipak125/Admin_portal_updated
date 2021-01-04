import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip,Label } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import ReactTooltip from "react-tooltip";
import * as Yup from 'yup';
import { Formik, Field, Form, FieldArray } from "formik";
import axios from "../../shared/axios"
import moment from "moment";
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";
import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from '../../store/actions/sme_fire';


//const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
//const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment().subtract(1, 'years');
const minDate = moment().subtract(2, 'years');
let endMinDate = moment();
//const startRegnDate = moment().subtract(20, 'years').calendar();
//const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
//const maxRegnDate = new Date();

const initialValue = {
    registration_date: "",
    location_id:"",
    previous_is_claim:"",
    previous_city:"",
    insurance_company_id:"",
    previous_policy_name:"",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: 1,
    previous_claim_for: "",
    previous_policy_no: "",
    previous_policy_check : '0'
    // Commercial_consideration: "",
} 

// VALIDATION :---------------------------------
const vehicleRegistrationValidation = 
Yup.object().shape({
previous_start_date : Yup.date().when(['previous_policy_check'], {
    is: previous_policy_check => previous_policy_check == '1',       
    then: Yup.date().required("Please select previous policy start date"),
    otherwise: Yup.date().nullable()}),
    
previous_end_date : Yup.date().when(['previous_policy_check'], {
    is: previous_policy_check => previous_policy_check == '1',       
    then: Yup.date().required("Please select previous policy end date"),
    otherwise: Yup.date().nullable()}),

Commercial_consideration : Yup.string().matches(/^[0-9]*$/, function() {
    return "Please enter commercial consideration % in number"
}).nullable(),

Previous_Policy_No : Yup.string().when(['previous_policy_check'], {
    is: previous_policy_check => previous_policy_check == '1',       
    then: Yup.string().required("Previous policy number is required")
.matches(/^[a-zA-Z0-9][a-zA-Z0-9\s-/]*$/, 
    function() {
        return "Please enter valid policy number"
    }).min(6, function() {
        return "Policy No. must be minimum 6 characters"
    })
    .max(28, function() {
        return "Policy No. must be maximum 28 characters"
    }),
    otherwise: Yup.string().nullable()}),

insurance_company_id : Yup.number().when(['previous_policy_check'], {
    is: previous_policy_check => previous_policy_check == '1',       
    then: Yup.number().required("Previous insurance company name is required"),
    otherwise: Yup.number().nullable()}),

previous_city : Yup.string()
.matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,\s]*$/, 
    function() {
        return "Please enter valid address"
    }).nullable()
})



class OtherDetails extends Component {

    state = {
        insurerList: [],
        showClaim: false,
        previous_is_claim: "",
        motorInsurance:{},
        previousPolicy: {},
        CustomerID: '',  
        suggestions: [],
        customerDetails: [],
        selectedCustomerRecords: [],
        CustIdkeyword: "",
        RTO_location: "",
        previous_is_claim: "",
        disable_end_date:true,
        // previous_policy_check:'0'
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }
    onChange = (e, setFieldValue) => {
        setFieldValue('location_id', "")
      };

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    // handleSubmit = (values, actions) => {
    //     const {productId} = this.props.match.params 
    //     const {motorInsurance} = this.state
    //     this.props.history.push(`/AdditionalDetails_SME/${productId}`);
      
    // }
    

    handleSubmit=(values, actions)=>{
        const {productId} = this.props.match.params 
        const formData = new FormData();
        let previous_start_date = values.previous_start_date == "" ? null : moment(values.previous_start_date).format('YYYY-MM-DD')
        let previous_end_date = values.previous_end_date == "" ? null : moment(values.previous_end_date).format('YYYY-MM-DD')
        let previous_Policy_No = values.Previous_Policy_No == '' ? null : values.Previous_Policy_No
        let insurance_company_id = values.insurance_company_id == '' ? null : values.insurance_company_id
        let encryption = new Encryption();

        let post_data = {
            'previous_start_date': previous_start_date,
            'previous_end_date': previous_end_date,
            'previous_policy_no': previous_Policy_No,
            'insurance_company_id': insurance_company_id,
            'address': values.previous_city,
            'menumaster_id': this.props.menumaster_id,
            'page_name': `OtherDetails/${productId}`,
            'policy_holder_id': this.props.policy_holder_id,
            'Commercial_consideration':'5',
        }
        console.log("Post Data------------- ", post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('sme/previous-policy-details',
        formData
        ).then(res=>{       
 
            this.props.loadingStop();
            this.props.setSmeOthersDetails({
                
                previous_start_date:values.previous_start_date,
                previous_end_date:values.previous_end_date,
                Commercial_consideration:'5',
                Previous_Policy_No:values.Previous_Policy_No,
                insurance_company_id:values.insurance_company_id,
                previous_city:values.previous_city
                

            });
            
            let formDataNew = new FormData(); 
            let post_data_new = {
                'policy_ref_no': this.props.policy_holder_ref_no,
                'menumaster_id': this.props.menumaster_id,
                'page_name': `OtherDetails/${productId}`,
    
            }
            formDataNew.append('enc_data',encryption.encrypt(JSON.stringify(post_data_new)))
            
            this.props.loadingStart();
            axios.post('/sme/calculate-premium/phase-one',
            formDataNew
            ).then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decryptResp-------->",decryptResp)
                   if( decryptResp.error === false) {
                       this.props.loadingStart();
                       axios.post('/sme/calculate-premium/phase-two',
                    formDataNew
                    ).then(res2=>{
                        const {productId} = this.props.match.params;
                        let decryptResp2 = JSON.parse(encryption.decrypt(res2.data));
                        console.log("decryptResp Phase 2-------->",decryptResp2)

                        if( decryptResp2.error === false) {
                            this.props.history.push(`/Summary_SME/${productId}`);
                        } else {
                            this.props.loadingStop();
                            swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                            actions.setSubmitting(false)
                        }
                    }).
                    catch(err=>
                        {this.props.loadingStop();
                        swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                        actions.setSubmitting(false)
                        
                    });
                }
                else { this.props.loadingStop()
                    swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                    actions.setSubmitting(false)
                }
                }).
            catch(err=>{
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                console.log("decryptErr -------->",decryptResp)
                actions.setSubmitting(false);
            });
        }).
        catch(err=>{
            let decryptErr = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptResp--err---', decryptErr)

        this.props.loadingStop();
        actions.setSubmitting(false)
        })
    // }
    }


    getAllAddress() {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        axios.get(`location-list/${policyHolder_id}`)
          .then(res => {
            this.setState({
              customerDetails: res.data.data
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.props.loadingStop();
          });
      }

    fetchInsurance = () => {
        // this.props.loaderStart();
        axios.get('company')
        .then(res => {
            console.log('fetch_data_insurance',res);
            this.setState({insurerList:res.data.data});
            this.props.loadingStop();
        })
        .catch(err => {
            this.props.loadingStop();
        })
    }
    

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();

        if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
            
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

                if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

                    this.props.setSmeOthersDetails({
                    
                        previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                        previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                        Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                        Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                        insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                        previous_city:decryptResp.data.policyHolder.previouspolicy.address
        
                    });
                }

                if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){
                    
                    let address = '';
                    if(decryptResp.data.policyHolder.address == null){
                        
                    }else{
                        address = JSON.parse(decryptResp.data.policyHolder.address);

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
                }

                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            })
        }
        
    }

    componentDidMount() {
        this.fetchPolicyDetails();
        this.fetchInsurance();
        
    }
    RiskDetails = (productId) => {
        this.props.history.push(`/RiskDetails/${productId}`);
    }

    render() {
        let newInitialValues = Object.assign(initialValue,{
            previous_start_date:this.props.previous_start_date == null || this.props.previous_start_date == '' ? "" : new Date(this.props.previous_start_date),
            previous_end_date:this.props.previous_end_date == null || this.props.previous_end_date == '' ? "" : new Date(this.props.previous_end_date),
            Commercial_consideration: this.props.Commercial_consideration,
            Previous_Policy_No:this.props.Previous_Policy_No != null ? this.props.Previous_Policy_No : "",
            insurance_company_id:this.props.insurance_company_id != null ? this.props.insurance_company_id : "",
            previous_city:this.props.previous_city,
            previous_policy_check: 0
        });
        
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

        
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
                <section className="brand m-b-25">
                    <div className="brand-bg">
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                        validationSchema={vehicleRegistrationValidation}
                        >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>
                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4 >COVERAGE DETAILS: &nbsp;&nbsp;&nbsp; SECTION 2 - BURGLARY</h4>
                                                    </div>
                                                </div>   
                                                <Row>  
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Burglary: Contents Sum Insured
                                                        </label>
                                                        </Col>
                                                   
                                                    <Col sm={6} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Contents_Sum_Insured'
                                                                type="text"
                                                                placeholder="Contents Sum Insured"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {this.props.content_sum_insured}     
                                                                disabled={true}                                                                       
                                                            />
                                                            {errors.Contents_Sum_Insured && touched.Contents_Sum_Insured ? (
                                                            <span className="errorMsg">{errors.Contents_Sum_Insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Burglary: Stocks Sum Insured
                                                        </label>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Stocks_Sum_Insured'
                                                                type="text"
                                                                placeholder="Stocks Sum Insured"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {this.props.stock_sum_insured}
                                                                disabled={true}                                                                              
                                                            />
                                                            {errors.Stocks_Sum_Insured && touched.Stocks_Sum_Insured ? (
                                                            <span className="errorMsg">{errors.Stocks_Sum_Insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                    
                                                </Row>
                                            </Col>
                                        </Row>

                                        <div className="brandhead"> 
                                            <p>&nbsp;</p>
                                        </div>
                                    
                                        {/* <Row>
                                            <Col sm={12} md={9} lg={9}>
                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4>Commercial consideration in %</h4>
                                                    </div>
                                                </div>   
                                                <Row>  */}
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="Cost_of_sale"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.Cost_of_sale}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Cost of sale</option>

                                                                </Field>     
                                                                {errors.Cost_of_sale && touched.Cost_of_sale ? (
                                                                    <span className="errorMsg">{errors.Cost_of_sale}</span>
                                                                ) : null}     
                                                            </div>
                                                        </FormGroup>   
                                                    </Col> */}
                                                    {/* <Col sm={12} md={4} lg={4}><FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="Commercial_consideration"
                                                                    type="text"
                                                                    placeholder="Commercial consideration in %"
                                                                    autoComplete="off"
                                                                    minimum=""
                                                                    maximum="100"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}   
                                                                />
                                                                {errors.Commercial_consideration && touched.Commercial_consideration ? (
                                                                    <span className="errorMsg">{errors.Commercial_consideration}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col> */}
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='Loan_Account_Number'
                                                                type="text"
                                                                placeholder="Loan Account Number"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.Loan_Account_Number}                                                                            
                                                            />
                                                            {errors.Loan_Account_Number && touched.Loan_Account_Number ? (
                                                            <span className="errorMsg">{errors.Loan_Account_Number}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                 */}
                                                {/* </Row> 
                                            </Col>
                                        </Row>  */}

                                        <div className="brandhead"> 
                                            <p>&nbsp;</p>
                                        </div>
                                    
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>
                                                <FormGroup>
                                                <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                 <h4 className="fs-18 m-b-32"> Do you have any previous policy ? </h4>
                                                 </div>
                                                </div>
                                                <div className="d-inline-flex m-b-35">
                                                 <div className="p-r-25">
                                                    <label className="customRadio3">
                                                        <Field
                                                        type="radio"
                                                        name='previous_policy_check'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldTouched('previous_policy_check')
                                                            setFieldValue(`previous_policy_check`, e.target.value);
                                                                                
                                                        }}
                                                            checked={values.previous_policy_check == '0' ? true : false}
                                                        />
                                                            <span className="checkmark " /><span className="fs-14"> No</span>
                                                    </label>
                                                 </div>

                                                 <div className="">
                                                     <label className="customRadio3">
                                                     <Field
                                                     type="radio"
                                                     name='previous_policy_check'                                            
                                                     value='1'
                                                     key='1'  
                                                     onChange={(e) => {
                                                     setFieldTouched('previous_policy_check')
                                                     setFieldValue(`previous_policy_check`, e.target.value);
                                                 }}
                                                     checked={values.previous_policy_check == '1' ? true : false}
                                                     />
                                                     <span className="checkmark" />
                                                     <span className="fs-14">Yes</span>
                                                     </label>
                                                     {errors.previous_policy_check && touched.previous_policy_check ? (
                                                     <span className="errorMsg">{errors.previous_policy_check}</span>
                                                 ) : null}
                                                     </div>
                                                 </div>
                                                </FormGroup>
                                             </Col> 
                                             { values.previous_policy_check == '1' ?
                                            <Col sm={12} md={9} lg={9}>
                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4 >PREVIOUS INSURANCE DETAILS</h4>
                                                    </div>
                                                </div>   
                                                <Row>
                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="previous_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Policy start date"
                                                                autoComplete="off"
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.previous_start_date}
                                                                onChange={(val) => {
                                                                    //setFieldTouched('previous_start_date')
                                                                    setFieldValue('previous_start_date', val);
                                                                    setFieldValue('previous_end_date', new Date(moment(val).add(365, 'day')));
                                                                    //this.setState({disable_end_date:false});
                                                                    // endMinDate = moment(val).add(364, 'day');
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
                                                                placeholderText="Policy end date"
                                                                disabled = {this.state.disable_end_date}
                                                                minDate={new Date(endMinDate)}
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
                                                    <Col sm={12} md={5} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="Previous_Policy_No"
                                                                    type="text"
                                                                    placeholder="Previous Policy No"
                                                                    autoComplete="off"
                                                                    minimum="6"
                                                                    maximum="28"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}   
                                                                />
                                                                {errors.Previous_Policy_No && touched.Previous_Policy_No ? (
                                                                    <span className="errorMsg">{errors.Previous_Policy_No}</span>
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
                                                                <option value="">Previous Insurance</option>
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
                                                                    placeholder="Insurance Company Address"
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
                                            </Col>  
                                            : null}
                                        </Row>
                                                
                                        <div className="brandhead"> 
                                            <p>&nbsp;</p>
                                        </div>
                                    
                                        <div className="d-flex justify-content-left resmb">
                                        {/* <Button className={`backBtn`} type="button"  onClick= {this.RiskDetails.bind(this,productId)} >
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Next'}
                                        </Button>  */}
                                        <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.RiskDetails.bind(this,productId)}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Calculate Premium'}
                                                </Button>
                                        </div>

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
      loading: state.loader.loading,


      previous_start_date:state.sme_fire.previous_start_date,
      previous_end_date:state.sme_fire.previous_end_date,
      Commercial_consideration:state.sme_fire.Commercial_consideration,
      Previous_Policy_No:state.sme_fire.Previous_Policy_No,
      insurance_company_id:state.sme_fire.insurance_company_id,
      previous_city:state.sme_fire.previous_city,

      policy_holder_id: state.sme_fire.policy_holder_id,
      policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
      request_data_id:state.sme_fire.request_data_id,
      completed_step:state.sme_fire.completed_step,
      menumaster_id:state.sme_fire.menumaster_id,


      content_sum_insured: state.sme_fire.content_sum_insured,
      stock_sum_insured: state.sme_fire.stock_sum_insured

    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData:(data) => dispatch(setSmeData(data)),
      setRiskData:(data) => dispatch(setSmeRiskData(data)),
      setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
      setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherDetails));