import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
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


const ageObj = new PersonAge();
// const minDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const maxDate = moment(minDate).add(30, 'day').calendar();
const minDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const maxDate = moment(moment().subtract(1, 'years').calendar()).add(30, 'day').calendar();
const startRegnDate = moment().subtract(20, 'years').calendar();
const minRegnDate = moment(startRegnDate).startOf('year').format('YYYY-MM-DD hh:mm');
const maxRegnDate = new Date();

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
    stateName: "",
    pinDataArr: [],
}





class RiskDetails extends Component {

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
        previous_is_claim: ""
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

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           formData.append('pincode',pinCode)
           axios.post('pincode-details',
            formData
            ).then(res=>{
                if( res.data.error === false)
                {       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            } else {
                swal("Plese enter a valid pincode")
                this.props.loadingStop();
            }
            }).
            catch(err=>{
                this.props.loadingStop();
            })  
        }       
    }

    fetchAreadetailsBack=(pincode_input=null)=>{

        let pinCode = '';

        if(this.props.pincode != null && this.props.pincode != '' && this.props.pincode.length==6){
            pinCode = this.props.pincode;
        }else if(pincode_input != ''){
            pinCode = pincode_input;
        }

        if(pinCode != null && pinCode != '' && pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            // let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
            // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
            formData.append('pincode',pinCode)
            axios.post('pincode-details',
            formData
            ).then(res=>{       
                let stateName = res.data.data && res.data.data[0] && res.data.data[0].pinstate.STATE_NM ? res.data.data[0].pinstate.STATE_NM : ""                        
                this.setState({
                    pinDataArr: res.data.data,
                    stateName,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })          
        }     
    }
    
    handleSubmit=(values, actions)=>{
        const {productId} = this.props.match.params 
        console.log('handleSubmit', values);
        // console.log("policyHolder_id-------->",policyHolder_id)
        const formData = new FormData();
        let encryption = new Encryption();

        let post_data = {
            'policy_holder_id': this.props.policy_holder_id,
            'menumaster_id': this.props.menumaster_id,
            'page_name': `RiskDetails/${productId}`,
            'house_building_name': values.house_building_name,
            'block_no': values.block_no,
            'house_flat_no': values.house_flat_no,
            'pincode': values.pincode,
            'pincode_id': values.pincode_id,
            'buildings_sum_insured': values.buildings_sum_insured,
            'content_sum_insured': values.content_sum_insured,
            'stock_sum_insured': values.stock_sum_insured,

        }

        const Fire_sum_insured = parseInt(values.buildings_sum_insured) + parseInt(values.content_sum_insured) + parseInt(values.stock_sum_insured) ;
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

        if (Fire_sum_insured < 500000) {
            this.props.loadingStop();
            swal("Sum total of fire buildings sum insured,contents sum insured and stock sum insured should be more than 5 Lakhs")
            return false;
        } else if(Fire_sum_insured > 10000000) {
             this.props.loadingStop();
            swal("Sum total of fire buildings sum insured,contents sum insured and stock sum insured should be less than 1 crore")
            return false;
        } else {
        this.props.loadingStart();
        axios.post('sme/policy-details',
        formData
        ).then(res=>{     
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            if (decryptResp.error === false )  {
            this.props.loadingStop();
            this.props.setRiskData(
                {

                    house_building_name:values.house_building_name,
                    block_no:values.block_no,
                    // street_name:values.street_name,
                    // plot_no:values.plot_no,
                    // content_sum_insured:values.content_sum_insured,
                    house_flat_no:values.house_flat_no,
                    pincode:values.pincode,
                    pincode_id:values.pincode_id,
                    buildings_sum_insured:values.buildings_sum_insured,
                    content_sum_insured:values.content_sum_insured,
                    stock_sum_insured:values.stock_sum_insured
                }
            );
            const {productId} = this.props.match.params;
            console.log("Fire_sum_insured-------",Fire_sum_insured)
            this.props.loadingStop()
            this.setState({ Fire_sum_insured : Fire_sum_insured })
            
            this.props.history.push(`/OtherDetails/${productId}`);
        } else {
            this.props.loadingStop();
            swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111");
            actions.setSubmitting(false);
        }
        }).
        catch(err=>{
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptErr-----', decryptResp)
            actions.setSubmitting(false);
        })
    }
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
                            // street_name:risk_arr.street_name,
                            // plot_no:risk_arr.plot_no,
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
                    
                        Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                        previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                        previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                        Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                        insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                        previous_city:decryptResp.data.policyHolder.previouspolicy.address
        
                    });

                    this.fetchAreadetailsBack(decryptResp.data.policyHolder.smeinfo.pincode);
                
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

    fireSumCalculate (){
        const fire_Sum = this.state.Fire_sum_insured
    }

    componentDidMount() {
        // this.getInsurerList();
        //this.fetchData();
        this.fetchPolicyDetails();
        this.fetchAreadetailsBack();
        this.fireSumCalculate();
        
    }
    Registration_SME = (productId) => {
        console.log('Product-----id',productId)
        this.props.history.push(`/Registration_SME/${productId}`);
    }

    render() {
        const {productId} = this.props.match.params  
        const {insurerList, showClaim, previous_is_claim, motorInsurance, previousPolicy,
            stateName,pinDataArr,CustomerID,suggestions, vehicleDetails, RTO_location} = this.state

        let newInitialValues = Object.assign(initialValue,{
            house_building_name:this.props.house_building_name,
            block_no:this.props.block_no,
            // street_name:this.props.street_name,
            // plot_no:this.props.plot_no,
            // content_sum_insured:this.props.content_sum_insured,
            house_flat_no:this.props.house_flat_no,
            pincode:this.props.pincode,
            pincode_id:this.props.pincode_id,
            buildings_sum_insured:this.props.buildings_sum_insured,
            content_sum_insured:this.props.content_sum_insured,
            stock_sum_insured:this.props.stock_sum_insured
        });

        // VALIDATION :----------------------------------------///////////////////////////
        const vehicleRegistrationValidation = Yup.object().shape({
            house_building_name: Yup.string().required("Please enter building name").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid building name"
                }).nullable(),
            block_no: Yup.string().required("Please enter block no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid block no."
                }).nullable(),
            house_flat_no: Yup.string().required("Please enter house/flat no.").matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, 
                function() {
                    return "Please enter valid house/flat no,"
                }).nullable(),
            pincode: Yup.string().required('Pincode is required')
            .matches(/^[0-9]{6}$/, function() {
                return "Please enter valid 6 digit pin code"
            }).nullable(),
            pincode_id: Yup.string().required("Please select area").nullable(),
            buildings_sum_insured: Yup.string().required("Please enter building sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            content_sum_insured: Yup.string().required("Please enter content sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
            stock_sum_insured: Yup.string().required("Please enter stock sum insured").max(8).matches(/^[0-9]*$/, function() {
                return "Please enter only numbers"
            }).nullable(),
        })

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
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} validationSchema={vehicleRegistrationValidation}>
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                    <h4 className="fs-18 m-b-30">RISK DETAILS</h4>
                                                </div>
                                                </div> 
                                                <div className="d-flex justify-content-left">
                                                    <h4 className="fs-18 m-b-30">Type of occupancy at risk location : Shop Risk</h4>
                                                </div> 
                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='house_building_name'
                                                                type="text"
                                                                placeholder="Shop/Building Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.house_building_name}                                                                            
                                                            />
                                                            {errors.house_building_name && touched.house_building_name ? (
                                                            <span className="errorMsg">{errors.house_building_name}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='block_no'
                                                                type="text"
                                                                placeholder="Block No."
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.block_no}                                                                            
                                                            />
                                                            {errors.block_no && touched.block_no ? (
                                                            <span className="errorMsg">{errors.block_no}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='house_flat_no'
                                                                type="text"
                                                                placeholder="House/Flat No"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.house_flat_no}                                                                            
                                                            />
                                                            {errors.house_flat_no && touched.house_flat_no ? (
                                                            <span className="errorMsg">{errors.house_flat_no}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    
                                                    {/* <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='street_name'
                                                                type="text"
                                                                placeholder="Street Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.street_name}                                                                            
                                                            />
                                                            {errors.street_name && touched.street_name ? (
                                                            <span className="errorMsg">{errors.street_name}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='plot_no'
                                                                type="text"
                                                                placeholder="Plot No."
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.plot_no}                                                                            
                                                            />
                                                            {errors.plot_no && touched.plot_no ? (
                                                            <span className="errorMsg">{errors.plot_no}</span>
                                                            ) : null}              
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row> */}
                                                    <Row>

                                                    <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="pincode"
                                                                type="test"
                                                                placeholder="Pincode"
                                                                autoComplete="off"
                                                                maxLength = "6"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                onKeyUp={e=> this.fetchAreadetails(e)}
                                                                value={values.pincode}
                                                                maxLength="6"
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("state");
                                                                    setFieldTouched("pincode");
                                                                    setFieldValue("pincode", e.target.value);
                                                                    // setFieldValue("state", stateName ? stateName[0] : values.state);
                                                                    setFieldValue("pincode_id", "");
                                                                }}
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
                                                                    name="pincode_id"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.pincode_id}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select Location</option>
                                                                {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                )}
                                                                    
                                                                    {/*<option value="area2">Area 2</option>*/}
                                                                </Field>     
                                                                {errors.pincode_id && touched.pincode_id ? (
                                                                    <span className="errorMsg">{errors.pincode_id}</span>
                                                                ) : null}     
                                                            </div>
                                                        </FormGroup>
                                                        
                                                    </Col>
                                                </Row>

                                                <div className="brandhead"> 
                                                    <p>&nbsp;</p>
                                                </div>

                                                <div className="d-flex justify-content-left">
                                                    <div className="brandhead">
                                                        <h4 className="fs-18 m-b-30">COVERAGE DETAILS: &nbsp;&nbsp;&nbsp; SECTION 1 - FIRE</h4>
                                                    </div>
                                                </div>                                                   
                                                <div className="d-flex justify-content-left">
                                                    <h4 className="fs-18 m-b-30">Please enter Sum Insured below :</h4>
                                                </div>  
                                                    {/* <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name="SI_Building"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.SI_Building}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Basis of SI-Building/Contents</option>
                                                                {pinDataArr && pinDataArr.length > 0 && pinDataArr.map((resource,rindex)=>
                                                                    <option value={resource.id}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                )}
                                                                    
                                                                    <option value="area2">Area 2</option>
                                                                </Field>     
                                                                {errors.SI_Building && touched.SI_Building ? (
                                                                    <span className="errorMsg">{errors.SI_Building}</span>
                                                                ) : null}     
                                                            </div>
                                                        </FormGroup>                                                        
                                                    </Col> */}
                                                    <Row> 
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Building-Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Building Structure including Plinth and Foundation"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                        <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='buildings_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Building-Sum Insured"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.buildings_sum_insured} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("buildings_sum_insured");
                                                                    setFieldValue("buildings_sum_insured", e.target.value);  
                                                                }}   
                                                                // onClick={(e) =>{
                                                                //      {
                                                                //         swal("This cover is mandated by IRDAI, it is compulsory for Owner-Driver to possess a PA cover of minimum Rs 15 Lacs, except in certain conditions. By not choosing this cover, you confirm that you hold an existing PA cover or you do not possess a valid driving license.")
                                                                //     }
                                                                           
                                                                // }       }                                                                 
                                                            />
                                                            {errors.buildings_sum_insured && touched.buildings_sum_insured ? (
                                                            <span className="errorMsg">{errors.buildings_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Contents Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Furniture, Fixtures, Fittings and Electrical Installations."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                    <FormGroup>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="content_sum_insured"
                                                                type="text"
                                                                placeholder="Fire-Contents Sum Insured"
                                                                autoComplete="off"
                                                                maxLength = '7'
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.content_sum_insured}
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("content_sum_insured");
                                                                    setFieldValue("content_sum_insured", e.target.value);  
                                                                }}
                                                            />
                                                            {errors.content_sum_insured && touched.content_sum_insured ? (
                                                            <span className="errorMsg">{errors.content_sum_insured}</span>
                                                            ) : null}                                                   
                                                        </div>
                                                    </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Stock Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Commodity stored inside shops for sale."}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='stock_sum_insured'
                                                                type="text"
                                                                placeholder="Fire-Stock Sum Insured"
                                                                maxLength='7'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.stock_sum_insured} 
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("stock_sum_insured");
                                                                    setFieldValue("stock_sum_insured", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.stock_sum_insured && touched.stock_sum_insured ? (
                                                            <span className="errorMsg">{errors.stock_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>
                                                
                                                <Row>
                                                            <Col sm={6} md={4} lg={4}>
                                                        <label>
                                                        Fire-Total Sum Insured:
                                                        </label>
                                                        <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{"Sum total of fire building sum insured, fire content sum insured and fire stock sum insured"}</Tooltip>}>
                                                            <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                                        </OverlayTrigger>
                                                        </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                            <Field
                                                                name='fire_sum_insured'
                                                                type="number"
                                                                placeholder="Fire-Total Sum Insured"
                                                                maxLength='10'
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {parseInt(values.buildings_sum_insured) + parseInt(values.content_sum_insured) + parseInt(values.stock_sum_insured)} 
                                                                disabled={true}
                                                                onInput= {(e)=> {
                                                                    setFieldTouched("Fire_sum_insured");
                                                                    setFieldValue("Fire_sum_insured", e.target.value);  
                                                                }}                                                                           
                                                            />
                                                            {errors.Fire_sum_insured && touched.Fire_sum_insured ? (
                                                            <span className="errorMsg">{errors.Fire_sum_insured}</span>
                                                            ) : null}  
                                                            </div>
                                                        </FormGroup>
                                                    </Col>                         
                                                </Row>

                                                <div className="brandhead"> 
                                                    <p>&nbsp;</p>
                                                </div>
                                            
                                                {/* <div className="d-flex justify-content-left resmb">
                                                <a href="javascript:void(0);" className={`backBtn`} onClick= {this.Registration_SME.bind(this,productId)} >
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </a> */}
                                                {/* <Button className={`backBtn`} type="button" onClick= {this.Registration_SME.bind(this,productId)} >
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button>  */}
                                                {/* <Button className={`proceedBtn`} type="submit" disabled={isValid ? false : true} >
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div> */}
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.Registration_SME.bind(this,productId)}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
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
      loading: state.loader.loading,

      start_date: state.sme_fire.start_date,
      end_date: state.sme_fire.end_date,
      policy_holder_id: state.sme_fire.policy_holder_id,
      policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
      request_data_id:state.sme_fire.request_data_id,
      completed_step:state.sme_fire.completed_step,
      menumaster_id:state.sme_fire.menumaster_id,

      house_building_name: state.sme_fire.house_building_name,
      block_no: state.sme_fire.block_no,
    //   street_name: state.sme_fire.street_name,
    //   plot_no: state.sme_fire.plot_no,
      house_flat_no: state.sme_fire.house_flat_no,
      pincode: state.sme_fire.pincode,
      pincode_id: state.sme_fire.pincode_id,
      buildings_sum_insured: state.sme_fire.buildings_sum_insured,
      content_sum_insured: state.sme_fire.content_sum_insured,
      stock_sum_insured: state.sme_fire.stock_sum_insured,
      policy_holder_id:state.sme_fire.policy_holder_id,
      menumaster_id:state.sme_fire.menumaster_id
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(RiskDetails));