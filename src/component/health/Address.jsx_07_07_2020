import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
// import ReactTooltip from "react-tooltip";
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";

import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import dateformat from "dateformat";
import moment from "moment";
import swal from 'sweetalert';

import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import Encryption from '../../shared/payload-encryption';

const maxDob = dateformat(new Date(), 'mm/dd/yyyy');
const minDobAdult = moment(moment().subtract(46, 'years').calendar()).add(1, 'day').calendar()
const maxDobAdult = moment().subtract(18, 'years').calendar();

const initialFamilyDetails = {
	fname: "",
	lname: "",
	dob: new Date(),
    gender: "",	
    family_member_id:0,
    looking_for:''
};

const initialValues = {
    proposerAsInsured: "",
    family_members:[initialFamilyDetails],
    panNo: "",
    phoneNo: "",
    email: "",
    address1: "",
    address2: "",
    address3: "",
    pincode: "",
    area: "",
    state: "",
    eIA: "",
    eia_account_no:"",
    proposerName: "",
    proposerLname: "",
    proposerDob: "",
    proposerGender: ""
    };

const validateAddress =  Yup.object().shape({
    proposerAsInsured: Yup.string()
        .required(function() {
            return "Please select a value"
        }),    
    address1: Yup.string()
        .notRequired(function() {
            return "Enter plot number."
        }).matches(/^([0-9]*)$/, function() {
            return "Invalid plot number"
        }),
    address2: Yup.string()
        .required(function() {
            return "Enter building name / number"
        }).matches(/^([0-9A-Za-z\s]*)$/, function() {
            return "Invalid building name / number"
        }),
    address3: Yup.string()
        .required(function() {
            return "Enter street name"
        }).matches(/^([A-Za-z\s]*)$/, function() {
            return "Invalid street name"
        }),
    email: Yup.string()
        .required( function() {
            return "Please enter email"
        })
        .email( function() {
            return "Please enter valid email"
        }),
    
    phoneNo: Yup.string()
        .required(function() {
            return "Please enter phone number"
        })
        .matches(/^([0-9]*)$/, function() {
            return "Invalid number"
        })
        .min(10, function() {
            return "Phone number should be minimum 10 digits"
        })
        .max(10, function() {
            return "Phone number should be maximum 10 digits"
        }),
   
    panNo: Yup.string()
        .required(function() {
            return "Enter PAN number"
        }).matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/, function() {
            return "Please enter valid Pan Number"
        }),
    pincode: Yup.string()
        .required(function() {
            return "Enter pin code"
        }).matches(/^([0-9]*)$/, function() {
            return "Invalid pin code"
        }).min(6, 'Must be exactly 6 digits')
        .max(6, 'Must be exactly 6 digits'),

    area: Yup.string()
        .required(function() {
            return "Select area"
        }),
    // state: Yup.string()
    //     .required(function() {
    //         return "Enter state"
    //     }),
    eIA: Yup.string()
        .required(function() {
            return "Select eIA option"
        }),
    family_members: Yup.array().of(
            Yup.object().shape({
                looking_for : Yup.string(),
                fname: Yup.string(function() {
                    return "Please enter name"
                }).required(function() {
                    return "Please enter name"
                })
                    .min(3, function() {
                        return "Name must be minimum 3 chracters"
                    })
                    .max(40, function() {
                        return "Name must be maximum 40 chracters"
                    })
                    .matches(/^[A-Za-z]*$/, function() {
                        return "Please enter valid name"
                }),
                lname: Yup.string(function() {
                    return "Please enter last name"
                }).required(function() {
                    return "Please enter last name"
                })
                    .min(1, function() {
                        return "Last name must be minimum 1 chracters"
                    })
                    .max(40, function() {
                        return "Last name must be maximum 40 chracters"
                    })
                    .matches(/^[A-Za-z]*$/, function() {
                        return "Please enter valid last name"
                }),
                dob: Yup.date().when(['looking_for'],{
                    //is: looking_for => (looking_for == 'self' || looking_for == 'spouse' || looking_for == 'child1') ,
                    is: looking_for => ['self','spouse','mother','father','fatherInLaw','motherInLaw'].includes(looking_for) ,
                    then: Yup.date().required("Please enter DOB").max(maxDob, function() {
                        return "Date should not be future date"
                        })
                        .test(
                            "18YearsChecking",
                            function() {
                                return "Age should me minium 18 years"
                            },
                            function (value) {
                                if (value) {
                                    const ageObj = new PersonAge();
                                    return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
                                }
                                return true;
                            }
                        )

                })
               
                ,
                gender: Yup.string().nullable().required("Require Gender"),        

            })     
    ),
    eia_account_no:Yup.string().when(['eIA'], {
        is: eIA => eIA == 1,
        then: Yup.string().required('Please select the EIA account number')
        .min(13, function() {
            return "EIA number should be minimum 13 digits"
        })
        .max(13, function() {
            return "EIA number should be maximum 13 digits"
        }).matches(/^[1245]{1}[0-9]{12}$/, function() {
            return "Invalid number"
        }),
        othewise: Yup.string()
    }),
    proposerName: Yup.string(function() {
        return "Please enter proposer name"
        }).notRequired(function() {
            return "Please enter proposer name"
        })
        .min(3, function() {
            return "Name must be minimum 3 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
        })
        .matches(/^[A-Za-z]*$/, function() {
            return "Please enter valid name"
        }).test(
        "proposerAsInsured",
        function() {
            return "Please enter proposer name"
        },
        function (value) {
            if (this.parent.proposerAsInsured == '0' && !value) {   
                return false;    
            }
            return true;
    }),
    proposerLname: Yup.string(function() {
        return "Please enter proposer last name"
        }).notRequired(function() {
            return "Please enter proposer last name"
        })
        .min(1, function() {
            return "Name must be minimum 1 chracters"
        })
        .max(40, function() {
            return "Name must be maximum 40 chracters"
        })
        .matches(/^[A-Za-z]*$/, function() {
            return "Please enter valid name"
        }).test(
        "proposerAsInsured",
        function() {
            return "Please enter proposer last name"
        },
        function (value) {
            if (this.parent.proposerAsInsured == '0' && !value) {   
                return false;    
            }
            return true;
    }),
    proposerDob: Yup.date()
        .notRequired( function() {
        return "Please enter proposer date of birth"
        }).test(
        "proposerAsInsured",
        function() {
            return "Please enter proposer date of birth"
        },
        function (value) {
            if (this.parent.proposerAsInsured == '0' && !value) {   
                return false;    
            }
            return true;
    }).test(
        "18YearsChecking",
        function() {
            return "Proposer age should be between 18 to 45 years"
        },
        function (value) {
            const ageObj = new PersonAge();
            if (value) {
                const age_Obj = new PersonAge();
                return ageObj.whatIsMyAge(value) < 46 && ageObj.whatIsMyAge(value) >= 18;
            }
            return true;
    }),
    proposerGender: Yup.string().notRequired(function() {
        return "Please select gender"
        }).matches(/^[MmFf]$/, function() {
        return "Please select valid gender"
    }).test(
        "proposerAsInsured",
        function() {
            return "Please select proposer gender"
        },
        function (value) {
            if (this.parent.proposerAsInsured == '0' && !value) {   
                return false;    
            }
            return true;
    }),

});

const validateFirstName=(str)=>{
    let error;
    if(str == ''){
        error = 'Please enter the name';
    }
    return error;    
}

class Address extends Component {

  
    constructor(props) {
		super(props)
		this.state = {
            policy_holder:{},
            familyMembers:[],
            addressDetails:{},
            is_eia_account:'',
            selfFlag:false,
            pinDataArr:[],
            stateName:[],
            showEIA:false
		}
	}

    


    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    componentDidMount(){       
        this.fetchData();
    }

    fetchData=()=>{
        const {productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_id");
        this.props.loadingStart();
        axios.get(`policy-holder/${policyHolder_id}`)
            .then(res=>{
                let policy_holder =  res.data.data.policyHolder;
                let family_members = res.data.data.policyHolder.request_data.family_members
                let addressDetails = JSON.parse(res.data.data.policyHolder.address)
                let is_eia_account = res.data.data.policyHolder.is_eia_account == 2 ? "" : res.data.data.policyHolder.is_eia_account
                let selfFlag = false;
                for(let i=0;i<family_members.length;i++){
                    if(family_members[i].relation_with=='self'){
                        selfFlag = true
                        break
                    }
                }
                

                this.setState({ 
                    selfFlag,
                    policy_holder,
                    familyMembers:family_members,
                    addressDetails,
                    is_eia_account
                })
                this.props.loadingStop();
                this.fetchPrevAreaDetails(addressDetails)
                
            })
            .catch(function (error) {
                // handle error
                // this.props.loadingStop();
            })
            this.props.loadingStop();
    }

    fetchPrevAreaDetails=(addressDetails)=>{
            if(addressDetails){
                let pincode = addressDetails.pincode;
                const formData = new FormData();
                let encryption = new Encryption();

               const post_data_obj = {
                    'pincode':pincode.toString()
                };
               // let encryption = new Encryption();
               formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))

                this.props.loadingStart();
                axios.post('generate-pincode-details',
                formData
                ).then(res=>{
                    let pinData = res.data.trim();               
                    let pinDataArr = JSON.parse(pinData.substring(0,pinData.length-10))   
                    let stateName=pinDataArr.map(resource=>
                        resource.STATE_NM
                    )  
                    var unique = stateName.filter((v, i, a) => a.indexOf(v) === i); 
                    
                        
                    this.setState({
                        pinDataArr,
                        stateName:unique,
                    });
                    this.props.loadingStop();
                }).
                catch(err=>{
                    this.props.loadingStop();
                })
            }
            
    }

    fetchAreadetails=(e)=>{
        //let pinCode=obj.value;
        let pinCode = e.target.value;
       
        if(pinCode.length==6){

            const formData = new FormData();
            ///formData.append('pincode',pinCode);
            this.props.loadingStart();

            let encryption = new Encryption();

           // formData.append('pincode',pinCode);
            const post_data_obj = {
                'pincode':pinCode
            };
           // let encryption = new Encryption();
           formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
           axios.post('generate-pincode-details',
            formData
            ).then(res=>{
                let pinData = res.data.trim();               
                let pinDataArr = JSON.parse(pinData.substring(0,pinData.length-10))   
                let stateName=pinDataArr.map(resource=>
                    resource.STATE_NM
                )  
                var unique = stateName.filter((v, i, a) => a.indexOf(v) === i); 
                
                    
                this.setState({
                    pinDataArr,
                    stateName:unique,
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
            })
           

        }
        
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    sumInsured = (productId) => {
        this.props.history.push(`/SelectDuration/${productId}`);
    }

    handleSubmit = (values, actions) => {
        const {productId } = this.props.match.params
        const policyHolder_id =  localStorage.getItem('policyHolder_id');
        const formData = new FormData();

        let formArr = []
        
      //  formData.append('policy_holder_id',policyHolder_id);
        formArr['policy_holder_id'] = policyHolder_id;
        const family_members = values.family_members;
        let proposerAsInsured = values.proposerAsInsured;
        sessionStorage.setItem('proposed_insured',proposerAsInsured);
 
        let looking_for = []
        let family_member_id = []
        let gender = []
        let first_name = []
        let last_name = []
        let dob = []
        let pancard_no = []

        for(let i=0;i<family_members.length;i++){
           // formData.append(`looking_for[${i}]`, family_members[i].looking_for);
             looking_for.push(family_members[i].looking_for)
          //  formData.append(`family_member_id[${i}]`, family_members[i].family_member_id);
            family_member_id.push(family_members[i].family_member_id)
          //  formData.append(`gender[${i}]`, family_members[i].gender);
            gender.push(family_members[i].gender)
           // formData.append(`first_name[${i}]`, family_members[i].fname);
            first_name.push(family_members[i].fname)
            //formData.append(`last_name[${i}]`, family_members[i].lname);
            last_name.push(family_members[i].lname)
           // formData.append(`dob[${i}]`, moment(family_members[i].dob).format("YYYY-MM-DD"));
           dob.push(moment(family_members[i].dob).format("YYYY-MM-DD"))
           pancard_no.push(values.panNo)
          //  formData.append(`pancard_no[${i}]`, values.panNo);
         //   formData.append(`pancard_no[${i}]`, values.panNo);
        }  

        formArr['looking_for'] = looking_for
        formArr['family_member_id'] = family_member_id
        formArr['gender'] = gender
        formArr['first_name'] = first_name
        formArr['last_name'] = last_name
        formArr['dob'] = dob
        formArr['pancard_no'] = pancard_no

        formArr['policy_holder_id'] = policyHolder_id;


        let email = values.email;
     // formData.append('panNo',values.panNo);
       // formData.append('phoneNo',values.phoneNo);
        formArr['phoneNo'] = values.phoneNo;
        //formData.append('email_id',values.email);
        formArr['email_id'] = values.email;
        sessionStorage.setItem('email_data',email);
        formArr['is_eia_account'] = values.eIA;
        //formData.append('is_eia_account',values.eIA);        
        sessionStorage.setItem('pan_data',values.panNo);
        sessionStorage.setItem('email_data',values.email);

        let address_object = {}
        Object.assign(address_object,{
            address1:values.address1,
            address2:values.address2,
            address3:values.address3,
            area:values.area,
            phoneNo:values.phoneNo,
            pincode:values.pincode,
            state:values.state,
        })
        //formData.append('communication_address',JSON.stringify(address_object));   
        formArr['communication_address'] = JSON.stringify(address_object);   
       // formData.append('panNo',values.panNo);
        formArr['panNo'] = values.panNo;
        //formData.append('phoneNo',values.phoneNo);
        formArr['phoneNo'] = values.phoneNo;
        //formData.append('email',values.email); 
        formArr['email'] = values.email;
       // formData.append('proposerName',values.proposerName);
        formArr['proposerName'] = values.proposerName;
       // formData.append('proposerLname',values.proposerLname);
        formArr['proposerLname'] = values.proposerLname;
        //formData.append('proposerDob',moment(values.proposerDob).format("YYYY-MM-DD") ); 
        formArr['proposerDob'] = moment(values.proposerDob).format("YYYY-MM-DD");
        //formData.append('proposerGender',values.proposerGender); 
        formArr['proposerGender'] = values.proposerGender;
        if(values.eIA == 1){
            //formData.append('eia_account_no',values.eia_account_no)
            formArr['eia_account_no'] = values.eia_account_no;
        }       

        let formObj = {}
        Object.assign(formObj,formArr);
        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(formObj)))

        this.props.loadingStart();
        axios
        .post(`/insured-member-details`, formData)
        .then(res => {
           // if(res.data.completedStep == 4){
                this.props.loadingStop();
                this.props.history.push(`/NomineeDetails/${productId}`);
           // }        
        })
        .catch(err => {
            if(err.status == 401) {
                swal("Session out. Please login")
            }
            else swal("Something wrong happened. Please try after some")
            actions.setSubmitting(false);
        this.props.loadingStop();
        });
    }

    initFamilyDetailsList = familyDetails => {
		if (familyDetails.length > 0) {
			return familyDetails.map(resource => ({
				fname: resource.first_name ? resource.first_name:'',
				lname: resource.last_name ? resource.last_name:'',
				dob: resource.dob,
                gender: resource.gender ?  resource.gender:'',
                looking_for: resource.relation_with,
                family_member_id: resource.id,
                pancard_no:resource.pancard_no
			}));
		} else {
			return [initialFamilyDetails];
		}
    };

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
    
    
    render() {
        const {policy_holder,familyMembers,addressDetails,is_eia_account,selfFlag,pinDataArr,stateName,showEIA} = this.state    
        console.log("aaaa======> ", is_eia_account)
        let newInitialValues = Object.assign(initialValues, {
            proposerAsInsured: sessionStorage.getItem('proposed_insured') ? sessionStorage.getItem('proposed_insured') : (selfFlag ? 1:0),
            family_members:this.initFamilyDetailsList(
                familyMembers
            ),
            panNo: sessionStorage.getItem('pan_data') ? sessionStorage.getItem('pan_data') : "",
            phoneNo: addressDetails && addressDetails.phoneNo ? addressDetails.phoneNo: "",
            email: sessionStorage.getItem('email_data') ? sessionStorage.getItem('email_data') : "",
            address1: addressDetails && addressDetails.address1 ? addressDetails.address1: "",
            address2: addressDetails && addressDetails.address2 ? addressDetails.address2:  "",
            address3: addressDetails && addressDetails.address3 ? addressDetails.address3: "",
            pincode: addressDetails && addressDetails.pincode ? addressDetails.pincode: "",
            area: addressDetails && addressDetails.area ? addressDetails.area: "",
            state: addressDetails && addressDetails.state ? addressDetails.state:"",
            eIA: is_eia_account,
            eia_account_no : policy_holder && policy_holder.eia_no ?  policy_holder.eia_no : '',

            proposerName : policy_holder && policy_holder.first_name ?  policy_holder.first_name : '',
            proposerLname : policy_holder && policy_holder.last_name ?  policy_holder.last_name : '',
            proposerDob : policy_holder && policy_holder.dob ?  new Date(policy_holder.dob) : '',
            proposerGender : policy_holder && policy_holder.gender ?  policy_holder.gender : ''
        });

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
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">

                                    <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                                    validationSchema={validateAddress}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                        
                                    return (
                                    <Form>
                                        <div className="d-flex flex-column flex-sm-column flex-md-column flex-lg-row justify-content-left m-b-15">
                                            <div className="proposr prsres m-r-60"><p>Is the Proposer same as insured</p></div>
                                            <div className="d-inline-flex">
                                                <div className="p-r-25">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='proposerAsInsured'                                            
                                                        value='1'
                                                        key='0'  
                                                        onChange={(e) => {
                                                            setFieldValue(`proposerAsInsured`, e.target.value);
                                                        }}
                                                        checked={values.proposerAsInsured == '1' ? true : false}
                                                        disabled={true}
                                                    />
                                                        <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                    </label>
                                                </div>

                                                <div className="">
                                                    <label className="customRadio3">
                                                    <Field
                                                        type="radio"
                                                        name='proposerAsInsured'                                            
                                                        value='0'
                                                        key='0'  
                                                        onChange={(e) => {
                                                            setFieldValue(`proposerAsInsured`, e.target.value);
                                                        }}
                                                        checked={values.proposerAsInsured == '0' ? true : false}
                                                        disabled={true}
                                                    />
                                                        <span className="checkmark" />
                                                        <span className="fs-14">No</span>
                                                        {errors.proposerAsInsured && touched.proposerAsInsured ? (
                                                        <span className="errorMsg">{errors.proposerAsInsured}</span>
                                                    ) : null}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        <Row>
                                        <Col sm={12} md={9} lg={9}>
                                        <>
                                        {newInitialValues.proposerAsInsured == '0' ? 
                                       
                                        <div>
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Proposer Details</h4>
                                        </div>
                                        <div className="d-flex justify-content-left prsnlinfo">
                                            <div className="W12">
                                                Proposer
                                                <Field
                                                    name="name"
                                                    type="hidden"
                                                    value={values.name}
                                                />
                                                <Field
                                                    name="name"
                                                    type="hidden"
                                                    value={values.name}
                                                />
                                            </div>
                                            <Row>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                            name="proposerName"
                                                            type="text"
                                                            placeholder="First Name"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value = {values.proposerName}
                                                        />
                                                            {errors.proposerName && touched.proposerName ? (
                                                        <span className="errorMsg">{errors.proposerName}</span>
                                                        ) : null}
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <div className="insurerName">
                                                        <Field
                                                                name="proposerLname"
                                                                type="text"
                                                                placeholder="Last Name"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value = {values.proposerLname}                                                                            
                                                        />
                                                            {errors.proposerLname && touched.proposerLname? (
                                                        <span className="errorMsg">{errors.proposerLname}</span>
                                                        ) : null}
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <DatePicker
                                                        name="proposerDob"
                                                        dateFormat="dd MMM yyyy"
                                                        placeholderText="DOB"
                                                        peekPreviousMonth
                                                        peekPreviousYear
                                                        showMonthDropdown
                                                        showYearDropdown
                                                        dropdownMode="select"
                                                        maxDate={new Date(maxDobAdult)}
                                                        minDate={new Date(minDobAdult)}
                                                        className="datePckr"
                                                        selected={values.proposerDob }
                                                        onChange={(val) => {
                                                            setFieldTouched("proposerDob");
                                                            setFieldValue("proposerDob", val);
                                                            }}
                                                            
                                                        //selected={moment(values.family_members[index].dob).format("dd MMM yyyy")}
                                                        
                                                    />
                                                    {errors.proposerDob && touched.proposerDob ? (
                                                        <span className="errorMsg">{errors.proposerDob}</span>
                                                    ) : null}  
                                                </FormGroup>
                                            </Col>
                                            <Col sm={12} md={6} lg={3}>
                                                <FormGroup>
                                                    <div className="formSection">
                                                        <Field
                                                            name="proposerGender"
                                                            component="select"
                                                            autoComplete="off"                                                                        
                                                            className="formGrp"
                                                        >
                                                        <option value="">Select gender</option>
                                                            <option value="m">Male</option>
                                                            <option value="f">Female</option>
                                                        </Field>     
                                                        {errors.proposerGender && touched.proposerGender ? (
                                                        <span className="errorMsg">{errors.proposerGender}</span>
                                                    ) : null}                   
                                                    </div>
                                                </FormGroup>
                                            </Col>
                                            </Row>   
                                        </div>
                                        </div>
                                         : null
                                        } 
                                        <div className="d-flex justify-content-left carloan m-b-25">
                                            <h4> Tell us more about the Insured Members</h4>
                                        </div>
                                                        
                                        
                                            <FieldArray
                                                name="family_members"
                                                render={arrayHelpers => (
                                                    <div>
                                            {familyMembers && familyMembers.length>0 && familyMembers.map((resource,index)=> 
                                                    <div className="d-flex justify-content-left prsnlinfo">
                                                        <div className="W12">
                                                            {resource.relation_with}
                                                            <Field
                                                                name={`family_members.${index}.family_member_id`}
                                                                type="hidden"
                                                                value={values.family_members[index].family_member_id}
                                                            />
                                                            <Field
                                                                name={`family_members.${index}.looking_for`}
                                                                type="hidden"
                                                                value={values.family_members[index].looking_for}
                                                            />
                                                        </div>
                                                        <Row>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                        name={`family_members.${index}.fname`}
                                                                        type="text"
                                                                        placeholder="First Name"
                                                                        autoComplete="off"
                                                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                        value = {values.family_members[index].fname}
                                                                    />
                                                                     {errors.family_members && errors.family_members[index] && errors.family_members[index].fname ? (
                                                                    <span className="errorMsg">{errors.family_members[index].fname}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <div className="insurerName">
                                                                    <Field
                                                                            name={`family_members.${index}.lname`}
                                                                            type="text"
                                                                            placeholder="Last Name"
                                                                            autoComplete="off"
                                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                            value = {values.family_members[index].lname}                                                                            
                                                                    />
                                                                     {errors.family_members && errors.family_members[index] && errors.family_members[index].lname ? (
                                                                    <span className="errorMsg">{errors.family_members[index].lname}</span>
                                                                    ) : null}
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <DatePicker
                                                                    name={`family_members.${index}.dob`}
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="DOB"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    maxDate={new Date(maxDobAdult)}
                                                                    minDate={new Date(minDobAdult)}
                                                                    className="datePckr"
                                                                    disabled = {true}
                                                                    selected={values.family_members[index].dob ? new Date(values.family_members[index].dob):new Date()}
                                                                    onChange={(val) => {
                                                                        setFieldTouched(`family_members.${index}.dob`);
                                                                        setFieldValue(`family_members.${index}.dob`, val);
                                                                      }}
                                                                      
                                                                    //selected={moment(values.family_members[index].dob).format("dd MMM yyyy")}
                                                                    
                                                                />
                                                                {errors.family_members && errors.family_members[index] && errors.family_members[index].dob ? (
                                                                    <span className="errorMsg">{errors.family_members[index].dob}</span>
                                                                ) : null}  
                                                            </FormGroup>
                                                        </Col>
                                                        <Col sm={12} md={3} lg={3}>
                                                            <FormGroup>
                                                                <div className="formSection">
                                                                    <Field
                                                                        name={`family_members.${index}.gender`}
                                                                        component="select"
                                                                        autoComplete="off"                                                                        
                                                                        className="formGrp"
                                                                        disabled = {true}
                                                                    >
                                                                    <option value="">Select gender</option>
                                                                        <option value="m">Male</option>
                                                                        <option value="f">Female</option>
                                                                    </Field>     
                                                                    {errors.family_members && errors.family_members[index] && errors.family_members[index].gender ? (
                                                                    <span className="errorMsg">{errors.family_members[index].gender}</span>
                                                                ) : null}                   
                                                                </div>
                                                            </FormGroup>
                                                        </Col>
                                                        </Row>   
                                                    </div>
                                                    )}                                                
                                                    </div>
                                                )}/>
                                                </>
                                                <Row className="m-b-25">
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="panNo"
                                                                type="text"
                                                                placeholder="PAN NO"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.panNo.toUpperCase()}
                                                                onChange= {(e)=> 
                                                                setFieldValue('panNo', e.target.value.toUpperCase())
                                                                }
                                                            />
                                                            {errors.panNo && touched.panNo ? (
                                                            <span className="errorMsg">{errors.panNo}</span>
                                                            ) : null}                                        
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                            <Field
                                                                name="phoneNo"
                                                                type="text"
                                                                placeholder="PHONE NO"
                                                                autoComplete="off"
                                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                value={values.phoneNo}
                                                            />
                                                            {errors.phoneNo && touched.phoneNo ? (
                                                            <span className="errorMsg">{errors.phoneNo}</span>
                                                            ) : null}  
                                                        </div>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <div className="insurerName">
                                                        <Field
                                                            name="email"
                                                            type="text"
                                                            placeholder="EMAIL"
                                                            autoComplete="off"
                                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                            value={values.email}
                                                        />
                                                        {errors.email && touched.email ? (
                                                        <span className="errorMsg">{errors.email}</span>
                                                        ) : null}  
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex justify-content-left carloan">
                                                    <h4> Communication Address</h4>
                                                </div>

                                                <Row className="m-b-45">
                                                    <Col sm={12} md={5} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address1"
                                                                    type="text"
                                                                    placeholder="Plot / Flat No."
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address1}
                                                                    onChange= {(e)=> 
                                                                    setFieldValue('address1', e.target.value)
                                                                    }
                                                                    
                                                                />
                                                                {errors.address1 && touched.address1 ? (
                                                                <span className="errorMsg">{errors.address1}</span>
                                                                ) : null}                                                             
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={5} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address2"
                                                                    type="text"
                                                                    placeholder="Building Name / Number"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address2}
                                                                    onChange= {(e)=> 
                                                                    setFieldValue('address2', e.target.value)
                                                                    }
                                                                />
                                                                {errors.address2 && touched.address2 ? (
                                                                <span className="errorMsg">{errors.address2}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={5} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="address3"
                                                                    type="text"
                                                                    placeholder="Street Name"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.address3}
                                                                    onChange= {(e)=> 
                                                                    setFieldValue('address3', e.target.value)
                                                                    }
                                                                />
                                                                {errors.address3 && touched.address3 ? (
                                                                <span className="errorMsg">{errors.address3}</span>
                                                                ) : null}       
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={5} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="pincode"
                                                                    type="number"
                                                                    placeholder="Pincode"
                                                                    autoComplete="off"
                                                                    maxlength = "6"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    onKeyUp={e=> this.fetchAreadetails(e)}
                                                                    value={values.pincode}
                                                                    onInput= {(e)=> {
                                                                        setFieldTouched("state");
                                                                        setFieldTouched("pincode");
                                                                        setFieldValue("pincode", e.target.value);
                                                                        setFieldValue("state", stateName ? stateName[0] : values.state);
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
                                                                    name="area"
                                                                    component="select"
                                                                    autoComplete="off"
                                                                    value={values.area}
                                                                    className="formGrp"
                                                                >
                                                                <option value="">Select Area</option>
                                                                {pinDataArr && pinDataArr.map((resource,rindex)=>
                                                                    <option value={resource.LCLTY_SUBRB_TALUK_TEHSL_NM}>{resource.LCLTY_SUBRB_TALUK_TEHSL_NM}</option>
                                                                )}
                                                                    
                                                                    {/*<option value="area2">Area 2</option>*/}
                                                                </Field>     
                                                                {errors.area && touched.area ? (
                                                                    <span className="errorMsg">{errors.area}</span>
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
                                                                    value={stateName ? stateName[0] : values.state} 
                                                                    disabled = {true}
                                                                    
                                                                />
                                                                {errors.state && touched.state ? (
                                                                <span className="errorMsg">{errors.state}</span>
                                                                ) : null}           
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <div className="d-flex justify-content-left align-items-center m-b-40">
                                                
                                            <div className="proposr m-r-60"><p>Do you have an eIA number? 
                                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" /></a>
                                            </OverlayTrigger></p>
                            
                              
                                                </div>
                                            <div className="d-inline-flex">
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
                                            
                                        
                                        </div>

                                       {showEIA || is_eia_account == 1 ?                         
                                        <div className="d-flex justify-content-left align-items-center m-b-40">
                                                
                                            <div className="proposr m-r-60"><p>EIA Number
                                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">The e-Insurance account or Electronic Insurance Account offers policyholders online space to hold all their insurance policies electronically under one e-insurance account number. This allows the policyholder to access all their policies with a few clicks and no risk of losing the physical insurance policy</Tooltip>}>
                                            <a href="#" className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" /></a>
                                            </OverlayTrigger></p>
                            
                              
                                                </div>
                                            <div className="d-inline-flex">
                                            <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="eia_account_no"
                                                                    type="text"
                                                                    placeholder="EIA NUMBER"
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
                                            </div>
                                            
                                        
                                        </div>:''}
                                        <div className="d-flex justify-content-left resmb">
                                        <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.sumInsured.bind(this, productId )}>
                                            {isSubmitting ? 'Wait..' : 'Back'}
                                        </Button> 
                                        <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                            {isSubmitting ? 'Wait..' : 'Continue'}
                                        </Button> 
                                            
                                        </div>
                                        </Col>                                       
                                            <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">113 Operating Branches and Satellite Presence in 350+ locations </h3>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Address));