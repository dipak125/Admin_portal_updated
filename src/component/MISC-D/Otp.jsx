import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import { Formik, Field, Form } from "formik";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios";
import Encryption from '../../shared/payload-encryption';
import * as Yup from "yup";

// import OtpInput from 'react-otp-input';

const initialValue = {
    otp: "",
    appCodeRadio: "1"
}
const ComprehensiveValidation = Yup.object().shape({

  appCodeRadio: Yup.number().required('Please select one option'),

  otp: Yup.string().when(['appCodeRadio'], {
    is: appCodeRadio => appCodeRadio == '1',
    then: Yup.string().required('Please enter policy App Code')
        .matches(/^[0-9]*$/, function() {
          return "Invalid App code"
      }).min(6, function() {
          return "App code should be minimum 6 characters"
      }).max(6, function() {
        return "App code should be maximum 6 characters"
    }),
    otherwise: Yup.string()
  })

})

class Otp extends Component {

    state = {
        otp: "",
        errorMsg: "",
        seconds: 180,
        disable:true
      };

    checkOtp = (values, actions) => {
       this.props.loadingStart();
       const formData = new FormData();
       let otp_enter = Number(values.otp)
       let post_data_obj = {
         'policy_ref_no': this.props.refNumber,
         'app_code': otp_enter
       }
       let encryption = new Encryption();
       formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

        axios
          .post('verify-appcode', formData)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)

            if(decryptResp.error == false) {
                this.setState({  errorMsg: "" });
                actions.setSubmitting(false);
                this.props.reloadPage(true);
            } 
            else {
                actions.setSubmitting(false);
                this.setState({ otp: "", errorMsg: decryptResp.msg });
                // actions.setFieldValue('otp', "")
            } 
            this.props.loadingStop();         
          })
          .catch((err) => {
            this.setState({
              otp: "",
            });
            this.props.loadingStop();
          });
    };


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    generateOtp = () => {
        this.props.loadingStart();
        const formData = new FormData();
        let encryption = new Encryption();

        this.setState({
            seconds: 180, errorMsg: ""
          });
        axios
          .get(`sent-appcode/${this.props.refNumber}`)
          .then((res) => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            // console.log("decrypt--otp-------- ", decryptResp)

            this.props.loadingStop();
          })
          .catch((err) => {
            this.setState({
              otp: "",
            });
            this.props.loadingStop();
          });
      };

      coundown = () => {
        this.myInterval = setInterval(() => {
            this.setState(({ seconds }) => ({
              seconds: seconds - 1
            }))
          }, 1000) 
      }

      changeError = () => { 
        this.setState({
          errorMsg: "",
        });
      }


    componentDidMount() {
        this.generateOtp();  
        // this.coundown();
        
      }
    
    render() {
        const {otp, errorMsg, seconds} = this.state

        const newInitialValues = Object.assign(initialValue, {
            otp: errorMsg ? "" : "",
        })
        return (
           
                <Formik initialValues={initialValue} onSubmit={this.checkOtp}
                    validationSchema={ComprehensiveValidation}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                      this.state.disable = true;
                      if(values.otp1 !="" && values.otp2 !="" && values.otp3 !="" && values.otp4 !="" && values.otp5 !="")
                      {
                       this.state.disable = false;
                      }

                    return (
                    <Form>
                        <div className="text-center boxotpmodl">
                            <div className="verfy">Digital consent form</div>
                            <div className="mobotp">An automated SMS & e-mail has been sent to customer with a Policy App code and Proposal link.</div>
                            <span className="errorMsg">{otp}</span>

                            <div className="d-flex justify-content-center otpInputWrap mx-auto m-b-25">
                                <div className="p-r-25">
                                    <label className="customRadio3">
                                        <Field
                                            type="radio"
                                            name='appCodeRadio'
                                            value='1'
                                            key='1'
                                            checked = {values.appCodeRadio == '1' ? true : false}
                                            onChange = {() =>{
                                                setFieldTouched('appCodeRadio')
                                                setFieldValue('appCodeRadio', '1');
                                            }  
                                            }
                                        />
                                        <span className="checkmark " /><span className="fs-14"> Call customer and enter Policy App Code</span>
                                    </label>
                                    {errors.appCodeRadio && touched.appCodeRadio ? (
                                        <span className="errorMsg">{errors.appCodeRadio}</span>
                                    ) : null}
                                </div>
                              </div>
                              {values.appCodeRadio == '1' ? 
                              <div className="d-flex justify-content-center otpInputWrap mx-auto m-b-25">
                                <div className="insurerName">
                                    <Field
                                        name="otp"
                                        type="text"
                                        autoComplete="off"
                                        className="premiumslid"
                                        value = {values.otp}
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        onChange={(e) => {
                                          this.changeError()
                                          setFieldValue('otp', e.target.value);  
                                        }}
                                        tabIndex="1" 
                                        maxLength="6"       
                                    />
                                    {errors.otp && touched.otp ? (
                                        <span className="errorMsg">{errors.otp}</span>
                                    ) : null}
                                    {errorMsg ? 
                                    <span className="errorMsg">{errorMsg}</span> : null }
                                </div>
                            </div> : null }

                            {/* <div className="m-b-25">
                             <div>You can resend Policy App code in {seconds >= 0 ? seconds : 0} seconds</div> 
                            {errorMsg ? 
                            <span className="errorMsg">{errorMsg}</span> : null }

                            </div> */}
                           
                            <div className="text-center">
                            <Button className={`proceedBtn`} type="button" onClick={this.generateOtp} >
                            ReGenerate App code
                            </Button>
                            &nbsp;&nbsp;
                            <Button className={`proceedBtn`} type="submit">
                                {isSubmitting ? 'Wait..' : 'Submit'}                            
                            </Button> 
                            </div>
                        </div>  
                    </Form>
                    );
                }}
                </Formik>

        )
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Otp));