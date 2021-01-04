import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import BackContinueButton from '../common/button/BackContinueButton';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"
import 'react-datepicker/dist/react-datepicker-cssmodules.min.css'
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios"
import Encryption from '../../shared/payload-encryption';
import * as Yup from "yup";
import swal from 'sweetalert';
import moment from "moment";
import {  validRegistrationNumber } from "../../shared/validationFunctions";


const ComprehensiveValidation = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')

    registration_no: Yup.string().when("newRegistrationNo", {
        is: "NEW",       
        then: Yup.string(),
        otherwise: Yup.string()
            .test(
                "last4digitcheck",
                function() {
                    return "Invalid Registration number"
                },
                function (value) {
                    if (value && (value != "" || value != undefined)) {             
                        return validRegistrationNumber(value);
                    }   
                    return true;
                }
            ),
    }),

    puc: Yup.string().required("Please verify pollution certificate to proceed"),

    chasis_no_last_part:Yup.string().required('This field is required')
    .matches(/^([0-9]*)$/, function() {
        return "Invalid number"
    })
    .min(5, function() {
        return "Chasis no. should be last 5 digit"
    })
    .max(5, function() {
        return "Chasis no. should be last 5 digit"
    }),

    engine_no:Yup.string().required('Engine no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid engine number"
    })
    .min(5, function() {
        return "Engine no. should be minimum 5 characters"
    })
    .max(17, function() {
        return "Engine no. should be maximum 17 characters"
    }),

    chasis_no:Yup.string().required('Chasis no is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Invalid chasis number"
    })
    .min(5, function() {
        return "Chasis no. should be minimum 5 characters"
    })
    .max(17, function() {
        return "Chasis no. should be maximum 17 characters"
    }),

    // cng_kit:Yup.string().required("Please select an option"),
    // // IDV:Yup.number().required('Declared value is required'),
    
    // cngKit_Cost: Yup.string().when(['cng_kit'], {
    //     is: cng_kit => cng_kit == '1',       
    //     then: Yup.string().required('Please provide CNG kit cost'),
    //     othewise: Yup.string()
    // }).matches(/^([0-9]*)$/, function() {
    //     return "Invalid number"
    // }),
   
    vahanVerify:Yup.boolean().notRequired('Please verify chasis number')
    .test(
        "vahanVerifyChecking",
        function() {
            return "Please verify chasis number"
        },
        function (value) {
            if (value == false && this.parent.chasis_no_last_part && this.parent.chasis_no_last_part.length == 5) {  
                return false;
            }
            return true;
        }
    ),

    PA_Cover: Yup.string().when(['PA_flag'], {
        is: PA_flag => PA_flag == '1',
        then: Yup.string().required('Please provide PA coverage'),
        otherwise: Yup.string()
    })
   
});


const Coverage = {
        "C101064":"Own Damage",
        "C101065":"Legal Liability to Third Party",
        "C101066":"PA Cover",
        "C101069":"Basic Road Side Assistance",
        "C101072":"Depreciation Reimbursement",
        "C101067":"Return to Invoice",
        "C101108":"Engine Guard",
        "C101111":"Cover for consumables",
        "B00002": "Own Damage Basic",
        "B00008": "Third Party Bodily Injury",
        "B00013": "Legal Liability to Paid Drivers",
        "B00015": "PA -  Owner Driver",
        "B00016": "PA for Unnamed Passenger",
        "B00009": "Third Party Property Damage Limit",
        "NCB": "NCB Discount",
        "TOTALOD": "Total Own Damage"
}

class OtherComprehensive extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            showCNG: false,
            is_CNG_account: '',
            accessToken: '',
            serverResponse: [],
            fulQuoteResp: [],
            PolicyArray: [],
            show: false,
            sliderVal: '',
            motorInsurance: [],
            add_more_coverage: ['B00015'],
            vahanDetails: [],
            vahanVerify: false,
            policyCoverage: [],
            regno:'',
            length:14,
            moreCoverage: [],
            engine_no: "",
            chasis_no: "",
            chasiNo:'',
            engineNo:'',
            selectFlag: '',
            initialValue: {
                registration_no: "",
                chasis_no: "",
                chasis_no_last_part: "",
                add_more_coverage: "",
                cng_kit: 0,
                // cngKit_Cost: 0,
                engine_no: "",
                vahanVerify: false,
                newRegistrationNo: "",
                puc: '1',
            },
            request_data: []
        };
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    handleChange = () => {
        this.setState({serverResponse: [], error: [] });
    }

    showCNGText = (value) =>{
        if(value == 1){
            this.setState({
                showCNG:true,
                is_CNG_account:1,
                serverResponse: [],
                error: []
            })
        }
        else{
            this.setState({
                showCNG:false,
                is_CNG_account:0,
                serverResponse: [],
                error: []
            })
        }
    }

    sliderValue = (value) => {
        this.setState({
            sliderVal: value,
            serverResponse: [],
            error: []
        })
    }

    vehicleDetails = (productId) => {      
        this.props.history.push(`/VehicleDetails/${productId}`);
    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data))
                console.log("decrypt--fetchData-- ", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                let values = []
                let add_more_coverage = motorInsurance && motorInsurance.add_more_coverage != null ? motorInsurance.add_more_coverage.split(",") : ['B00015']
                add_more_coverage = add_more_coverage.flat()
                values.PA_flag = motorInsurance && motorInsurance.pa_cover != "" ? '1' : '0'
                values.PA_Cover = motorInsurance && motorInsurance.pa_cover != "" ? motorInsurance.pa_cover : '0'

                this.setState({
                    motorInsurance, add_more_coverage,request_data,
                    showCNG: motorInsurance.cng_kit == 1 ? true : false,
                    vahanVerify: motorInsurance.chasis_no && motorInsurance.engine_no ? true : false,
                    selectFlag: motorInsurance && motorInsurance.add_more_coverage != null ? '0' : '1'
                })
                this.props.loadingStop();
                this.getAccessToken(values)
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    getAccessToken = (values) => {
        this.props.loadingStart();
        axios
          .post(`/callTokenService`)
          .then((res) => {
            this.setState({
              accessToken: res.data.access_token,
            });
            this.fullQuote(res.data.access_token, values)
          })
          .catch((err) => {
            this.setState({
              accessToken: '',
            });
            this.props.loadingStop();
          });
      };

    getMoreCoverage = () => {
        this.props.loadingStart();
        axios
          .get(`/coverage-list/${localStorage.getItem('policyHolder_id')}`)
          .then((res) => {
            this.setState({
            moreCoverage: res.data.data,
            });
            this.fetchData()
          })
          .catch((err) => {
            this.setState({
                moreCoverage: [],
            });
            this.props.loadingStop();
          });
      };

    getVahanDetails = async(values, setFieldTouched, setFieldValue, errors) => {

        const formData = new FormData();
        if(values.newRegistrationNo == "NEW") {
            formData.append("regnNo", values.newRegistrationNo);
            setFieldTouched('registration_no');
            setFieldValue('registration_no', values.newRegistrationNo);
        }
        else {
            formData.append("regnNo", values.registration_no);
        }

        formData.append("chasiNo", values.chasis_no_last_part);
        formData.append("policy_holder_id", this.state.request_data.policyholder_id);
        
        if(errors.registration_no || errors.chasis_no_last_part) {
            swal("Please provide correct Registration number and Chasis number")
        }
        else {
            if(values.newRegistrationNo != "NEW") {
                this.props.loadingStart()
                await axios
                .post(`/getVahanDetails`,formData)
                .then((res) => {
                    this.setState({
                    vahanDetails: res.data,
                    vahanVerify:  true 
                });
                if(this.state.vahanDetails.data[0].chasiNo){
                    this.setState({chasiNo: this.state.vahanDetails.data[0].chasiNo})
                }

                if(this.state.vahanDetails.data[0].engineNo){
                    this.setState({engineNo: this.state.vahanDetails.data[0].engineNo})
                }

                setFieldTouched('vahanVerify')
                setFieldValue('vahanVerify', true)
                setFieldTouched('engine_no')
                setFieldValue('engine_no', this.state.engineNo)
                setFieldTouched('chasis_no')
                setFieldValue('chasis_no', this.state.chasiNo)

                this.props.loadingStop();
                })
                .catch((err) => {
                    this.setState({
                        vahanDetails: [],
                        vahanVerify:  true
                    });
                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true) 
                    // swal("Please provide correct Registration number and Chasis number")
                    this.props.loadingStop();
                });
            }
            else {
                this.props.loadingStart()
                    this.setState({
                    vahanDetails: [],
                    vahanVerify:  true 
                    });
    
                    setFieldTouched('vahanVerify')
                    setFieldValue('vahanVerify', true) 
    
                    this.props.loadingStop();
            }

        }
    };



    fullQuote = (access_token, values) => {
        const { PolicyArray, sliderVal, add_more_coverage, motorInsurance } = this.state
        // let cng_kit_flag = 0;
        // let cngKit_Cost = 0;
        // if(values.toString()) {            
        //     cng_kit_flag = values.cng_kit
        //     cngKit_Cost = values.cngKit_Cost
        // }
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        const formData = new FormData();

        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let csc_user_type = "";

        if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));           
            csc_user_type = csc_data.type
        }

        const post_data = {
            'ref_no':localStorage.getItem('policyHolder_refNo'),
            'access_token':access_token,
            'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
            'policy_type': motorInsurance.policy_type,
            'add_more_coverage': add_more_coverage.toString(),
            'PA_Cover': values.PA_flag ? values.PA_Cover : "0",
            // 'cng_kit': cng_kit_flag,
            // 'cngKit_Cost': cngKit_Cost
        }
        console.log('fullQuote_post_data', post_data)

        if(post_data.idv_value > 5000000 && csc_user_type == "POSP" ) {
            swal("Quote cannot proceed with IDV greater than 5000000")
            this.props.loadingStop();
            return false
        }

        let encryption = new Encryption();
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        axios.post('fullQuotePMCAR',formData)
            .then(res => {
                if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Success") {
                    this.setState({
                      fulQuoteResp: res.data.PolicyObject,
                      PolicyArray: res.data.PolicyObject.PolicyLobList,
                      error: [],
                      serverResponse: res.data.PolicyObject,
                      policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });
                  } 
                else if (res.data.PolicyObject && res.data.UnderwritingResult && res.data.UnderwritingResult.Status == "Fail") {
                    this.setState({
                        fulQuoteResp: res.data.PolicyObject,
                        error: {"message": 1},
                        serverResponse: [],
                        policyCoverage: res.data.PolicyObject.PolicyLobList ? res.data.PolicyObject.PolicyLobList[0].PolicyRiskList[0].PolicyCoverageList : [],
                    });
                }
                else {
                    this.setState({
                      fulQuoteResp: [],add_more_coverage,
                      error: res.data,
                      serverResponse: []
                    });
                  }
                this.props.loadingStop();
            })
            .catch(err => {
                this.setState({
                    serverResponse: [],
                });
                this.props.loadingStop();
            })
    }


    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { motorInsurance, PolicyArray, sliderVal, add_more_coverage } = this.state
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0

        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let csc_user_type = "";

        if(csc_data && sessionStorage.getItem('csc_id')) {
            let encryption = new Encryption();
            csc_data = JSON.parse(csc_data)        
            csc_data = csc_data.user
            csc_data = JSON.parse(encryption.decrypt(csc_data));           
            csc_user_type = csc_data.type
        }

        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        if(add_more_coverage.length > 0){
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no': motorInsurance.registration_no ? motorInsurance.registration_no : values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'add_more_coverage': add_more_coverage,
                'puc': values.puc,
                'pa_cover': values.PA_flag ? values.PA_Cover : "0",
                'pa_flag' : values.PA_cover_flag,
                'page_name': `OtherComprehensive/${productId}`
            }
        }
        else {
            post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'registration_no':motorInsurance.registration_no ? motorInsurance.registration_no : values.registration_no,
                'chasis_no': values.chasis_no,
                'chasis_no_last_part': values.chasis_no_last_part,
                'cng_kit': values.cng_kit,
                // 'cngkit_cost': values.cngKit_Cost,
                'engine_no': values.engine_no,
                'idv_value': sliderVal ? sliderVal : defaultSliderValue.toString(),
                'puc': values.puc,
                'page_name': `OtherComprehensive/${productId}`
            }
        }
        console.log('post_data',post_data)
        if(post_data.idv_value > 5000000 && csc_user_type == "POSP" ) {
            swal("Quote cannot proceed with IDV greater than 5000000")
            this.props.loadingStop();
            return false
        }

        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('update-insured-value', formData).then(res => {
            this.props.loadingStop();
            if (res.data.error == false) {
                this.props.history.push(`/Additional_details/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    onRowSelect = (values, isSelect, setFieldTouched, setFieldValue) => {

        const { add_more_coverage } = this.state;
        var drv = [];


        if (isSelect) {
            add_more_coverage.push(values);
            this.setState({
                add_more_coverage: add_more_coverage,
                serverResponse: [],
                error: []
            });
            if(values == "B00016") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '1');
            }  
            if(values == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '1');
            }            
        }
        else {
            const index = add_more_coverage.indexOf(values);
            if (index !== -1) {
                add_more_coverage.splice(index, 1);
                this.setState({
                    serverResponse: [],
                    error: []
                });
            }

            if(values == "B00016") {
                setFieldTouched("PA_flag");
                setFieldValue("PA_flag", '0');
                setFieldTouched("PA_Cover");
                setFieldValue("PA_Cover", '');
            } 
            if(values == "B00015") {
                setFieldTouched("PA_cover_flag");
                setFieldValue("PA_cover_flag", '0');
            }       
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


    componentDidMount() {
        this.getMoreCoverage()
    }


    render() {
        const {showCNG, vahanDetails,error, policyCoverage, vahanVerify, selectFlag, fulQuoteResp, PolicyArray, 
            moreCoverage, sliderVal, motorInsurance, serverResponse, engine_no, chasis_no, initialValue} = this.state
        const {productId} = this.props.match.params 
        let defaultSliderValue = PolicyArray.length > 0 ? Math.round(PolicyArray[0].PolicyRiskList[0].IDV_Suggested) : 0
        let sliderValue = sliderVal
        let minIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MinIDV_Suggested) : null
        let maxIDV = PolicyArray.length > 0 ? Math.floor(PolicyArray[0].PolicyRiskList[0].MaxIDV_Suggested) : null
        minIDV = minIDV + 1;
        maxIDV = maxIDV - 1;

        let covList = motorInsurance && motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage.split(",") : ""
        let newInnitialArray = {}
        let PA_flag = motorInsurance && (motorInsurance.pa_cover == null || motorInsurance.pa_cover == "") ? '0' : '1'
        let PA_Cover = motorInsurance &&  motorInsurance.pa_cover != null ? motorInsurance.pa_cover : ''
        let newInitialValues = {}

        if(selectFlag == '1') {
             newInitialValues = Object.assign(initialValue, {
                registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                vahanVerify: vahanVerify,
                newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : "",
                B00015: "B00015",
                PA_Cover: "",
                PA_cover_flag: "1",
                PA_flag: '0',

            });
        }
        else {
                 newInitialValues = Object.assign(initialValue, {
                    registration_no: motorInsurance.registration_no ? motorInsurance.registration_no : "",
                    chasis_no: motorInsurance.chasis_no ? motorInsurance.chasis_no : (chasis_no ? chasis_no : ""),
                    chasis_no_last_part: motorInsurance.chasis_no_last_part ? motorInsurance.chasis_no_last_part : "",
                    add_more_coverage: motorInsurance.add_more_coverage ? motorInsurance.add_more_coverage : "",
                    engine_no: motorInsurance.engine_no ? motorInsurance.engine_no : (engine_no ? engine_no : ""),
                    vahanVerify: vahanVerify,
                    newRegistrationNo: localStorage.getItem('registration_number') == "NEW" ? localStorage.getItem('registration_number') : "", 
                    PA_flag: '0',
                    PA_Cover: "",
                    PA_cover_flag: motorInsurance && motorInsurance.pa_flag ? motorInsurance.pa_flag : '0'
                });
        }

       

        for (var i = 0 ; i < covList.length; i++) {
            newInnitialArray[covList[i]] = covList[i];
        }    
        newInnitialArray.PA_flag = PA_flag   
        newInnitialArray.PA_Cover = PA_Cover
        newInitialValues = Object.assign(initialValue, newInnitialArray );


        let OD_TP_premium = serverResponse.PolicyLobList ? serverResponse.PolicyLobList[0].PolicyRiskList[0] : []

        const policyCoverageList = policyCoverage && policyCoverage.length > 0 ?
        policyCoverage.map((coverage, qIndex) => {
            // let coverSpan = Math.floor(moment(coverage.ExpiryDate).diff(coverage.EffectiveDate, 'years', true)) + 1;
            return(
                <div>
                    {coverage.ProductElementCode == "C101066" ? 
                    coverage.PolicyBenefitList.map((coverage1, qIndex) => {
                        return(
                                <Row>
                                    <Col sm={12} md={6}>
                                    <FormGroup>{Coverage[coverage1.ProductElementCode]}</FormGroup>
                                    </Col>
                                    <Col sm={12} md={6}>
                                    <FormGroup>₹ {Math.round(coverage1.BeforeVatPremium)}  </FormGroup>                      
                                    </Col>
                                </Row>)}) :
                    <Row>
                        <Col sm={12} md={6}>
                        <FormGroup>{Coverage[coverage.ProductElementCode]}</FormGroup>
                        </Col>
                        <Col sm={12} md={6}>
                        <FormGroup>₹ {Math.round(coverage.BeforeVatPremium)}  </FormGroup>                      
                        </Col>
                    </Row>}
                </div>
            )
        }) : null

        const premiumBreakup = policyCoverage && policyCoverage.length > 0 ?
            policyCoverage.map((coverage, qIndex) => {
                return(
                    <Fragment>
                        {coverage.ProductElementCode == "C101066" ? 
                            coverage.PolicyBenefitList.map((coverage1, qIndex) => {
                                return(
                                        <tr>
                                            <td>{Coverage[coverage1.ProductElementCode]}</td>
                                            <td>₹ {Math.round(coverage1.BeforeVatPremium)}  </td>                      

                                        </tr>)}) :
                            <tr>
                                <td>{Coverage[coverage.ProductElementCode]}:</td>
                                <td>₹ {Math.round(coverage.BeforeVatPremium)}</td>
                            </tr>}
                    </Fragment>
                )   
            }) : null
        

        const errMsg =
            error && error.message ? (
                <span className="errorMsg">
                <h6>
                    <strong>
                    Thank you for showing your interest for buying product.Due to some
                    reasons, we are not able to issue the policy online.Please call
                    1800 22 1111
                    </strong>
                </h6>
                </span>
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
                <section className="brand colpd m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead m-b-10">
                            <h4 className="m-b-30">Covers your Car + Damage to Others (Comprehensive)</h4>
                            <h5>{errMsg}</h5>
                        </div>
                    </div>
                    <Formik initialValues={newInitialValues} 
                    onSubmit={ serverResponse && serverResponse != "" ? (serverResponse.message ? this.getAccessToken : this.handleSubmit ) : this.getAccessToken} 
                    validationSchema={ComprehensiveValidation}>
                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                    return (
                        <Form>
                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="rghtsideTrigr W-90 m-b-30">
                                    <Collapsible trigger="Default Covered Coverages & Benefit" >
                                        <div className="listrghtsideTrigr">
                                            {policyCoverageList}
                                        </div>
                                    </Collapsible>
                                </div>

                            <Row>
                            <Col sm={12} md={6} lg={4}>
                            <Row>
                            <Col sm={12} md={5} lg={6}>
                                <FormGroup>
                                    <div className="insurerName">
                                    Registration No:
                                    </div>
                                </FormGroup>
                            </Col>
                                
                                <Col sm={12} md={5} lg={6}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        {values.newRegistrationNo != "NEW" ?
                                            <Field
                                                name="registration_no"
                                                type="text"
                                                placeholder=""
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value= {values.registration_no}   
                                                maxLength={this.state.length}
                                                disabled = {true}
                                                onInput={e=>{
                                                    this.regnoFormat(e, setFieldTouched, setFieldValue)
                                                }}        
    
                                            /> : 
                                            <Field
                                                    type="text"
                                                    name='registration_no' 
                                                    autoComplete="off"
                                                    className="premiumslid"   
                                                    value= {values.newRegistrationNo}    
                                                    disabled = {true}                                                 
                                                />}

                                            {errors.registration_no ? (
                                                <span className="errorMsg">{errors.registration_no}</span>
                                            ) : null}
                                        </div>
                                    </FormGroup>
                                </Col>
                                </Row>
                                </Col>

                                <Col sm={12} md={6} lg={5}>
                                    <Row>
                                        <Col sm={12} md={5} lg={6}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                Please Enter Last 5 digits of Chassis no.
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    
                                        <Col sm={12} md={5} lg={6}>
                                            <FormGroup>
                                                <div className="insurerName">
                                                        <Field
                                                            type="text"
                                                            name='chasis_no_last_part' 
                                                            autoComplete="off"
                                                            className="premiumslid"       
                                                            value= {values.chasis_no_last_part}
                                                            maxLength="5"       
                                                            onChange = {(e) => {
                                                                setFieldValue('vahanVerify', false)

                                                                setFieldTouched('chasis_no_last_part')
                                                                setFieldValue('chasis_no_last_part', e.target.value)                       
                                                            }}                           
                                                            
                                                        />
                                                        {errors.chasis_no_last_part && touched.chasis_no_last_part ? (
                                                        <span className="errorMsg">{errors.chasis_no_last_part}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col>
                                    </Row>
                                    </Col>

                                    <Col sm={12} md={2} lg={2}>
                                        <FormGroup>
                                        
                                            <Button className="btn btn-primary vrifyBtn" onClick= {!errors.chasis_no_last_part ? this.getVahanDetails.bind(this,values, setFieldTouched, setFieldValue, errors) : null}>Verify</Button>
                                            {errors.vahanVerify ? (
                                                    <span className="errorMsg">{errors.vahanVerify}</span>
                                                ) : null}
                                        </FormGroup>
                                    </Col>
                            </Row>
                            {values.vahanVerify && !errors.chasis_no_last_part ?
                            <Row>
                                <Col sm={12} md={6} lg={5}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <Field
                                                name="engine_no"
                                                type="text"
                                                placeholder="Engine Number"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value= {values.engine_no.toUpperCase()}
                                                maxLength="17"
                                                onChange = {(e) => {
                                                    setFieldTouched('engine_no')
                                                    setFieldValue('engine_no', e.target.value)                       
                                                }}  
                                            />
                                            {errors.engine_no && touched.engine_no ? (
                                                <span className="errorMsg">{errors.engine_no}</span>
                                            ) : null}
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={6} lg={5}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <Field
                                                name="chasis_no"
                                                type="text"
                                                placeholder="Chasis Number"
                                                autoComplete="off"
                                                onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                value= {values.chasis_no.toUpperCase()}
                                                maxLength="17"
                                                onChange = {(e) => {
                                                    setFieldTouched('chasis_no')
                                                    setFieldValue('chasis_no', e.target.value)                       
                                                }} 
                                            />
                                            {errors.chasis_no && touched.chasis_no ? (
                                                <span className="errorMsg">{errors.chasis_no}</span>
                                            ) : null}
                                        </div>
                                    </FormGroup>
                                </Col>
                            </Row>
                            : null}

                            <Row>
                                <Col sm={12} md={4} lg={4}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <span className="fs-16">Insured Declared Value</span>
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={3} lg={2}>
                                    <FormGroup>
                                        <div className="insurerName">
                                        <Field
                                            name="IDV"
                                            type="text"
                                            placeholder=""
                                            autoComplete="off"
                                            className="premiumslid"
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            value={sliderValue ? sliderValue : defaultSliderValue}  
                                        />
                                        {errors.IDV && touched.IDV ? (
                                            <span className="errorMsg">{errors.IDV}</span>
                                        ) : null}
                                        </div>
                                    </FormGroup>
                                </Col>
                                {defaultSliderValue ? 

                                <Col sm={12} md={12} lg={6}>
                                    <FormGroup>
                                    <input type="range" className="W-90" 
                                    name= 'slider'
                                    defaultValue= {defaultSliderValue}
                                    min= {minIDV}
                                    max= {maxIDV}
                                    step= '1'
                                    value={values.slider}
                                    onChange= {(e) =>{
                                    setFieldTouched("slider");
                                    setFieldValue("slider",values.slider);
                                    this.sliderValue(e.target.value)
                                }}
                                    />
                                        {/* <img src={require('../../assets/images/slide.svg')} alt="" className="W-90" /> */}
                                    </FormGroup>
                                </Col>
                                : null}
                            </Row>

                                                            

                            {/* <Row>
                                <Col sm={12} md={5} lg={5}>
                                    <FormGroup>
                                        <div className="insurerName">
                                            <span className="fs-16"> Have you fitted external CNG Kit</span>
                                        </div>
                                    </FormGroup>
                                </Col>
                                <Col sm={12} md={3} lg={3}>
                                    <FormGroup>
                                        <div className="d-inline-flex m-b-35">
                                            <div className="p-r-25">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name='cng_kit'                                            
                                                    value='1'
                                                    key='1'  
                                                    onChange={(e) => {
                                                        setFieldValue(`cng_kit`, e.target.value);
                                                        this.showCNGText(1);
                                                    }}
                                                    checked={values.cng_kit == '1' ? true : false}
                                                />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                <Field
                                                    type="radio"
                                                    name='cng_kit'                                            
                                                    value='0'
                                                    key='1'  
                                                    onChange={(e) => {
                                                        setFieldValue(`cng_kit`, e.target.value);
                                                        this.showCNGText(0);
                                                    }}
                                                    checked={values.cng_kit == '0' ? true : false}
                                                />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>      
                                                </label>
                                                {errors.cng_kit && touched.cng_kit ? (
                                                <span className="errorMsg">{errors.cng_kit}</span>
                                                ) : null}
                                            </div>
                                        </div>
                                    </FormGroup>
                                </Col>
                                {showCNG || is_CNG_account == 1 ?
                                <Col sm={12} md={12} lg={4}>
                                    <FormGroup>
                                    <div className="insurerName">   
                                        <Field
                                            name="cngKit_Cost"
                                            type="text"
                                            placeholder="Cost of Kit"
                                            autoComplete="off"
                                            className="W-80"
                                            value = {values.cngKit_Cost}
                                            onFocus={e => this.changePlaceHoldClassAdd(e)}
                                            onBlur={e => this.changePlaceHoldClassRemove(e)}
                                            onChange={e => {
                                                setFieldTouched('cngKit_Cost');
                                                setFieldValue('cngKit_Cost', e.target.value);
                                                this.handleChange()

                                            }}
                                        />
                                        {errors.cngKit_Cost && touched.cngKit_Cost ? (
                                        <span className="errorMsg">{errors.cngKit_Cost}</span>
                                        ) : null}                                             
                                        </div>
                                    </FormGroup>
                                </Col> : ''}
                            </Row>
                                */}

                            <Row>
                                <Col sm={12} md={12} lg={12}>
                                    <FormGroup>
                                        <span className="fs-18"> Add  more coverage to your plan.</span>
                                    </FormGroup>
                                </Col>
                            </Row>
  

                                {moreCoverage && moreCoverage.length > 0 ? moreCoverage.map((coverage, qIndex) => (
                                <Row key={qIndex}>   
                                    <Col sm={12} md={11} lg={6} key={qIndex+"a"} >
                                        <label className="customCheckBox formGrp formGrp">{coverage.name}
                                            <OverlayTrigger overlay={<Tooltip id="tooltip-disabled">{coverage.description}</Tooltip>}>
                                                <a className="infoIcon"><img src={require('../../assets/images/i.svg')} alt="" className="premtool" /></a>
                                            </OverlayTrigger>
                                            <Field
                                                type="checkbox"
                                                // name={`moreCov_${qIndex}`}
                                                name={coverage.code}
                                                value={coverage.code}
                                                className="user-self"
                                                // checked={values.roadsideAssistance ? true : false}
                                                onClick={(e) =>{
                                                    if( e.target.checked == false && values[coverage.code] == 'B00015') {
                                                        swal("This cover is mandated by IRDAI, it is compulsory for Owner-Driver to possess a PA cover of minimum Rs 15 Lacs, except in certain conditions. By not choosing this cover, you confirm that you hold an existing PA cover or you do not possess a valid driving license.")
                                                    }
                                                    this.onRowSelect(e.target.value, e.target.checked, setFieldTouched, setFieldValue)         
                                                }
                                                }
                                                checked = {values[coverage.code] == coverage.code ? true : false}
                                            />
                                            <span className="checkmark mL-0"></span>
                                            <span className="error-message"></span>
                                        </label>
                                    </Col>
                                    {values.PA_flag == '1' && values[coverage.code] == 'B00016' ?
                                        <Col sm={12} md={11} lg={3} key={qIndex+"b"}>
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name='PA_Cover'
                                                        component="select"
                                                        autoComplete="off"
                                                        className="formGrp inputfs12"
                                                        value = {values.PA_Cover}
                                                        onChange={(e) => {
                                                            setFieldTouched('PA_Cover')
                                                            setFieldValue('PA_Cover', e.target.value);
                                                            this.handleChange()
                                                        }}
                                                    >
                                                        <option value="">Select Sum Insured</option>
                                                        <option value="50000">50000</option>
                                                        <option value="100000">100000</option>  
                                            
                                                    </Field>
                                                    {errors.PA_Cover ? (
                                                        <span className="errorMsg">{errors.PA_Cover}</span>
                                                    ) : null}
                                                </div>
                                            </FormGroup>
                                        </Col> : null
                                    }
                                </Row>
                                )) : null}
                                
                                <Row>
                                    <Col sm={12}>
                                        <FormGroup>
                                            <div className="carloan">
                                                <h4> </h4>
                                            </div>
                                            <div className="col-md-15">
                                                <div className="brandhead"> 
                                                    I/we hold a valid and effective PUC and/or fitness certificate, as applicable, for the vehicle mentioned herein and undertake to renew the same during the policy period
                                                    <div className="carloan">
                                                        <h4> </h4>
                                                    </div>
                                                        <div className="d-inline-flex m-b-15">
                                                            <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='puc'
                                                                        value='1'
                                                                        key='1'
                                                                        checked = {values.puc == '1' ? true : false}
                                                                        onChange = {() =>{
                                                                            setFieldTouched('puc')
                                                                            setFieldValue('puc', '1');
                                                                        }  
                                                                        }
                                                                    />
                                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                                </label>
                                                            </div>
                                                            <div className="p-r-25">
                                                                <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='puc'
                                                                        value='2'
                                                                        key='1'
                                                                        checked = {values.puc == '2' ? true : false}
                                                                        onChange = {() =>{
                                                                            setFieldTouched('puc')
                                                                            setFieldValue('puc', '2');
                                                                        }  
                                                                        }
                                                                    />
                                                                    <span className="checkmark " /><span className="fs-14"> No</span>
                                                                </label>
                                                                {errors.puc && touched.puc ? (
                                                                    <span className="errorMsg">{errors.puc}</span>
                                                                ) : null}
                                                            </div>
                                                        </div>
                                                </div>
                                            </div> 
                                            
                                        </FormGroup>
                                    </Col>
                                </Row>
                                
                                <div className="d-flex justify-content-left resmb">
                                    <Button className={`backBtn`} type="button"  onClick= {this.vehicleDetails.bind(this,productId)}>
                                        Back
                                    </Button> 

                                        { serverResponse && serverResponse != "" ? (serverResponse.message ? 
                                        <Button className={`proceedBtn`} type="submit"  >
                                            Recalculate
                                        </Button> : (values.puc == '1' ?  <Button className={`proceedBtn`} type="submit"  >
                                            Continue
                                        </Button>  : null)) : <Button className={`proceedBtn`} type="submit"  >
                                            Recalculate
                                        </Button>}

                                    </div>
                                </Col>

                                <Col sm={12} md={3}>
                                    <div className="justify-content-left regisBox">
                                        <h3 className="premamnt"> Total Premium Amount</h3>
                                        <div className="rupee"> ₹ {fulQuoteResp.DuePremium}</div>
                                        <div className="text-center">
                                            <Button className={`brkbtn`} type="button" onClick= {this.handleShow}>
                                            Breakup
                                            </Button> 
                                            </div>
                                    </div>
                                </Col>
                        </Row>
                        </Form>
                        );
                        }}
                        </Formik>
                </section>
                <Footer />
                </div>
                </div>
                </div>
                </BaseComponent>
                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead modalhd">
                        <div className="cntrbody">
                            <h3>Premium breakup </h3>                           
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                    <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>Premium:</th>
                                    <th>₹ {fulQuoteResp.DuePremium}</th>
                                </tr>
                            </thead>
                            <tbody>
                            {premiumBreakup}
                                <tr>
                                    <td>Gross Premium:</td>
                                    <td>₹ {Math.round(fulQuoteResp.BeforeVatPremium)}</td>
                                </tr>
                                <tr>
                                    <td>GST:</td>
                                    <td>₹ {Math.round(fulQuoteResp.TGST)}</td>
                                </tr>
                            </tbody>
                        </table>
                    
                    </Modal.Body>
                </Modal>

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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(OtherComprehensive));