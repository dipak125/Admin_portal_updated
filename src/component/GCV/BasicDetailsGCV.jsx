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


const initialValues = {
    regNumber:''
}

const vehicleRegistrationValidation = Yup.object().shape({
    regNumber: Yup.string().required('Please enter valid registration number'),
   
   
});


class BasicDetailsGCV extends Component {
    state = {
        motorInsurance:''
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
    let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id"):0;
    axios.get(`policy-holder/motor/${policyHolder_id}`)
        .then(res=>{
            //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
            let motorInsurance = res.data.data.policyHolder.motorinsurance
           
            this.setState({ 
                motorInsurance
            })
           
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
}

    handleSubmit=(values)=>{
       // console.log("Vehicle Type ID ----->",this.props.match.params)
        const {productId} = this.props.match.params;


        const formData = new FormData();
        let encryption = new Encryption();

        /*formData.append('registration_no',values.regNumber);
        formData.append('menumaster_id',1);
        formData.append('vehicle_type_id',productId);*/

        const post_data = {
            'registration_no':values.regNumber,
            'menumaster_id':1,
            'vehicle_type_id':productId
        } 
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/registration`, formData)
        .then(res => {
                localStorage.setItem('policyHolder_id', res.data.data.policyHolder_id);
                localStorage.setItem('policyHolder_refNo', res.data.data.policyHolder_refNo);
                this.props.history.push(`/select-brand/${productId}`);                        
        })
        .catch(err => {
          console.log('Errors==============>',err.data);
          if(err && err.data){
             swal('Please check..something went wrong!!');
          }
          this.props.loadingStop();
        });
    }



    render() {
        const {motorInsurance} = this.state
        console.log("VVVVV======>",motorInsurance);
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
                                <section className="brand maxW">
                                    <div className="boxpd">
                                        <h4 className="m-b-30">We can reach you at</h4>
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={this.handleSubmit} 
                                        validationSchema={vehicleRegistrationValidation}>
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            console.log("CCCCCCCC======>",values);
                                        return (
                                        <Form>
                                        <div className="row formSection">
                                            <label className="col-md-6">Mobile Number</label>
                                            <div className="col-md-6">
                                            <Field
                                                name="regNumber"
                                                type="text"
                                                placeholder="+91 enter 10 digit no."
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value={values.regNumber} 
                                            />
                                            {errors.regNumber && touched.regNumber ? (
                                                <span className="errorMsg">{errors.regNumber}</span>
                                            ) : null}    
                                            </div>
                                        </div>

                                        <div className="row formSection">
                                            <label className="col-md-6">email ID is</label>
                                            <div className="col-md-6">
                                            <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                    name='bank_branch'
                                                    type="text"
                                                    placeholder="enter email address"
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
                                            
                                            </div>
                                        </div>
                                        <div className="row">
                                        <div className="col-sm-12">
                                                    <label className="customCheckBox formGrp formGrp">I agree to the <span className="bluesmalltrm"><a href="#" target="blank">terms and conditions</a></span>
                                                    <Field
                                                        type="checkbox"
                                                        name="looking_for_0"
                                                        className="user-self"
                                                       
                                                    />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"> </span>
                                                    </label>
                                                </div>
                                                </div>
                                                <p class="footerInfo">*We will send an OTP for mobile number verification</p>
                                        <div className="cntrbtn">
                                        <Button className={`btnPrimary`} type="submit" >
                                            Continue
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(BasicDetailsGCV));