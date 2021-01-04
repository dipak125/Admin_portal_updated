import React, { Component, Fragment } from 'react';
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
import {  PersonAge } from "../../shared/dateFunctions";
import Encryption from '../../shared/payload-encryption';


const minDobAdult = moment(moment().subtract(100, 'years').calendar())
const maxDobAdult = moment().subtract(18, 'years').calendar();
const minDobNominee = moment(moment().subtract(100, 'years').calendar())
const maxDobNominee = moment().subtract(3, 'months').calendar();
const maxDoi = new Date()
const minDoi = moment(moment().subtract(100, 'years').calendar())

const initialValue = {
    first_name:"",
    last_name:"",
    gender:"",
    dob: "",
    pancard:"",
    pincode:"",
    is_carloan:"",
    bank_name:"",
    bank_branch:"",
    nominee_relation_with:"",
    nominee_first_name:"",
    nominee_last_name:"test",
    nominee_gender:"",
    nominee_dob: "",
    phone: "",
    email: "",
    address: "",
    is_eia_account: "0",
    eia_no: "",
    stateName: "",
    pinDataArr: [],
    pincode_id: "",
    org_level: ""
}

const ownerValidation = Yup.object().shape({
    first_name: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then: Yup.string().required('Name is required')
        .min(3, function() {
            return "First name must be 3 chracters"
        })
        .max(40, function() {
            return "Full name must be maximum 40 chracters"
        })
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]?[a-zA-Z]+)$/, function() {
            return "Please enter valid name"
        }),
        otherwise: Yup.string().required('Company name is required').min(3, function() {
            return "Company name must be min 3 chracters"
        })
    }),
    
    gender: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',  
        then: Yup.string().required('Gender is required'),
            // .matches(/^[MmFf]$/, function() {
            //     return "Please select valid gender"
            // }),
        otherwise: Yup.string().nullable()
    }),

    dob: Yup.date().when(['policy_for'], {
        is: policy_for => policy_for == '1', 
        then: Yup.date().required('Date of birth is required')
            .test(
                "18YearsChecking",
                function() {
                    return "Age should me minium 18 years and maximum 100 years"
                },
                function (value) {
                    if (value) {
                        const ageObj = new PersonAge();
                        return ageObj.whatIsMyAge(value) <= 100 && ageObj.whatIsMyAge(value) >= 18;
                    }
                    return true;
            }),
        otherwise: Yup.date().nullable()
    }),

    pancard: Yup.string()
    .notRequired(function() {
        return "Enter PAN number"
    }).matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
        return "Please enter valid Pan Number"
    }),
    pincode_id:Yup.string().required('Location is required'),

    pincode:Yup.string().required('Pincode is required')
    .matches(/^[0-9]{6}$/, function() {
        return "Please enter valid pin code"
    }),

    address:Yup.string().required('Address is required')
    // .matches(/^(?![0-9._])(?!.*[0-9._]$)(?!.*\d_)(?!.*_\d)[a-zA-Z0-9_.,-\\]+$/, 
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9\s,/.-]*$/, 
    function() {
        return "Please enter valid address"
    }),
    phone: Yup.string()
        .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('Phone No. is required'),
        
    email:Yup.string().email().required('Email is required').min(8, function() {
            return "Email must be minimum 8 chracters"
        })
        .max(75, function() {
            return "Email must be maximum 75 chracters"
        }).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid Email Id'),
        
    nominee_relation_with: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then:  Yup.string()
                .test(
                    "18YearsChecking",
                    function() {
                        return "Please select nominee relation"
                    },
                    function (value) {
                        if (this.parent.pa_flag == 1 && !value) {
                            return false
                        }
                        return true;
                }),
        otherwise: Yup.string().nullable()
    }),

    nominee_first_name: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then: Yup.string()
                .test(
                    "18YearsChecking",
                    function() {
                        return "Nominee name is required"
                    },
                    function (value) {
                        if (this.parent.pa_flag == 1 && !value) {
                            return false
                        }
                        return true;
                })
                .min(3, function() {
                    return "Name must be minimum 3 chracters"
                })
                .max(40, function() {
                    return "Name must be maximum 40 chracters"
                })
                .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]?[a-zA-Z]+)$/, function() {
                    return "Please enter valid name"
                }),
        otherwise: Yup.string().nullable()
    }),

    nominee_gender: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then: Yup.string()
                .test(
                    "18YearsChecking",
                    function() {
                        return "Nominee gender is required"
                    },
                    function (value) {
                        if (this.parent.pa_flag == 1 && !value) {
                            return false
                        }
                        return true;
                }),
        otherwise: Yup.string()
    }),

    nominee_dob: Yup.date().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then: Yup.date()
                .test(
                    "18YearsChecking",
                    function() {
                        return "Nominee gender is required"
                    },
                    function (value) {
                        if (this.parent.pa_flag == 1 && !value) {
                            return false
                        }
                        return true;
                })
                .test(
                    "3monthsChecking",
                    function() {
                        return "Age should be minium 3 months"
                    },
                    function (value) {
                        if (value) {
                            const ageObj = new PersonAge();
                            return ageObj.whatIsMyAge(value) <= 100 && ageObj.whatIsMyAgeMonth(value) >= 3;
                        }
                        return true;
                    }
                ),
        otherwise: Yup.date()   
    }),
    
    is_eia_account: Yup.string().required('This field is required'),
    eia_no: Yup.string()
        .test(
            "isEIAchecking",
            function() {
                return "Please enter EIA no"
            },
            function (value) {
                if (this.parent.is_eia_account == 1 && !value) {   
                    return false;    
                }
                return true;
            }
        )
        .min(13, function() {
            return "EIA no must be minimum 13 chracters"
        })
        .max(13, function() {
            return "EIA no must be maximum 13 chracters"
        }).matches(/^[1245][0-9]{0,13}$/,'Please enter valid EIA no').notRequired('EIA no is required'),

    appointee_name: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then: Yup.string().notRequired("Please enter appointee name")
                .min(3, function() {
                    return "Name must be minimum 3 chracters"
                })
                .max(40, function() {
                    return "Name must be maximum 40 chracters"
                })        
                .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)([\s]?[a-zA-Z]+)$/, function() {
                    return "Please enter valid name"
                }).test(
                    "18YearsChecking",
                    function() {
                        return "Please enter appointee name"
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && this.parent.pa_flag == 1 && !value) {   
                            return false  
                        }
                        return true;
                    }
                ),
        otherwise: Yup.string().nullable()
    }),

    appointee_relation_with: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '1',       
        then: Yup.string().notRequired("Please select relation")
                .test(
                    "18YearsChecking",
                    function() {
                        return 'Apppointee relation is required'
                    },
                    function (value) {
                        const ageObj = new PersonAge();
                        if (ageObj.whatIsMyAge(this.parent.nominee_dob) < 18 && this.parent.pa_flag == 1 && !value) {   
                            return false;    
                        }
                        return true;
                    }
                ),
        otherwise: Yup.string().nullable()
    }),

    date_of_incorporation: Yup.date().when(['policy_for'], {
        is: policy_for => policy_for == '2', 
        then: Yup.date().required('Date of incorporation is required'),
        otherwise: Yup.date().nullable()
    }),

    org_level: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '2', 
        then: Yup.string().required('Organization level is required'),
        otherwise: Yup.string()
    }), 

    gstn_no: Yup.string().when(['policy_for'], {
        is: policy_for => policy_for == '2',       
        then: Yup.string().required('GSTIN is required')
            .matches(/^[0-9]{2}[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/,'Invalid GSTIN'),
        otherwise: Yup.string().nullable()
    }),

    is_carloan: Yup.mixed().required('This field is required'),
    bank_name:Yup.string().notRequired('Bank Name is required')
    .test(
        "isLoanChecking",
        function() {
            return "Please enter bank name"
        },
        function (value) {
            if (this.parent.is_carloan == 1 && !value) {   
                return false;    
            }
            return true;
        }
    ).matches(/^[A-Za-z][A-Za-z\s]*$/, function() {
        return "Please enter bank name"
    }),
    bank_branch: Yup.string().notRequired('Bank branch is required')
    .test(
        "isLoanChecking",
        function() {
            return "Please enter bank branch"
        },
        function (value) {
            if (this.parent.is_carloan == 1 && !value) {   
                return false;    
            }
            return true;
        }
    ).matches(/^[A-Za-z][A-Za-z\s]*$/, function() {
        return "Please enter bank branch"
    }),
})

class TwoWheelerAdditionalDetails extends Component {


    state = {
        showEIA: false,
        is_eia_account: '',
        showLoan: false,
        is_loan_account: '',
        insurerList: [],
        policyHolder: {},
        nomineeDetails: {},
        quoteId: "",
        bankDetails: {},
        addressDetails: [],
        relation: [],
        step_completed: "0",
        appointeeFlag: false,
        is_appointee:0
    };
    
    ageCheck = (value) => {
        const ageObj = new PersonAge();
        let age = ageObj.whatIsMyAge(value)
        if(age < 18){
            this.setState({
                appointeeFlag: true,
                is_appointee:1
            })
        }
        else {
            this.setState({
                appointeeFlag: false,
                is_appointee:0
            })
        } 
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    // showEIAText = (value) =>{
    //     if(value == 1){
    //         this.setState({
    //             showEIA:true,
    //             is_eia_account:1
    //         })
    //     }
    //     else{
    //         this.setState({
    //             showEIA:false,
    //             is_eia_account:0
    //         })
    //     }
    // }

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
        this.props.history.push(`/two_wheeler_verifyTP/${productId}`);
    }


    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const {motorInsurance} = this.state
        const formData = new FormData(); 
        let encryption = new Encryption();
        let post_data = {
            'policy_holder_id':localStorage.getItem('policyHolder_id'),
            'menumaster_id':1,
            'first_name':values['first_name'],
            'last_name':values['last_name'],
            'pancard':values['pancard'],
            'pincode_id':values['pincode_id'],
            'district':values['district'],
            'pincode':values['pincode'].toString(),
            'is_carloan':values['is_carloan'],
            'bank_name':values['bank_name'],
            'bank_branch':values['bank_branch'],
            'phone': values['phone'],
            'email': values['email'],
            'is_eia_account': values['is_eia_account'],
            'eia_no': values['eia_no'],
            'address': values['address'],          
            'gstn_no': values['gstn_no'],
            'is_carloan':values['is_carloan'],
            'bank_name':values['bank_name'],
            'bank_branch':values['bank_branch'],
            'page_name': values[`two_wheeler_additional_detailsTP/${productId}`],
        }
        if(motorInsurance.policy_for == '1' && motorInsurance.pa_flag == '1'){
            post_data['dob'] = moment(values['dob']).format("YYYY-MM-DD")
            post_data['nominee_relation_with'] = values['nominee_relation_with']
            post_data['nominee_first_name'] = values['nominee_first_name']
            post_data['nominee_last_name']= values['nominee_last_name']
            post_data['nominee_gender'] = values['nominee_gender']
            post_data['nominee_dob'] = moment(values['nominee_dob']).format("YYYY-MM-DD")
            post_data['appointee_name'] = values['appointee_name']
            post_data['appointee_relation_with'] = values['appointee_relation_with']
            post_data['is_appointee'] = this.state.is_appointee
            post_data['gender']= values['gender']
        }
        else if(motorInsurance.policy_for == '1' && motorInsurance.pa_flag == '0') {
            post_data['gender']= values['gender']
            post_data['dob'] = moment(values['dob']).format("YYYY-MM-DD")
        }
        else {
            post_data['gender']= "cc"
            post_data['date_of_incorporation'] = moment(values['date_of_incorporation']).format("YYYY-MM-DD")
            post_data['org_level'] = values['org_level']
        }
            
        console.log('post_data', post_data);
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/two-wh/owner-details`, formData)
        .then(res => { 
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp-----', decryptResp)
            this.props.loadingStop();
            if (decryptResp.error == false) {
            this.props.history.push(`/two_wheeler_policy_premium_detailsTP/${productId}`);
            }
        })
        .catch(err => { 
          this.props.loadingStop();
          actions.setSubmitting(false)
          let decryptErr = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptErr-----', decryptErr)
        });

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh/details/${policyHolder_id}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data))
                 console.log("decrypt---", decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let policyHolder = decryptResp.data.policyHolder ? decryptResp.data.policyHolder : {};
                 let nomineeDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.nominee[0] : {}
                 let is_loan_account = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.is_carloan : 0
                 let quoteId = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data.quote_id : ""
                 let is_eia_account=  policyHolder && (policyHolder.is_eia_account == 0 || policyHolder.is_eia_account == 1) ? policyHolder.is_eia_account : ""
                 let bankDetails = decryptResp.data.policyHolder && decryptResp.data.policyHolder.bankdetail ? decryptResp.data.policyHolder.bankdetail[0] : {};
                 let addressDetails = JSON.parse(decryptResp.data.policyHolder.pincode_response)
                 let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
            

                 console.log('is_appointee', nomineeDetails ? nomineeDetails.is_appointee : "efg")
                //  return false;
                 this.setState({
                    quoteId, motorInsurance, previousPolicy, vehicleDetails, policyHolder, nomineeDetails, is_loan_account,
                    is_eia_account, bankDetails, addressDetails, step_completed,
                    is_appointee: nomineeDetails ? nomineeDetails.is_appointee : ""
                    
                })
                this.props.loadingStop();
                this.fetchPrevAreaDetails(addressDetails)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchAreadetails=(e)=>{
        let pinCode = e.target.value;      

        if(pinCode.length==6){
            const formData = new FormData();
            this.props.loadingStart();
            let encryption = new Encryption();
            const post_data_obj = {
                'pincode':pinCode
            };
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
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

    
    fetchPrevAreaDetails=(addressDetails)=>{
        if(addressDetails){
            let pincode = addressDetails.PIN_CD;
            const formData = new FormData();
            // let encryption = new Encryption();

        //    const post_data_obj = {
        //         'pincode':pincode.toString()
        //     };
           // let encryption = new Encryption();
        //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

            formData.append('pincode', pincode)
            this.props.loadingStart();
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

    fetchRelationships=()=>{

            this.props.loadingStart();
            axios.get('relations')
            .then(res=>{
                let relation = res.data.data ? res.data.data : []                        
                this.setState({
                    relation
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
                this.setState({
                    relation: []
                });
            })
        
    }

    componentDidMount() {
        this.fetchData();
        this.fetchRelationships();
    }

   

    render() {
        const {showLoan, is_eia_account, is_loan_account, nomineeDetails, motorInsurance,appointeeFlag, is_appointee,
            bankDetails,policyHolder, stateName, pinDataArr, quoteId, addressDetails, relation,step_completed,vehicleDetails} = this.state
        const {productId} = this.props.match.params 

        let newInitialValues = Object.assign(initialValue, {
            first_name: policyHolder && policyHolder.first_name ? policyHolder.first_name : "",
            gender:  policyHolder && policyHolder.gender ? policyHolder.gender : "",
            dob: policyHolder && policyHolder.dob ? new Date(policyHolder.dob) : "",
            pancard: policyHolder && policyHolder.pancard ? policyHolder.pancard : "",
            pincode_id: addressDetails && addressDetails.id ? addressDetails.id : "",
            pincode: policyHolder && policyHolder.pincode ? policyHolder.pincode : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            is_carloan:is_loan_account,
            bank_name: bankDetails ? bankDetails.bank_name : "",
            bank_branch: bankDetails ? bankDetails.bank_branch : "",
            nominee_relation_with: nomineeDetails && nomineeDetails.relation_with ? nomineeDetails.relation_with.toString() : "",
            nominee_first_name: nomineeDetails && nomineeDetails.first_name ? nomineeDetails.first_name : "",
            nominee_gender: nomineeDetails && nomineeDetails.gender ? nomineeDetails.gender : "",
            nominee_dob: nomineeDetails && nomineeDetails.dob ? new Date(nomineeDetails.dob) : "",
            gstn_no: policyHolder && policyHolder.gstn_no ? policyHolder.gstn_no : "",
            phone: policyHolder && policyHolder.mobile ? policyHolder.mobile : "",
            email:  policyHolder && policyHolder.email_id ? policyHolder.email_id : "",
            address: policyHolder && policyHolder.address ? policyHolder.address : "",
            // is_eia_account:  is_eia_account,
            eia_no: policyHolder && policyHolder.eia_no ? policyHolder.eia_no : "",
            policy_for : motorInsurance ? motorInsurance.policy_for : "",
            pa_flag : motorInsurance ? motorInsurance.pa_flag : 0,
            appointee_relation_with: nomineeDetails && nomineeDetails.appointee_relation_with ? nomineeDetails.appointee_relation_with : "",
            appointee_name: nomineeDetails && nomineeDetails.appointee_name ? nomineeDetails.appointee_name : "",
            date_of_incorporation: policyHolder && policyHolder.date_of_incorporation ? new Date(policyHolder.date_of_incorporation) : "",
            org_level: policyHolder && policyHolder.org_level ? policyHolder.org_level : "",
        });

        const quoteNumber =
        quoteId ? (
            <h4>You are just one steps away in getting your policy ready and your Quotation Number: {quoteId}. Please share a few more details. </h4>
        ) : null;

        
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
                { step_completed >= '4' && vehicleDetails.vehicletype_id == '3' ?
                <section className="brand m-b-25">
                    <div className="brand-bg">

                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit}
                        validationSchema={ownerValidation}
                        >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                             let value = values.nominee_first_name;
                        return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="d-flex justify-content-left brandhead">
                                {quoteNumber}
                                </div>
                                
                                <div className="d-flex justify-content-left carloan">
                                    <h4> Taken 2-wheeler Loan</h4>
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
                                                {errors.is_carloan && touched.is_carloan ? (
                                                <span className="errorMsg">{errors.is_carloan}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </Col>
                                    {showLoan || is_loan_account == 1 ?
                                    <Fragment>
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
                                    </Col> 
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
                                    </Fragment>: ''}
                                </Row>
                                <Row>
                                    <Col>&nbsp;</Col>
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
                                                placeholder={values.policy_for == '2' ? "Company Name" : "Full Name"}
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
                                    {motorInsurance && motorInsurance.policy_for == '2' ?
                                        <Col sm={12} md={4} lg={4}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                <Field
                                                    name='gstn_no'
                                                    type="text"
                                                    placeholder= "GSTIN"
                                                    autoComplete="off"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                    value = {values.gstn_no.toUpperCase()}                                                                            
                                                />
                                                    {errors.gstn_no && touched.gstn_no ? (
                                                <span className="errorMsg">{errors.gstn_no}</span>
                                                ) : null} 
                                                </div>
                                            </FormGroup>
                                        </Col> : null }
                                        {motorInsurance && motorInsurance.policy_for == '2' ?
                                        <Col sm={12} md={4} lg={4}>
                                            <FormGroup>
                                            <DatePicker
                                                name="date_of_incorporation"
                                                dateFormat="dd MMM yyyy"
                                                autoComplete="off"
                                                placeholderText="Incorporation Date"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                maxDate={new Date(maxDoi)}
                                                minDate={new Date(minDoi)}
                                                className="datePckr"
                                                selected={values.date_of_incorporation}
                                                onChange={(val) => {
                                                    setFieldTouched('date_of_incorporation');
                                                    setFieldValue('date_of_incorporation', val);
                                                    }}
                                            />
                                            {errors.date_of_incorporation && touched.date_of_incorporation ? (
                                                <span className="errorMsg">{errors.date_of_incorporation}</span>
                                            ) : null}  
                                            </FormGroup>
                                        </Col> : null }
                                    {motorInsurance && motorInsurance.policy_for == '1' ?
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
                                    </Col> : null}
                                    {motorInsurance && motorInsurance.policy_for == '1' ?
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <DatePicker
                                            name="dob"
                                            dateFormat="dd MMM yyyy"
                                            placeholderText="DOB"
                                            autoComplete="off"
                                            peekPreviousMonth
                                            peekPreviousYear
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            maxDate={new Date(maxDobAdult)}
                                            minDate={new Date(minDobAdult)}
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
                                    </Col> : null }
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                            <Field
                                                name='email'
                                                type="email"
                                                placeholder="Email "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.email}                                                                            
                                            />
                                            {errors.email && touched.email ? (
                                            <span className="errorMsg">{errors.email}</span>
                                            ) : null}  
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup className="m-b-25">
                                            <div className="insurerName nmbract">
                                                <span>+91</span>
                                            <Field
                                                name='phone'
                                                type="text"
                                                placeholder="Mobile No. "
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value = {values.phone}
                                                maxLength="10" 
                                                className="phoneinput pd-l-25"                                                                          
                                            />
                                            {errors.phone && touched.phone ? (
                                            <span className="errorMsg msgpositn">{errors.phone}</span>
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
                                    
                                </Row>

                                <Row>  
                                    <Col sm={12} md={4} lg={4}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <Field
                                                name="pincode"
                                                type="test"
                                                placeholder="Pincode"
                                                autoComplete="off"
                                                maxlength = "6"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                onKeyUp={e=> this.fetchAreadetails(e)}
                                                value={values.pincode}
                                                maxLength="6"
                                                onInput= {(e)=> {
                                                    setFieldTouched("state");
                                                    setFieldTouched("pincode");
                                                    setFieldValue("pincode", e.target.value);
                                                    setFieldValue("state", stateName ? stateName[0] : values.state);
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
                                                <option value="">Select Area</option>
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
                                                    value={stateName ? stateName : values.state} 
                                                    disabled = {true}
                                                    
                                                />
                                                {errors.state && touched.state ? (
                                                <span className="errorMsg">{errors.state}</span>
                                                ) : null}           
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {motorInsurance && motorInsurance.policy_for == '2' ?
                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="formSection">
                                            <Field
                                                name="org_level"
                                                component="select"
                                                autoComplete="off"
                                                value={values.org_level}
                                                className="formGrp"
                                            >
                                            <option value="">Select Organization Level</option>
                                            <option value="1">Corporate Public</option> 
                                            <option value="2">Corporate (PSU)</option>        
                                            <option value="3">Corporate (Private)</option>        
                                            <option value="4">Firm</option>        
                                            <option value="5">HUF</option>        
                                            <option value="6">Society</option>  
                                            <option value="7">NGO</option>       
                                            <option value="8">Trust</option>   
                                            <option value="9">BOA</option>        
                                            <option value="10">Government</option>        
                                            <option value="11">SME</option>                                              
                                           
                                            </Field>     
                                            {errors.org_level && touched.org_level ? (
                                                <span className="errorMsg">{errors.org_level}</span>
                                            ) : null}        
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row> : null }
                                {motorInsurance && motorInsurance.policy_for == '1' ?
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
                                                value = {values.pancard.toUpperCase()} 
                                                onChange= {(e)=> 
                                                    setFieldValue('pancard', e.target.value.toUpperCase())
                                                    }                                                                           
                                            />
                                            {errors.pancard && touched.pancard ? (
                                            <span className="errorMsg">{errors.pancard}</span>
                                            ) : null} 
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row> : null }

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>
                                {motorInsurance && motorInsurance.policy_for == '1' && motorInsurance.pa_flag == '1' ?
                                <Fragment>
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
                                                placeholder="Nominee Name"
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
                                            autoComplete="off"
                                            peekPreviousMonth
                                            peekPreviousYear
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode="select"
                                            maxDate={new Date(maxDobNominee)}
                                            minDate={new Date(minDobNominee)}
                                            className="datePckr"
                                            selected={values.nominee_dob}
                                            onChange={(val) => {
                                                this.ageCheck(val)
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
                                           { relation.map((relations, qIndex) => 
                                            <option value={relations.id}>{relations.name}</option>                                        
                                           )}
                                            </Field>     
                                            {errors.nominee_relation_with && touched.nominee_relation_with ? (
                                                <span className="errorMsg">{errors.nominee_relation_with}</span>
                                            ) : null}        
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                {appointeeFlag  || is_appointee == '1' ? 
                                    <div>
                                        <div className="d-flex justify-content-left carloan">
                                            <h4> </h4>
                                        </div>
                                        <div className="d-flex justify-content-left carloan">
                                            <h4> Appointee  Details</h4>
                                        </div>
                                        <Row className="m-b-45">
                                            <Col sm={12} md={4} lg={4}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                            name="appointee_name"
                                                            type="text"
                                                            placeholder="Appointee Name"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.appointee_name}
                                                        />
                                                        {errors.appointee_name && touched.appointee_name ? (
                                                        <span className="errorMsg">{errors.appointee_name}</span>
                                                        ) : null}
                                                        
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={4} lg={6}>
                                                <FormGroup>
                                                    <div className="formSection">                                                           
                                                        <Field
                                                            name="appointee_relation_with"
                                                            component="select"
                                                            autoComplete="off"
                                                            value={values.appointee_relation_with}
                                                            className="formGrp"
                                                        >
                                                        <option value="">Relation with Nominee</option>
                                                        { relation.map((relations, qIndex) => 
                                                            <option value={relations.id}>{relations.name}</option>                                        
                                                        )}
                                                        </Field>     
                                                        {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                            <span className="errorMsg">{errors.appointee_relation_with}</span>
                                                        ) : null}        
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                        </Row>
                                </div>  : null } 
                                </Fragment> : null }

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>

                                {/* <Row>
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
                                                        name='is_eia_account'                                            
                                                        value='1'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account`, e.target.value);
                                                            this.showEIAText(1);
                                                        }}
                                                        checked={values.is_eia_account == '1' ? true : false}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                        <Field
                                                        type="radio"
                                                        name='is_eia_account'                                            
                                                        value='0'
                                                        key='1'  
                                                        onChange={(e) => {
                                                            setFieldValue(`is_eia_account`, e.target.value);
                                                            this.showEIAText(0);
                                                        }}
                                                        checked={values.is_eia_account == '0' ? true : false}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.is_eia_account && touched.is_eia_account ? (
                                                        <span className="errorMsg">{errors.is_eia_account}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    
                                    {showEIA || is_eia_account == '1' ?
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">   
                                            <Field
                                                name="eia_no"
                                                type="text"
                                                placeholder="EIA Number"
                                                autoComplete="off"
                                                value = {values.eia_no}
                                                maxLength="13"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            />
                                            {errors.eia_no && touched.eia_no ? (
                                            <span className="errorMsg">{errors.eia_no}</span>
                                            ) : null}                                             
                                            </div>
                                        </FormGroup>
                                    </Col> : ''}
                                </Row>  */}

                                <div className="d-flex justify-content-left carloan">
                                    <h4> </h4>
                                </div>
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
                                <div className="motrcar"><img src={require('../../assets/images/two-wheeler-addl.svg')} alt="" /></div>
                            </Col>
                        </Row>
                        </Form>
                        );
                        }}
                        </Formik>
                    </div>
                </section> : step_completed == "" ? "Forbidden" : null }
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(TwoWheelerAdditionalDetails));