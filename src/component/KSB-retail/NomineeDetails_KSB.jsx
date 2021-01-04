import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import moment from "moment";
import swal from 'sweetalert';

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";
import Encryption from '../../shared/payload-encryption';


const minDobNominee = moment(moment().subtract(100, 'years').calendar()).calendar()
const maxDobNominee = moment().subtract(3, 'months').calendar();

const initialValues = {
    first_name: "",
    last_name: "",
    gender: "",
    dob: "",
    relation_with: "",
    // appointee_dob: "",
    appointee_relation_with: "",
    appointee_name: "",
    whatsapp_const_decl: "0",
    auto_renewal: "0",
    language_id: "",
    ksb_phyformat: "1"
}

const validateNominee = Yup.object().shape({
    last_name: Yup.string().required(function() {
        return "Please enter a last name"
        }).matches(/^[A-Za-z]*$/, function() {
            return "Please enter valid last name"
        }).min(1, function() {
            return "Name must be minimum 1 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
    }),
    first_name: Yup.string(function() {
        return "Please enter name"
        }).required(function() {
            return "Please enter name"
        }).matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
                return "Please enter valid name"
        }).min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
    }),
    gender: Yup.string().required(function() {
                return "Please select gender"
        }).matches(/^[MmFf]$/, function() {
            return "Please select valid gender"
    }),
    dob: Yup
        .date()
        .required( function() {
            return "Please enter DOB"
    }).test(
        "3monthsChecking",
        function() {
            return "Age should be minium 3 months"
        },
        function (value) {
            if (value) {
                const ageObj = new PersonAge();
                return ageObj.whatIsMyAge(value) < 111 && ageObj.whatIsMyAgeMonth(value) >=3;
            }
            return true;
        }
    ),
    relation_with: Yup.string().required(function() {
        return "Please select relation"
    }),
    // appointee_dob:Yup.date().notRequired("Please enter DOB").max(maxDob, function() {
    //     return "Date should not be future date"
    //     }).test(
    //         "18YearsChecking",
    //         function() {
    //             return "Appointee age should be more than 18 years"
    //         },
    //         function (value) {
    //             const ageObj = new PersonAge();
    //             if (value) {
    //                 const age_Obj = new PersonAge();
    //                 return age_Obj.whatIsMyAge(value) >= 18;
    //             }
    //             return true;
    //         }
    //     ).test(
    //         "18YearsChecking",
    //         function() {
    //             return "Please enter Appointee date of birth"
    //         },
    //         function (value) {
    //             const ageObj = new PersonAge();
    //             if (ageObj.whatIsMyAge(this.parent.dob) < 18) {   
    //                 return ageObj.whatIsMyAge(value) >= 18;    
    //             }
    //             return true;
    //         }
    //     ),
    appointee_name:Yup.string(function() {
            return "Please enter appointee name"
        }).notRequired(function() {
            return "Please enter appointee name"
        })        
        .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
            return "Please enter valid name"
    }).test(
        "18YearsChecking",
        function() {
            return "Please enter appointee name"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {   
                return false;    
            }
            return true;
        }
    ).min(3, function() {
        return "Name must be minimum 3 chracters"
    })
    .max(40, function() {
        return "Name must be maximum 40 chracters"
    }),
    appointee_relation_with: Yup.string().notRequired(function() {
        return "Please select relation"
    }).test(
        "18YearsChecking",
        function() {
            return "Please enter Appointee relation"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {   
                return false;    
            }
            return true;
        }
    ),

    language_id: Yup.string().required("Select preferred Language of communication"),
    auto_renewal: Yup.string().required("Select auto renewal").nullable(),
    whatsapp_const_decl: Yup.boolean().oneOf([true], 'Please check WhatsApp consent')

})

class NomineeDetails extends Component {

    state = {
        NomineeDetails: [], 
        appointeeFlag: false,
        is_appointee:0,
        languageList: [],
        ksbinfo: [],
        policy_holder: []
      };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

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

    addressInfo = (productId) => {
        this.props.history.push(`/Address_KSB/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params
        const formData = new FormData(); 
        let formArr = []

        for (const key in values) {
            if (values.hasOwnProperty(key)) {
              if(key == "dob" ){
                formArr[key] = moment(values[key]).format("YYYY-MM-DD")
              }
              else {
                formArr[key] = values[key]
              }          
            }
          }

        formArr['policy_holder_id'] = localStorage.getItem('policyHolder_id')
        formArr['is_appointee'] = this.state.is_appointee
        formArr['language_id'] = values.language_id;
        formArr['auto_renewal'] = values.auto_renewal;
        formArr['ksb_eformat'] = values.ksb_eformat;;
        // formArr['ksb_phyformat'] = values.ksb_phyformat;
        formArr['whatsapp_const_decl'] = values.whatsapp_const_decl;
        formArr['page_name'] = `NomineeDetails_KSB/${productId}`

        let formObj = {}
        Object.assign(formObj,formArr)
        console.log("PostData---", formObj)
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(formObj)))

        this.props.loadingStart();
        axios
        .post(`ksb/insert-nominee`, formData)
        .then(res => { 
            console.log("decrypt - Resp---- ", res.data)
            this.props.loadingStop();
            this.props.history.push(`/PolicyDetails_KSB/${productId}`);
        })
        .catch(err => {
            console.log("decrypt - Err---- ", err.data)
            if(err.status == 401) {
                swal("Session out. Please login")
            }
            else swal("Something wrong happened. Please try after some")
            actions.setSubmitting(false);
            this.props.loadingStop();
        });

        
    }

    fetchPolicyRelations = (family_relations)=>{        
        let relations = family_relations.map(resource=>resource.relation_with=='self'?1:0)
        let self_selected = relations && relations.length>0 && relations.includes(1)
        this.setState({
            self_selected
        })
        this.fetchLanguageList()
        //return self_selected
    }

    getNomineeDetails = () => {
        this.props.loadingStart();
        let policyHolder_refNo = localStorage.getItem("policyHolder_refNo");
        axios
          .get(`ksb/details/${policyHolder_refNo}`)
          .then(res => { 
           let family_members = res.data.data.policyHolder.request_data ? res.data.data.policyHolder.request_data.family_members:[]
           let ksbinfo =  res.data.data.policyHolder && res.data.data.policyHolder.ksbinfo  ? res.data.data.policyHolder.ksbinfo: []
           let policy_holder =  res.data.data.policyHolder;
            this.fetchPolicyRelations(family_members)
            this.setState({
                NomineeDetails: res.data.data.policyHolder.request_data.nominee[0],
                is_appointee: res.data.data.policyHolder.request_data.nominee[0].is_appointee, ksbinfo, policy_holder
            }) 
          })
          .catch(err => {
            this.setState({
                NomineeDetails: []
            });
            this.props.loadingStop();
          });
      }

    fetchLanguageList = () => {
        axios.get(`language`)
        .then(res=>{
            var languageList = res.data && res.data.data ? res.data.data : []
            this.setState({
                languageList            
            })
            this.props.loadingStop();
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
    }

    componentDidMount() {
    this.getNomineeDetails();
    }


    render() {
        const {productId} = this.props.match.params
        const {NomineeDetails,appointeeFlag, is_appointee,self_selected, languageList, ksbinfo, policy_holder} = this.state
        moment.defaultFormat = "YYYY-MM-YY";

        const newInitialValues = Object.assign(initialValues, {
            first_name: NomineeDetails ? NomineeDetails.first_name : "",
            last_name: NomineeDetails ? NomineeDetails.last_name : "",
            gender: NomineeDetails ? NomineeDetails.gender : "",
            dob: NomineeDetails && NomineeDetails.dob ? new Date(NomineeDetails.dob) : "",
            relation_with: NomineeDetails ? NomineeDetails.relation_with : "",
            // appointee_dob: NomineeDetails && NomineeDetails.appointee_dob ? new Date(NomineeDetails.appointee_dob) : "",
            appointee_relation_with: NomineeDetails && NomineeDetails.appointee_relation_with ? NomineeDetails.appointee_relation_with : "",
            appointee_name: NomineeDetails && NomineeDetails.appointee_name ? NomineeDetails.appointee_name : "",

            language_id: policy_holder && policy_holder.ksbinfo && policy_holder.ksbinfo.language_id ?  policy_holder.ksbinfo.language_id : '',
            // auto_renewal: policy_holder && policy_holder.ksbinfo ?  policy_holder.ksbinfo.auto_renewal : '',
            ksb_eformat: policy_holder && policy_holder.ksbinfo ?  policy_holder.ksbinfo.ksb_eformat : '',
            // ksb_phyformat: policy_holder && policy_holder.ksbinfo ?  policy_holder.ksbinfo.ksb_phyformat : '',
            whatsapp_const_decl: policy_holder && policy_holder.ksbinfo ?  policy_holder.ksbinfo.whatsapp_const_decl : '0'

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
                                <h4 className="text-center mt-3 mb-3">KSB Retail Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="justify-content-left brandhead  m-b-20">
                                            <h4 className="fs-18">You are just one step away from geting your policy ready</h4>
                                        </div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Nominee  Details</h4>
                                        </div>

                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateNominee}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                    return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="first_name"
                                                                    type="text"
                                                                    placeholder="First Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.first_name}
                                                                />
                                                                {errors.first_name && touched.first_name ? (
                                                                <span className="errorMsg">{errors.first_name}</span>
                                                                ) : null}
                                                                
                                                            </div>
                                                        </FormGroup>
                                                    </Col>

                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="last_name"
                                                                    type="text"
                                                                    placeholder="Last Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.last_name}
                                                                />
                                                                {errors.last_name && touched.last_name ? (
                                                                <span className="errorMsg">{errors.last_name}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>


                                                    <Col sm={12} md={4} lg={4}>
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
                                                                        <option value="m">Male</option>
                                                                        <option value="f">Female</option>
                                                                    </Field>     
                                                                    {errors.gender && touched.gender ? (
                                                                        <span className="errorMsg">{errors.gender}</span>
                                                                    ) : null}     
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row className="m-b-45">
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
                                                                maxDate={new Date(maxDobNominee)}
                                                                minDate={new Date(minDobNominee)}
                                                                className="datePckr"
                                                                onChange={(value) => {
                                                                    setFieldTouched("dob");
                                                                    setFieldValue("dob", value);
                                                                    this.ageCheck(value)
                                                                    }}
                                                                selected={values.dob}
                                                            />
                                                            {errors.dob && touched.dob ? (
                                                                <span className="errorMsg">{errors.dob}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>


                                                    <Col sm={12} md={8} lg={8}>
                                                        <FormGroup>
                                                            <div className="formSection">                                                           
                                                                <Field
                                                                    name="relation_with"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.relation_with}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Relation with Primary Insured</option>
                                                                {self_selected ? '': <option value="1">Self</option>}
                                                                <option value="2">Spouse</option>
                                                                <option value="3">Son</option>
                                                                <option value="4">Daughter</option>
                                                                <option value="5">Father</option>
                                                                <option value="6">Mother</option>
                                                                <option value="7">Father In Law</option>
                                                                <option value="8">Mother In Law</option>
                                                                </Field>     
                                                                {errors.relation_with && touched.relation_with ? (
                                                                    <span className="errorMsg">{errors.relation_with}</span>
                                                                ) : null}        
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                {appointeeFlag || is_appointee == '1' ? 
                                                    <div>
                                                    <div className="d-flex justify-content-left carloan m-b-25">
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
                                                                {/* <DatePicker
                                                                    name="appointee_dob"
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
                                                                        setFieldTouched("appointee_dob");
                                                                        setFieldValue("appointee_dob", value);
                                                                        }}
                                                                    selected={values.appointee_dob}
                                                                />
                                                                {errors.appointee_dob ? (
                                                                    <span className="errorMsg">{errors.appointee_dob}</span>
                                                                ) : null} */}
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
                                                                    {self_selected ? '':<option value="1">Self</option>}
                                                                    <option value="2">Spouse</option>
                                                                    <option value="3">Son</option>
                                                                    <option value="4">Daughter</option>
                                                                    <option value="5">Father</option>
                                                                    <option value="6">Mother</option>
                                                                    <option value="7">Father In Law</option>
                                                                    <option value="8">Mother In Law</option>
                                                                    </Field>     
                                                                    {errors.appointee_relation_with && touched.appointee_relation_with ? (
                                                                        <span className="errorMsg">{errors.appointee_relation_with}</span>
                                                                    ) : null}        
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                    </Row>
                                                    </div> 
                                                     : null
                                                } 

                                                <div className="d-flex justify-content-left carloan">
                                                    <h4> Additional Details</h4>
                                                </div>
                                                <div className="d-flex justify-content-left carloan">
                                                    <h4> &nbsp;</h4>
                                                </div>
                                                <Row className="m-b-45">
                                                    <Col sm={12} md={3} lg={6}>
                                                        <FormGroup>
                                                        Preferred Language for Teleconsultation
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={8} lg={5}>
                                                            <FormGroup>
                                                            <div className="formSection">
                                                                    <Field
                                                                        name="language_id"
                                                                        component="select"
                                                                        autoComplete="off"
                                                                        value={values.language_id}
                                                                        className="formGrp"
                                                                    >
                                                                    <option value="">Preferred Language</option>
                                                                    {languageList && languageList.map((resource,rindex)=>
                                                                        <option value={resource.id}>{resource.descriptions}</option>
                                                                    )}
                                                                        
                                                                        {/*<option value="area2">Area 2</option>*/}
                                                                    </Field>     
                                                                    {errors.language_id && touched.language_id ? (
                                                                        <span className="errorMsg">{errors.language_id}</span>
                                                                    ) : null}     
                                                                    </div>
                                                            </FormGroup>
                                                        </Col>

                                                        {/* <Col sm={12} md={3} lg={6}>
                                                            <FormGroup>
                                                            Auto Renewal
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={2}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='auto_renewal'                                            
                                                                    value='1'
                                                                    key='1'  
                                                                    onChange={(e) => {
                                                                        setFieldValue(`auto_renewal`, e.target.value);
                                                                    }}
                                                                    checked={values.auto_renewal == '1' ? true : false}
                                                                />
                                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                </label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={2}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='auto_renewal'                                            
                                                                    value='0'
                                                                    key='1'  
                                                                    onChange={(e) => {
                                                                        setFieldValue(`auto_renewal`, e.target.value);
                                                                    }}
                                                                    checked={values.auto_renewal == '0' ? true : false}
                                                                />
                                                                    <span className="checkmark " /><span className="fs-14"> No</span>
                                                                    {errors.auto_renewal && touched.auto_renewal ? (
                                                                        <span className="errorMsg">{errors.auto_renewal}</span>
                                                                    ) : null}
                                                                </label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col> */}
                                                        {/* <Col sm={12} md={8} lg={1}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                    &nbsp;
                                                                </div>
                                                            </FormGroup>
                                                        </Col> */}

                                                        {/* <Col sm={12} md={3} lg={6}>
                                                            <FormGroup>
                                                            Do you want Kutumb Swasthya Bima Policy related information in Physical Format?
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={2}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='ksb_phyformat'                                            
                                                                    value='1'
                                                                    key='1'  
                                                                    onChange={(e) => {
                                                                        setFieldValue(`ksb_phyformat`, e.target.value);
                                                                        
                                                                    }}
                                                                    checked={values.ksb_phyformat == '1' ? true : false}
                                                                />
                                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                </label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={2}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='ksb_phyformat'                                            
                                                                    value='0'
                                                                    key='1'  
                                                                    onChange={(e) => {
                                                                        setFieldValue(`ksb_phyformat`, e.target.value);
                                                                      
                                                                    }}
                                                                    checked={values.ksb_phyformat == '0' ? true : false}
                                                                />
                                                                    <span className="checkmark " /><span className="fs-14"> No</span>
                                                                    {errors.ksb_phyformat && touched.ksb_phyformat ? (
                                                                        <span className="errorMsg">{errors.ksb_phyformat}</span>
                                                                    ) : null}
                                                                </label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={1}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                    &nbsp;
                                                                </div>
                                                            </FormGroup>
                                                        </Col> */}

                                                        <Col sm={12} md={3} lg={6}>
                                                            <FormGroup>
                                                            Do you want Kutumb Swasthya Bima Policy related information in e-Format when applicable?
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={2}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='ksb_eformat'                                            
                                                                    value='1'
                                                                    key='1'  
                                                                    onChange={(e) => {
                                                                        setFieldValue(`ksb_eformat`, e.target.value);
                                                                    }}
                                                                    checked={values.ksb_eformat == '1' ? true : false}
                                                                />
                                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                </label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={2}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                <Field
                                                                    type="radio"
                                                                    name='ksb_eformat'                                            
                                                                    value='0'
                                                                    key='1'  
                                                                    onChange={(e) => {
                                                                        setFieldValue(`ksb_eformat`, e.target.value);
                                                                      
                                                                    }}
                                                                    checked={values.ksb_eformat == '0' ? true : false}
                                                                />
                                                                    <span className="checkmark " /><span className="fs-14"> No</span>
                                                                    {errors.ksb_eformat && touched.ksb_eformat ? (
                                                                        <span className="errorMsg">{errors.ksb_eformat}</span>
                                                                    ) : null}
                                                                </label>
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={8} lg={1}>
                                                            <FormGroup>
                                                                <div className="p-r-25">
                                                                    &nbsp;
                                                                </div>
                                                            </FormGroup>
                                                        </Col>

                                                        
                                                        <Col sm={12} md={8} lg={11} className="row formSection">
                                                            <label className="customCheckBox formGrp formGrp">
                                                                Declaration for Update via Digital Mode
                                                                <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">I/We acknowledge that by opting for digital services (including WhatsApp), I/We provide consent to receive communication/services from SBI General Insurance Company Limited related to my insurance policy through my registered mobile number & email</Tooltip>}>
                                                                <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" /></a>
                                                                </OverlayTrigger>
                                                                <div className="p-r-25">
                                                                <Field
                                                                    type="checkbox"  
                                                                    name='whatsapp_const_decl'                                             
                                                                    onChange={(e) => {
                                                                        if (e.target.checked === true) {
                                                                            setFieldTouched('whatsapp_const_decl')
                                                                            setFieldValue('whatsapp_const_decl', '1');
                    
                                                                        } else {
                                                                            setFieldValue('whatsapp_const_decl', '0');                                                            
                                                                        }
                                                                    }}
                                                                    checked={values.whatsapp_const_decl == '1' ? true : false}
                                                                />
                                                                    <span className="checkmark mL-0"></span>
                                                                </div>
                                                            </label>
                                                            {errors.whatsapp_const_decl ? 
                                                                <span className="errorMsg">{errors.whatsapp_const_decl}</span> : ""
                                                            }
                                                        </Col>
                                                    </Row>

                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.addressInfo.bind(this, productId )}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div>
                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="regisBox medpd">
                                                    <h4 className="txtRegistr resmb-15">
                                                        <p>Ab Kutumb Swasthya Bima Ke Saath Doctor Ki Salah Phone Par</p>
                                                        <p>Kutumb Swasthya Bima is for anyone and everyone who is looking for health insurance that is cost effective and offers great value</p>
                                                    </h4>
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
      loading: state.loader.loading
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop())
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(NomineeDetails));