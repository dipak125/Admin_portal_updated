import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import {  validRegistrationNumber } from "../../shared/validationFunctions";


const initialValues = {
    regNumber:'',
    check_registration: 2
}

const vehicleRegistrationValidation = Yup.object().shape({

    check_registration: Yup.string().notRequired(),

    regNumber: Yup.string()
    .test(
        "registrationNumberCheck",
        function() {
            return "Please Provide Vehicle Registration Number"
        },
        function (value) {
            if ((value == "" || value == undefined) && this.parent.check_registration == 2 ) {  
                return false;
            }
            return true;
        }
    )
    .test(
        "last4digitcheck",
        function() {
            return "Invalid Registration number"
        },
        function (value) {
            if (value && this.parent.check_registration == 2 && (value != "" || value != undefined) ) {             
                return validRegistrationNumber(value);
            }   
            return true;
        }
    ),
    policy_type: Yup.string().required("Please select policy type"),
    policy_for: Yup.string().required("Please select policy for indivudal or corporate"),
    policy_for: Yup.string().required("Please select policy for indivudal or corporate"),
    subclass_id: Yup.string().required("Please select sub product"),

});


class RegistrationGCV extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastLaneData: [],
        fastlanelog: [],
        subVehicleList: []
    }
   

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }





componentDidMount(){
    this.fetchSubVehicle();
    
}

fetchData=()=>{
    const {productId } = this.props.match.params
    let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo"):0;
    let encryption = new Encryption();
    axios.get(`gcv-tp/policy-holder/details/${policyHolder_id}`)
        .then(res=>{
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            let motorInsurance = decryptResp.data.policyHolder.motorinsurance           
            this.setState({ 
                motorInsurance
            })
            this.props.loadingStop();
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}

fetchSubVehicle=()=>{
    const {productId } = this.props.match.params
    let encryption = new Encryption();
    this.props.loadingStart();
    axios.get(`gcv-tp/sub-vehical-list/4`)
        .then(res=>{
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt--fetchSubVehicle------ ", decryptResp)

            let subVehicleList = decryptResp.data        
            this.setState({ 
                subVehicleList
            })
            this.fetchData()
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}

handleSubmit=(values)=>{

    const {productId} = this.props.match.params;

    const formData = new FormData();
    let encryption = new Encryption();
    const {fastLaneData, fastlanelog } = this.state
    let post_data = {}
    let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0

    let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
    if(bc_data) {
        bc_data = JSON.parse(encryption.decrypt(bc_data));
    }

    if(policyHolder_id > 0){
        if(sessionStorage.getItem('csc_id')) {
            post_data = {
                'policy_holder_id': policyHolder_id,
                'registration_no':values.regNumber,
                'check_registration': values.check_registration,
                'menumaster_id':4,
                'vehicle_type_id':productId,
                'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                'bc_token': "5",
                'page_name': `Registration_GCV_TP/${productId}`,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id' : values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : "",

            } 
        }
        else {
            post_data = {
                'policy_holder_id': policyHolder_id,
                'registration_no':values.regNumber,
                'check_registration': values.check_registration,
                'menumaster_id':4,
                'vehicle_type_id':productId,
                'bcmaster_id': bc_data ? bc_data.agent_id : "",
                'bc_token': bc_data ? bc_data.token : "",
                'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                'page_name': `Registration_GCV_TP/${productId}`,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id' : values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : ""
            } 
        }

        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
    
        this.props.loadingStart();
        axios
        .post(`gcv-tp/update-registration`, formData)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)
            this.props.loadingStop();

            if(decryptResp.error == false) {
                this.props.history.push(`/SelectBrand_GCV_TP/${productId}`);
            }
            else{
                swal(decryptResp.msg)
            }   
                
        })
        .catch(err => {
            let decryptErr = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptResp--err---', decryptErr)
            this.props.loadingStop();
            if(decryptErr && err.data){
                swal('Registration number required...');
            }
        });
    }
    else{
        if(sessionStorage.getItem('csc_id')) {
            post_data = {
                'registration_no':values.regNumber,
                'check_registration': values.check_registration,
                'menumaster_id':4,
                'vehicle_type_id':productId,
                'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                'bcmaster_id': "5",
                'page_name': `Registration_GCV_TP/${productId}`,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id': values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : ""
            } 
        }
        else {
            post_data = {
                'registration_no':values.regNumber,
                'check_registration': values.check_registration,
                'menumaster_id':4,
                'vehicle_type_id':productId,
                'bcmaster_id': bc_data ? bc_data.agent_id : "",
                'bc_token': bc_data ? bc_data.token : "",
                'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                'page_name': `Registration_GCV_TP/${productId}`,
                'policy_type_id':values.policy_type,
                'policy_for': values.policy_for,
                'subclass_id': values.subclass_id,
                'fastlaneLog_id': this.state.fastLaneData && this.state.fastLaneData.fastlaneLog_id ? this.state.fastLaneData.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : ""
            } 
        }
        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`gcv-tp/registration`, formData)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            if(decryptResp.error == false) {
                localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                this.props.history.push(`/SelectBrand_GCV_TP/${productId}`); 
            }   
            else{
                swal(decryptResp.msg)
            }
            this.props.loadingStop();                    
        })
        .catch(err => {
        if(err && err.data){
            swal('Please check..something went wrong!!');
        }
        this.props.loadingStop();
        });
    }
}
    
setValueData = () => {
    var checkBoxAll = document.getElementsByClassName('user-self');
    for(const a in checkBoxAll){
        if(checkBoxAll[a].checked){            
            return true
        }
    }
    return false
}

handleChange = (values, setFieldTouched, setFieldValue) => {
    if(values.regNumber == "NEW"){
        // setFieldTouched('check_registration')
        setFieldValue('regNumber', "");
    }
}

regnoFormat = (e, setFieldTouched, setFieldValue) => {
    
    let regno = e.target.value
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


    render() {
        const {motorInsurance, subVehicleList} = this.state
        const newInitialValues = Object.assign(initialValues,{
            regNumber: motorInsurance && motorInsurance.registration_no ? motorInsurance.registration_no : "",
            policy_type: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "",
            policy_for: motorInsurance && motorInsurance.policy_for ? motorInsurance.policy_for : "",
            subclass_id : motorInsurance && motorInsurance.subclass_id ? motorInsurance.subclass_id : "",
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
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <h4 className="m-b-30">Help us with some information about yourself</h4>
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={this.handleSubmit} 
                                        validationSchema={vehicleRegistrationValidation}>
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            // console.log('values',values)
                                            
                                        return (
                                        <Form>                                           
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                <p>Taking GCV Third Party policy for</p>
                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_for'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.policy_for == '1' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_for')
                                                                        setFieldValue('policy_for', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> Individual</span>
                                                            </label>
                                                        </div>
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_for'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.policy_for == '2' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_for')
                                                                        setFieldValue('policy_for', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> Corporate</span>
                                                            </label>
                                                            {errors.policy_for && touched.policy_for ? (
                                                                <span className="errorMsg">{errors.policy_for}</span>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead"> 
                                                    <p>Tell us about your policy details</p>

                                                    <div className="d-inline-flex m-b-15">
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_type'
                                                                    value='1'
                                                                    key='1'
                                                                    checked = {values.policy_type == '1' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_type')
                                                                        setFieldValue('policy_type', '1');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> New Policy</span>
                                                            </label>
                                                        </div>
                                                        
                                                        <div className="p-r-25">
                                                            <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='policy_type'
                                                                    value='2'
                                                                    key='1'
                                                                    checked = {values.policy_type == '2' ? true : false}
                                                                    onChange = {() =>{
                                                                        setFieldTouched('policy_type')
                                                                        setFieldValue('policy_type', '2');
                                                                        this.handleChange(values,setFieldTouched, setFieldValue)
                                                                    }  
                                                                    }
                                                                />
                                                                <span className="checkmark " /><span className="fs-14"> Roll Over</span>
                                                            </label>
                                                            {errors.policy_type && touched.policy_type ? (
                                                                    <span className="errorMsg">{errors.policy_type}</span>
                                                                ) : null}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="row formSection">
                                                <label className="col-md-4">Sub Product:</label>
                                                <div className="col-md-4">
                                                    
                                                    <div className="formSection">
                                                        <Field
                                                            name='subclass_id'
                                                            component="select"
                                                            autoComplete="off"
                                                            className="formGrp inputfs12"
                                                            value = {values.subclass_id}
                                                            // value={ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : values.previous_policy_name}
                                                        >
                                                            <option value="">Select Sub Product</option>
                                                            {subVehicleList.map((subVehicle, qIndex) => ( 
                                                                <option value= {subVehicle.subclass_id}>{subVehicle.subclass_title}</option>
                                                            ))}
                                                
                                                        </Field>
                                                        {errors.subclass_id && touched.subclass_id ? (
                                                            <span className="errorMsg">{errors.subclass_id}</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row formSection">
                                                <label className="col-md-4">Enter Vehicle Registration Number:</label>
                                                <div className="col-md-4">
                                                    
                                                <Field
                                                    name="regNumber"
                                                    type="text"
                                                    placeholder="Registration Number"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value= {values.regNumber}   
                                                    maxLength={this.state.length}
                                                    onInput={e=>{
                                                        this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                        setFieldTouched('check_registration')
                                                        setFieldValue('check_registration', '2');
                                                    }}        
        
                                                />
                                                {errors.regNumber && touched.regNumber ? (
                                                    <span className="errorMsg">{errors.regNumber}</span>
                                                ) : null}    
                                                </div>
                                            </div>
                                            {values.policy_type == '1' ?
                                            <div className="row formSection">
                                                    <label className="customCheckBox formGrp formGrp">
                                                    Continue Without Vehicle Registration Number
                                                    <Field
                                                        type="checkbox"
                                                        name="check_registration"
                                                        value="1"
                                                        className="user-self"
                                                        onChange={(e) => {
                                                            if (e.target.checked === true) {
                                                                setFieldTouched('regNumber')
                                                                setFieldValue('regNumber', '');
                                                                setFieldTouched('check_registration')
                                                                setFieldValue('check_registration', e.target.value);
        
                                                            } else {
                                                                setFieldValue('check_registration', '2');                                                            
                                                            }
                                                            if(this.setValueData()){
                                                                this.setState({
                                                                    check_registration:1
                                                                })
                                                            }
                                                            else{
                                                                this.setState({
                                                                    check_registration:2
                                                                })
                                                            }
                                                        }}
                                                        checked={values.check_registration == '1' ? true : false}
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                    </label>
                                                    {errors.check_registration && (touched.looking_for_2 || touched.looking_for_3 || touched.looking_for_4) ? 
                                                            <span className="error-message">{errors.check_registration}</span> : ""
                                                        }
                                                    
                                                </div> : null }
                                            <div className="cntrbtn">
                                            <Button className={`btnPrimary`} type="submit" >
                                                Go
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
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(RegistrationGCV));