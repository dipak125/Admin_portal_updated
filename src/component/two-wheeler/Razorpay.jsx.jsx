import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import { Formik, Field, Form } from "formik";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import Iframe from 'react-iframe'



const initialValue = {

}

class Razorpay extends Component {

    state = {
        otp: "",
        errorMsg: "",
        seconds: 180,
        disable:true
      };



    handleSubmit = (values,actions, otp) => {
       
    }
  


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    


    componentDidMount() {
        
      }
    
    render() {
        const {otp, errorMsg, seconds} = this.state

        return (
           
                <Formik initialValues={initialValue} onSubmit={this.checkOtp}
                    // validationSchema={validateNominee}
                    >
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                      console.log(values);
    

                    return (
                    <Form>
                        <div className="text-center boxotpmodl">
                           
                        <Iframe url=" http://14.140.119.44/sbig-csc/razorpay/pay.php?refrence_no=606eda26cbb57e03f3c7db9abcf3bbf7"
                            width="300px"
                            height="400px"
                            id="myId"
                            className="myClassname"
                            display="initial"
                            position="relative"/>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Razorpay));