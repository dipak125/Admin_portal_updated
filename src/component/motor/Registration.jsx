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
import { setData } from "../../store/actions/data";
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
            // console.log('YUP', value)
            if ((value == "" || value == undefined) && this.parent.check_registration == 2 ) {  
                return false;
            }
            return true;
        }
    ).test(
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

});


class Registration extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastlanelog: []
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
    this.fetchData();
    
}

fetchData=()=>{
    const {productId } = this.props.match.params
    let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo"):0;
    let encryption = new Encryption();
    this.props.loadingStart();
    axios.get(`policy-holder/motor/${policyHolder_id}`)
        .then(res=>{
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            let motorInsurance = decryptResp.data.policyHolder.motorinsurance           
            let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
            this.setState({ 
                motorInsurance, fastlanelog
            })
            this.props.loadingStop();
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}

    fetchFastlane = (values) => {
        const formData = new FormData();
        if(values.check_registration == '2') {
            formData.append('registration_no', values.regNumber)
            formData.append('menumaster_id', '1')
            this.props.loadingStart();
            axios.post('fastlane', formData).then(res => {
    
                if(res.data.error == false) {
                    this.props.loadingStop();
                    this.setState({fastLaneData: res.data.data, brandView: '0'})
                    let fastLaneData = {'fastLaneData' : res.data.data}
                    this.props.setData(fastLaneData)
                } 
                else {
                    this.props.loadingStop();
                    this.props.setData([])
                    this.setState({fastLaneData: [], brandView: '1', vehicleDetails: []})
                }       
                this.handleSubmit(values, res.data.data)
            })
                .catch(err => {
                    this.props.loadingStop();
                })
        }else {
            this.props.setData([])
            this.handleSubmit(values, [])
        }
       
    }

    handleSubmit=(values, fastLaneData)=>{

        const {productId} = this.props.match.params;
        const {fastlanelog} = this.state;

        const formData = new FormData();
        let encryption = new Encryption();
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
                    'menumaster_id':1,
                    'vehicle_type_id':productId,
                    'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'page_name': `Registration/${productId}`,
                    
                } 
            }
            else {
                post_data = {
                    'policy_holder_id': policyHolder_id,
                    'registration_no':values.regNumber,
                    'check_registration': values.check_registration,
                    'menumaster_id':1,
                    'vehicle_type_id':productId,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'page_name': `Registration/${productId}`,
                   
                } 
            }

            console.log('post_data', post_data)
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
      
            this.props.loadingStart();
            axios
            .post(`/update-registration`, formData)
            .then(res => {
                if(res.data.error == false) {
                    this.props.history.push(`/select-brand/${productId}`);
                }
                else{
                    swal(res.data.msg)
                }   
                this.props.loadingStop();
                    
            })
            .catch(err => {
            if(err && err.data){
                swal('Registratioon number required...');
            }
            this.props.loadingStop();
            });
        }
        else{
            if(sessionStorage.getItem('csc_id')) {
                post_data = {
                    'registration_no':values.regNumber,
                    'check_registration': values.check_registration,
                    'menumaster_id':1,
                    'vehicle_type_id':productId,
                    'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'page_name': `Registration/${productId}`,
                    
                } 
            }
            else {
                post_data = {
                    'registration_no':values.regNumber,
                    'check_registration': values.check_registration,
                    'menumaster_id':1,
                    'vehicle_type_id':productId,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'page_name': `Registration/${productId}`,
                    
                } 
            }
            console.log('post_data', post_data)
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios
            .post(`/registration`, formData)
            .then(res => {
                if(res.data.error == false) {
                    localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
                    localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
                    this.props.history.push(`/select-brand/${productId}`); 
                }   
                else{
                    swal(res.data.msg)
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
        const {motorInsurance} = this.state
        const newInitialValues = Object.assign(initialValues,{
            regNumber: motorInsurance ? motorInsurance.registration_no:'' 
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
                                        onSubmit={this.fetchFastlane} 
                                        validationSchema={vehicleRegistrationValidation}>
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            // console.log('values',values)
                                            
                                        return (
                                        <Form>
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
                                                {errors.check_registration ? 
                                                        <span className="error-message">{errors.check_registration}</span> : ""
                                                    }
                                                
                                            </div> 
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
      loading: state.loader.loading,
      data: state.processData.data
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData: (data) => dispatch(setData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Registration));