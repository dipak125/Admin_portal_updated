import React, { Component, Fragment } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import TwoWheelerBrandTable from '../common/BrandTable';
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import ScrollArea from 'react-scrollbar';
import Encryption from '../../shared/payload-encryption';
import fuel from '../common/FuelTypes';
import { setData } from "../../store/actions/data";
import {  validRegistrationNumber } from "../../shared/validationFunctions";



const initialValues = {
    selectedBrandId: '',
    selectedBrandName: '',
    selectedModelId: '',
    selectedModelName: '',
    selectedVarientId: '',
    regNumber:'',
    check_registration: 2,
    policy_for: "1",
    lapse_duration: ''

};


const vehicleValidation = Yup.object().shape({
    policy_type: Yup.string().required("Please enter policy type"),
    policy_for: Yup.string().required("Please select policy for indivudal or corporate"),
    check_registration: Yup.string().notRequired(),  

    regNumber: Yup.string().when("check_registration", {
        is: "1",       
        then: Yup.string(),
        otherwise: Yup.string().required('Please provide registration number')
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
        )
    }),

    lapse_duration: Yup.string().when("policy_type", {
        is: "3",       
        then: Yup.string().required('Please select lapse duration'),
        otherwise: Yup.string()
    }),
})


class TwoWheelerSelectBrand extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            brandList: [],
            motorInsurance: {},
            selectedBrandId: '',
            selectedBrandName: '',
            selectedModelId: '',
            selectedModelName: '',
            selectedBrandDetails: {},
            brandModelList: [],
            selectedVarientId: '',
            searchitem: [],
            search: "",
            otherBrands: false,
            brandName: '',
            modelName: '',
            fuelType: '',
            vehicleDetails: [],
            error_msg: [],
            length:14,
            fastLaneData: [],
            brandView: '0',
            fastlanelog: [],
            fastlaneLogId: 0
        };
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
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
        // this.callFetchBrands();
        this.fetchData();

    }


    change = (text) => {

        this.state.searchitem = [];
        this.state.brandModelList.map((item, index) => {

            var rgxp = new RegExp(text.toUpperCase(), "g");
            if (item.name.toUpperCase().match(rgxp) && item.name.toUpperCase().match(rgxp) != null) {

                this.state.searchitem.push(item);
            }
        });

        if (this.state.searchitem && this.state.searchitem.length > 0) {
            this.setState({
                searchitem: this.state.searchitem,
                search: text

            });
        }
    }


    getBrands = () => {
        const { productId } = this.props.match.params
        const {vehicleDetails} = this.state
        let brandId = vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""
        return new Promise(resolve => {
            axios.get(`vehicle/brand-with-image/3`)
                .then(res => {
                    let brandList = res && res.data.data.list ? res.data.data.list : []
                    this.setState({
                        brandList,
                        otherBrands: false
                    })
                    this.props.loadingStop();
                    if(localStorage.getItem('newBrandEdit') == '1') {
                        this.setBrandName(brandId)
                    }
                    else if(localStorage.getItem('newBrandEdit') == '2') {
                        this.getOtherBrands()
                    }
                    else if(this.props.data.brandEdit == 1) {
                        this.setState({
                            brandView: '1'
                        })
                    }
                })
                .catch(err => {
                    // handle error
                    // console.log(error);
                    this.props.loadingStop();
                })
        })

    }

    getOtherBrands = () => {
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh/without-image/3`).then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp_otherBrand', decryptResp)

            let selectedBrandDetails = decryptResp && decryptResp.data.list ? decryptResp.data.list : {};
            let brandModelList = decryptResp && decryptResp.data.list ? decryptResp.data.list : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: true,
                searchitem: [],
                modelName: [],
                vehicleDetails: [],
                selectedBrandId: "",
                selectedModelId: [], 
                selectedVarientId: [],
                brandName: "",
                brandView: '1'
                // selectedBrandId: brand_id
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
                // console.log(error);
                this.props.loadingStop();
            })

    }


    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh/details/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp', decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                this.setState({
                    motorInsurance, vehicleDetails
                })
                this.getBrands();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    registration = (productId) => {
        this.props.history.push(`/two_wheeler_Select-brand/${productId}`);
    }
    selectVehicle = (productId) => {
        this.setState({
            brandView: '1'
        })
        // this.props.history.push(`/two_wheeler_Select-brand/${productId}`);
    }
    selectBrand = (productId) => {
        const {selectedBrandId , vehicleDetails, otherBrands} = this.state
        let brandId= selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : "")
        if(localStorage.getItem('brandEdit') == '1') {
            this.setBrandName(brandId)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            this.getOtherBrands()
        }

    }


    setBrandName = (brand_id) => {
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`two-wh/model-with-varient/3/${brand_id}`).then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp',decryptResp)
            let selectedBrandDetails = decryptResp && decryptResp.data.list ? decryptResp.data.list : {};
            let brandModelList = decryptResp && decryptResp.data.list.brand_models ? decryptResp.data.list.brand_models : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: false,
                selectedBrandId: brand_id,
                brandName: selectedBrandDetails.name,
                searchitem: [],
                modelName: "",
                vehicleDetails: [],
                brandView: '1'
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
                // console.log(error);
                this.props.loadingStop();
            })

    }

    setVarient = (varient, model_Id, modelName, fuelType) => {        
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            modelName: modelName,
            fuelType: Math.floor(fuelType)
        })
    }

    setOtherVarient = (varient, model_Id, brand_Id, brandName, modelName, fuelType) => {
        // brandEdit = 1 for model, 2 for other Varient
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            selectedBrandId: brand_Id,
            brandName: brandName,
            modelName: modelName,
            fuelType: Math.floor(fuelType)
        })
    }


    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        const { selectedVarientId, selectedModelId, selectedBrandId, brandView, fastLaneData, fastlanelog } = this.state
        let post_data = {}
        const formData = new FormData();
        let encryption = new Encryption();
        let policyHolder_id = localStorage.getItem('policyHolder_id') ? localStorage.getItem('policyHolder_id') :0
        localStorage.setItem('check_registration', values.check_registration)

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        if(policyHolder_id > 0) {
            if(sessionStorage.getItem('csc_id')) {
                post_data = {
                    'menumaster_id': 3,
                    'brand_id': selectedBrandId ? selectedBrandId : fastLaneData && fastLaneData.brand_id ? fastLaneData.brand_id : values.selectedBrandId ? values.selectedBrandId : "",
                    'brand_model_id': selectedModelId ? selectedModelId : fastLaneData && fastLaneData.brand_model_id ? fastLaneData.brand_model_id : values.selectedModelId ? values.selectedModelId : "",
                    'model_varient_id': selectedVarientId ? selectedVarientId : fastLaneData && fastLaneData.model_varient_id ? fastLaneData.model_varient_id : values.selectedVarientId ? values.selectedVarientId : "",
                    'vehicle_type_id':4,
                    'registration_no':values.regNumber,
                    'policy_type_id':values.policy_type,
                    'policy_holder_id': policyHolder_id,
                    'check_registration': values.check_registration,
                    'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brand/${productId}`,
                }
            }
            else {
                post_data = {
                    'menumaster_id': 3,
                    'brand_id': selectedBrandId ? selectedBrandId : fastLaneData && fastLaneData.brand_id ? fastLaneData.brand_id : values.selectedBrandId ? values.selectedBrandId : "",
                    'brand_model_id': selectedModelId ? selectedModelId : fastLaneData && fastLaneData.brand_model_id ? fastLaneData.brand_model_id : values.selectedModelId ? values.selectedModelId : "",
                    'model_varient_id': selectedVarientId ? selectedVarientId : fastLaneData && fastLaneData.model_varient_id ? fastLaneData.model_varient_id : values.selectedVarientId ? values.selectedVarientId : "",
                    'vehicle_type_id':4,
                    'registration_no':values.regNumber,
                    'policy_type_id':values.policy_type,
                    'policy_holder_id': policyHolder_id,
                    'check_registration': values.check_registration,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brand/${productId}`,
                }
            }
            console.log('post_data-----', post_data)
            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios.post('two-wh/update-registration', formData).then(res => {
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp-----', decryptResp)

                if (decryptResp.error == false) {
                    if(this.state.otherBrands) {
                        localStorage.setItem('brandEdit', 2)
                        localStorage.removeItem('newBrandEdit')
                    }
                    else {
                        localStorage.setItem('brandEdit', 1)
                        localStorage.removeItem('newBrandEdit')
                    }
                    this.props.history.push(`/two_wheeler_Vehicle_details/${productId}`);
                }
                else {
                    swal(decryptResp.msg)
                }
    
            })
                .catch(err => {
                    let decryptErr = JSON.parse(encryption.decrypt(err.data));
                    console.log('decryptResp--err---', decryptErr)
                    // handle error
                    this.setState({error_msg: decryptErr})
                    this.props.loadingStop();
                })
        }
        else {
            if(sessionStorage.getItem('csc_id')) {
                post_data = {
                    'menumaster_id': 3,
                    'brand_id':  brandView == '1' ? selectedBrandId : fastLaneData ? fastLaneData.brand_id : "",
                    'brand_model_id': brandView == '1' ? selectedModelId : fastLaneData ? fastLaneData.brand_model_id : "",
                    'model_varient_id': brandView == '1' ? selectedVarientId : fastLaneData ? fastLaneData.model_varient_id : "",
                    'vehicle_type_id':4,
                    'registration_no':values.regNumber,
                    'policy_type_id':values.policy_type,
                    'check_registration': values.check_registration,
                    'csc_id':sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "",
                    'agent_name':sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "",
                    'product_id':sessionStorage.getItem('product_id') ? sessionStorage.getItem('product_id') : "",
                    'bcmaster_id': "5",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brand/${productId}`,
                }
            }
            else{
                post_data = {
                    'menumaster_id': 3,
                    'brand_id': brandView == '1' ? selectedBrandId : fastLaneData ? fastLaneData.brand_id : "",
                    'brand_model_id': brandView == '1' ? selectedModelId : fastLaneData ? fastLaneData.brand_model_id : "",
                    'model_varient_id': brandView == '1' ? selectedVarientId : fastLaneData ? fastLaneData.model_varient_id : "",
                    'vehicle_type_id':4,
                    'registration_no':values.regNumber,
                    'policy_type_id':values.policy_type,
                    'check_registration': values.check_registration,
                    'bcmaster_id': bc_data ? bc_data.agent_id : "",
                    'bc_token': bc_data ? bc_data.token : "",
                    'lapse_duration': values.lapse_duration,
                    'policy_for': values.policy_for,
                    'bc_agent_id': bc_data ? bc_data.user_info.data.user.username : "",
                    'fastlaneLog_id': this.state.fastlaneLogId ? this.state.fastlaneLogId : fastlanelog && fastlanelog.id ? fastlanelog.id : 0,
                    'page_name': `two_wheeler_Select-brand/${productId}`,
                }
            }
            console.log('post_data-----', post_data)

            formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
            this.props.loadingStart();
            axios.post('two-wh/registration', formData).then(res => {
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp-----', decryptResp)
                if (decryptResp.error == false) {
                    localStorage.setItem('policyHolder_id', decryptResp.data.policyHolder_id);
                    localStorage.setItem('policyHolder_refNo', decryptResp.data.policyHolder_refNo);
                    if(this.state.otherBrands) {
                        localStorage.setItem('brandEdit', 2)
                        localStorage.removeItem('newBrandEdit')
                    }
                    else {
                        localStorage.setItem('brandEdit', 1)
                        localStorage.removeItem('newBrandEdit')
                    }
                    this.props.history.push(`/two_wheeler_Vehicle_details/${productId}`);
                }
                else {
                    swal(decryptResp.msg)
                }
    
            })
                .catch(err => {
                    let decryptErr = JSON.parse(encryption.decrypt(err.data));
                    console.log('decryptResp--err---', decryptErr)
                    // handle error
                    this.setState({error_msg: decryptErr})
                    this.props.loadingStop();
                })
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

    fetchFastlane = (values) => {
        const formData = new FormData();
        formData.append('registration_no', values.regNumber)
        formData.append('menumaster_id', '3')
        this.props.loadingStart();
        axios.post('fastlane', formData).then(res => {

            if(res.data.error == false) {
                this.props.loadingStop();
                this.setState({fastLaneData: res.data.data, brandView: '0', fastlaneLogId: res.data.data.fastlaneLog_id})
            } 
            else {
                this.props.loadingStop();
                this.setState({fastLaneData: [], brandView: '1', vehicleDetails: [], fastlaneLogId: res.data.data.fastlaneLog_id })
            }       
        })
            .catch(err => {
                this.props.loadingStop();
                this.setState({fastLaneData: [], brandView: '1', vehicleDetails: [], fastlaneLogId: 0 })
            })
    }

    regnoFormat = (e, setFieldTouched, setFieldValue) => {
        
        let regno = e.target.value
        this.setState({fastLaneData: [], brandView: '0', vehicleDetails: []})
        let brandEdit = {'brandEdit' : 1}
        this.props.setData(brandEdit)
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
        const { brandList, motorInsurance, selectedBrandDetails, brandModelList, selectedBrandId,fuelType,fastLaneData, brandView,
            selectedModelId, selectedVarientId, otherBrands, vehicleDetails, error_msg, brandName, modelName } = this.state
        const { productId } = this.props.match.params
        const newInitialValues = Object.assign(initialValues, {
            selectedBrandId: selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""),
            selectedModelId:  selectedModelId ? selectedModelId : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel_id ? vehicleDetails.vehiclemodel_id : ""),
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: selectedVarientId ? selectedVarientId : (selectedBrandId ? "" :  vehicleDetails && vehicleDetails.varientmodel_id ? vehicleDetails.varientmodel_id : ""),
            policy_type: motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "",
            regNumber: motorInsurance && motorInsurance.registration_no ? motorInsurance.registration_no : "",
            check_registration: localStorage.getItem('check_registration') ? localStorage.getItem('check_registration') : "2",
            lapse_duration: motorInsurance && motorInsurance.lapse_duration ? motorInsurance.lapse_duration : "",
            policy_for: motorInsurance && motorInsurance.policy_for ? motorInsurance.policy_for : "1",
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

                                <Formik initialValues={newInitialValues} 
                                    onSubmit={ this.handleSubmit} 
                                    validationSchema={vehicleValidation}
                                    >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                     
                                        return (
                                            <Form>
                                                <section className="brand">
                                                    <div className="brand-bg">
                                                    <Row>
                                                    <div className="col-md-9 col-sm-12">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead"> 
                                                            <p>Taking 2-Wheeler policy for</p>
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
                                                                    </div>

                                                                    <div>
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='policy_type'
                                                                                value='3'
                                                                                key='1'
                                                                                checked = {values.policy_type == '3' ? true : false}
                                                                                onChange = {() =>{
                                                                                    setFieldTouched('policy_type')
                                                                                    setFieldValue('policy_type', '3');
                                                                                    this.handleChange(values,setFieldTouched, setFieldValue)
                                                                                }  
                                                                                }
                                                                            />
                                                                            <span className="checkmark" />
                                                                            <span className="fs-14">Lapsed Policy</span>
                                                                        </label>
                                                                        {errors.policy_type && touched.policy_type ? (
                                                                            <span className="errorMsg">{errors.policy_type}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {values.policy_type == '3' ? 
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead"> 
                                                            <p>Please select lapse duration</p>
                                                                <div className="d-inline-flex m-b-15">
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='lapse_duration'
                                                                                value='1'
                                                                                key='1'
                                                                                checked = {values.lapse_duration == '1' ? true : false}
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"> Before 90 days</span>
                                                                        </label>
                                                                    </div>
                                                                    <div className="p-r-25">
                                                                        <label className="customRadio3">
                                                                            <Field
                                                                                type="radio"
                                                                                name='lapse_duration'
                                                                                value='2'
                                                                                key='1'
                                                                                checked = {values.lapse_duration == '2' ? true : false}
                                                                            />
                                                                            <span className="checkmark " /><span className="fs-14"> Over 90 days</span>
                                                                        </label>
                                                                        {errors.lapse_duration && touched.lapse_duration ? (
                                                                            <span className="errorMsg">{errors.lapse_duration}</span>
                                                                        ) : null}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div> : null }

                                                        <div className="brandhead">
                                                        <h4 className="m-b-30">Help us with some information about yourself</h4></div>
                                                        <Row className="m-b-15">
                                                            <Col sm={12}>
                                                            
                                                                <div className="row formSection">
                                                                    <label className="col-md-4">Enter Vehicle Registration Number:</label>
                                                                    <div className="col-md-4">
                                                                    {values.regNumber != "NEW" ? 
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
                             
                                                                        /> : 
                                                                        <Field
                                                                            type="text"
                                                                            name='regNumber' 
                                                                            autoComplete="off"
                                                                            className="premiumslid"   
                                                                            value= {values.regNumber}    
                                                                            disabled = {true}                                                 
                                                                        />
                                                                        }
                                                                        {errors.regNumber && touched.regNumber ? (
                                                                            <span className="errorMsg">{errors.regNumber}</span>
                                                                        ) : null}   
                                                                         {/* {console.log("error_msg.registration_no", error_msg)} */}
                                                                        {error_msg.registration_no ? (
                                                                            <span className="errorMsg">Please provide registration number</span>
                                                                        ) : null}
                                                                    </div>
                                                                    <div >
                                                                    {brandView == '0' && fastLaneData.length == '0' ?
                                                                    <Button  type="button" onClick = {this.fetchFastlane.bind(this,values)} >
                                                                        Fetch Details
                                                                    </Button> : null }
                                                                    </div>
                                                                </div>                                                           
                                                            </Col>
                                                        </Row>
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
                                                                        setFieldValue('regNumber', 'NEW');
                                                                        setFieldTouched('check_registration')
                                                                        setFieldValue('check_registration', e.target.value);
                
                                                                    } else {
                                                                        setFieldValue('check_registration', '2');  
                                                                        setFieldValue('regNumber', '');                                                          
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
                                                                    <span className="errorMsg">{errors.check_registration}</span> : ""
                                                                }
                                                            
                                                        </div> : null }

                                                        {brandView == '1' ?
                                                        <div className="brandhead">
                                                            <h4>Please select your Vehicle brand</h4>
                                                            {error_msg.brand_id || error_msg.brand_model_id || error_msg.model_varient_id ? 
                                                                <span className="errorMsg">Please select brand and varient</span> : ""
                                                            }
                                                        </div> : null }

                                                        
                                                            <Col sm={12} md={12} className="two-wheeler">
                                                            {brandView == '1' ?
                                                                <Fragment>
                                                                    <TwoWheelerBrandTable brandList={brandList && brandList.length > 0 ? brandList : []} selectBrandFunc={this.setBrandName} otherBrandFunc={this.getOtherBrands} />
                                                                </Fragment> : null }

                                                                <div className="d-flex justify-content-left resmb">
                                                                {brandView == '1' || (fastLaneData && fastLaneData.brand_text) ?
                                                                    <Button className={`proceedBtn`} type="submit"  >
                                                                        Continue
                                                                </Button> : null }
                                                                </div>
                                                            </Col>
                                                            </div>

                                                            <div className= "col-md-3 col-sm-12">
                                                            {brandView == '1' ?
                                                            <Fragment>
                                                                <div className="regisBox">
                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                        <div className="txtRegistr resmb-15">Registration No.<br />
                                                                            {motorInsurance && motorInsurance.registration_no}</div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr resmb-15">Two-wheeler Brand
                                                                            - <strong>{brandName ? brandName : (vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : "")}</strong>
                                                                        </div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicle.bind(this, productId)}>Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">Two-wheeler Model<br />
                                                                            <strong>{modelName ? modelName : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "")}</strong></div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">Fuel Type<br />
                                                                        <strong>{fuel[fuelType] ? fuel[fuelType] : (vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)] : null)} </strong></div>

                                                                    </div>
                                                                </div>
                                                            </Fragment> : 
                                                            <Fragment>
                                                            <div className="regisBox">
                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                    <div className="txtRegistr resmb-15">Registration No.<br />
                                                                        {motorInsurance && motorInsurance.registration_no}</div>

                                                                    <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>Edit</button></div>
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                    <div className="txtRegistr resmb-15">Two-wheeler Brand
                                                                        -  <strong>{fastLaneData && fastLaneData.brand_text ? fastLaneData.brand_text  : vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong>
                                                                    </div>

                                                                    <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicle.bind(this, productId)}>Edit</button></div>
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                    <div className="txtRegistr">Two-wheeler Model<br />
                                                                    <strong>{fastLaneData && fastLaneData.model_text ? fastLaneData.model_text+" "+fastLaneData.varient_text : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "" }</strong></div>

                                                                    <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>Edit</button></div>
                                                                </div>

                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                    <div className="txtRegistr">Fuel Type<br />
                                                                    <strong>{fastLaneData && fastLaneData.fuel ? fastLaneData.fuel : vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)] : null } </strong></div>

                                                                </div>
                                                            </div>
                                                        </Fragment> }
                                                        </div>
                                                       
                                                    </Row>
                                                    </div>
                                                </section>

                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </div>

                        </div>
                    </div>
                </BaseComponent>

                <Modal className="customModal brandModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead">
                        <div className="cntrbody">
                            <h3>Select Model </h3>
                            {selectedBrandDetails.image ?
                                <img src={`${process.env.REACT_APP_PAYMENT_URL}/core/public/image/car_brand_image/` + selectedBrandDetails.image} alt={selectedBrandDetails.name} /> : null
                            }
                        </div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="modalForm">
                            <FormGroup>
                                <div className="main">
                                    <input
                                        name="search"
                                        type="search"
                                        className="srchimg"
                                        placeholder="Search your variant "
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                        onChange={e => this.change(e.target.value)}
                                    />
                                </div>
                            </FormGroup>
                            {otherBrands == false ? 
                            <ScrollArea
                                speed={0.8}
                                className="area"
                                contentClassName="content"
                                horizontal={false}
                            >
                                {this.state.searchitem && this.state.searchitem.length > 0 ?

                                    (
                                        this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                            brand.varientmodel && brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                                <div key= {varientIndex} className="brdrbottom">
                                                    <label className="d-flex justify-content-between">
                                                        <div className="modalboxInfo">{brand.name}
                                                            <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                        </div>       
                                                            <div className="customCheckBox formGrp formGrp">
                                                                <input type="radio"
                                                                    name="varient"
                                                                    className="user-self"
                                                                    id="varient"
                                                                    value={varient.id}
                                                                    aria-invalid="false"
                                                                    onClick={(e) =>
                                                                        this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                            varient.fuel_type)
                                                                    }
                                                                />
                                                                <span className="checkmark mL-0"></span>
                                                                <span className="error-message"></span>
                                                            </div>         
                                                    </label>
                                                </div>
                                            )))
                                        ))
                                    : 
                                    (brandModelList && brandModelList.length > 0 && brandModelList.map((brand, brandIndex) => (
                                        brand.varientmodel && brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                            
                                            <div key= {varientIndex} className="brdrbottom">
                                                <label className="d-flex justify-content-between">
                                                    <div className="modalboxInfo">{brand.name}
                                                        <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                    </div>
                                                        <div className="customCheckBox formGrp formGrp">
                                                            <input type="radio"
                                                                name="varient"
                                                                className="user-self"
                                                                id="varient"
                                                                value={varient.id}
                                                                aria-invalid="false"
                                                                onClick={(e) =>
                                                                    this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                    varient.fuel_type)
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>
                                                </label>
                                            </div>
                                        ))
                                    ))
                                    )
                                }

                            </ScrollArea> : 
                            <ScrollArea
                            speed={0.8}
                            className="area"
                            contentClassName="content"
                            horizontal={false}
                        >
                            {this.state.searchitem && this.state.searchitem.length > 0 ?

                                (
                                    this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                        brand.brand_models && brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                            model.varientmodel && model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (
                                            <div key= {varientIndex} className="brdrbottom">
                                                <label className="d-flex justify-content-between">
                                                    <div className="modalboxInfo">{brand.name}
                                                        <span className="grey ml-5">{model.name+" "+varient.varient+ " "+varient.cc+"cc" }</span>
                                                    </div>
                                                        <div className="customCheckBox formGrp formGrp">
                                                            <input type="radio"
                                                                name="varient"
                                                                className="user-self"
                                                                id="varient"
                                                                value={varient.id}
                                                                aria-invalid="false"
                                                                onClick={(e) =>
                                                                    this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                        brand.name, model.name+" "+varient.varient, varient.fuel_type )
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>
                                                </label>
                                            </div>
                                        )))
                                    ))))
                                :
                                (this.state.brandModelList && this.state.brandModelList.length > 0 && this.state.brandModelList.map((brand, brandIndex) => (
                                    brand.brand_models && brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                        model.varientmodel && model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (

                                        <div key= {varientIndex} className="brdrbottom">
                                            <label className="d-flex justify-content-between">
                                                <div className="modalboxInfo">{brand.name}
                                                    <span className="grey ml-5">{model.name+" "+varient.varient+ " "+varient.cc+"cc"}</span>
                                                </div>
                                                    <div className="customCheckBox formGrp formGrp">
                                                        <input type="radio"
                                                            name="varient"
                                                            className="user-self"
                                                            id="varient"
                                                            value={varient.id}
                                                            aria-invalid="false"
                                                            onClick={(e) =>
                                                                this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                    brand.name, model.name+" "+varient.varient, varient.fuel_type )
                                                            }
                                                        />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </div>
                                            </label>
                                        </div>
                                    ))))
                                ))
                                )}

                        </ScrollArea>}
                        </div>
                        {selectedVarientId ?
                            <button className="proceedBtn" href={'#'}
                                onClick={(e) =>
                                    this.handleClose()
                                }
                            >
                                Continue</button> : null}
                    </Modal.Body>
                </Modal>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TwoWheelerSelectBrand));