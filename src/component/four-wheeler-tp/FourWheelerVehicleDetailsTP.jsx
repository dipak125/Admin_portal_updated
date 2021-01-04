import React, { Component, Fragment } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import ReactTooltip from "react-tooltip";
import * as Yup from 'yup';
import { Formik, Field, Form, FieldArray } from "formik";
import axios from "../../shared/axios"
import moment from "moment";
import Encryption from '../../shared/payload-encryption';
import {  PersonAge } from "../../shared/dateFunctions";
import Autosuggest from 'react-autosuggest';
import { addDays } from 'date-fns';
import swal from 'sweetalert';
import { setData } from "../../store/actions/data";

const ageObj = new PersonAge();
let encryption = new Encryption();
const maxRegnDate = moment(moment().subtract(1, 'years').calendar()).add(1, 'day').calendar();
// const minRegnDate = moment(moment().subtract(20, 'years').calendar()).add(1, 'day').calendar();
const minRegnDate = moment().subtract(20, 'years').calendar();


const initialValue = {
    registration_date: "",
    location_id:"",
    previous_is_claim:'2',
    previous_city:"",
    insurance_company_id:"0",
    previous_policy_name:"",
    previous_end_date: "",
    previous_start_date: "",
    previous_claim_bonus: "",
}
const vehicleRegistrationValidation = Yup.object().shape({
    registration_date: Yup.string().required('Registration date is required'), 

    location_id: Yup.string()
    .required(function() {
        return "Registration city is required"
    })
    .matches(/^([0-9]*)$/, function() {
        return "No special Character allowed"
    }),
   
});

const fuel = {
    1: 'Petrol',
    2: 'Diesel'
}


class TwoWheelerVehicleDetails extends Component {

    state = {
        insurerList: [],
        showClaim: false,
        previous_is_claim: "",
        motorInsurance:{},
        previousPolicy: {},
        CustomerID: '',  
        suggestions: [],
        customerDetails: [],
        selectedCustomerRecords: [],
        CustIdkeyword: "",
        RTO_location: "",
        step_completed: "0",
        location_reset_flag: 0,
        request_data: [],
        changeFlag: 0
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }
    onChange = (e, setFieldValue) => {
        setFieldValue('location_id', "")
      };

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    selectVehicleBrand = (productId) => {
        if(localStorage.getItem('brandEdit') == '1') {
            localStorage.setItem('newBrandEdit', 1)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            localStorage.setItem('newBrandEdit', '2')
        }
        this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`);
    }

    selectBrand = (productId) => {
        this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`);
    }

    editBrand = (productId) => {
        let brandEdit = {'brandEdit' : 1}
            this.props.setData(brandEdit)
            this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`);     
    }

    showClaimText = (value) =>{
        if(value == 1){
            this.setState({
                showClaim:false,
                previous_is_claim:2
            })
        }
        else{
            this.setState({
                showClaim:true,
                previous_is_claim:0
            })
        }
    }

      // ----------------AddressId------------
    onSuggestionsClearRequested = () => {
    this.setState({
        suggestions: []   
    });
    };

    escapeRegexCharacters(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    

    onChangeCustomerID = (event, { newValue, method }) => {
        //const input = newValue;
           // if (/^[a-zA-Z]+$/.test(input) || input === "") {
            let location_reset_flag = this.state.motorInsurance && this.state.motorInsurance.location_id ? 1 : 0
                this.setState({
                    CustomerID: newValue,
                    RTO_location: "",
                    location_reset_flag,
                    changeFlag: 1
                    });
            //}
        
    };
  
   getCustomerIDSuggestions(value) {
    const escapedValue = this.escapeRegexCharacters(value.trim());   
    if (escapedValue === '') {
      return [];
    }  
    const regex = new RegExp( escapedValue, 'i');
    if(this.state.customerDetails && escapedValue.length >1) {
      return this.state.customerDetails.filter(language => regex.test(language.RTO_LOCATION));
    }
    else return 0;
    
  }

  SuggestionSelected = (setFieldTouched,setFieldValue,suggestion) => {
      this.setState({
        changeFlag: 0, 
      });
    setFieldTouched('location_id')
    setFieldValue("location_id", suggestion.id)
  }
  
  onSuggestionsFetchCustomerID = ({ value }) => {
    this.setState({
      suggestions: this.getCustomerIDSuggestions(value)
    });
  };

   getCustomerIDSuggestionValue = (suggestion) => {
    this.setState({
      selectedCustomerRecords: suggestion, changeFlag: 0, 
    });
    return suggestion.RTO_LOCATION+" - "+suggestion.NameCode;
  }
  
   renderCustomerIDSuggestion(suggestion) {
    return (
      <span>{suggestion.RTO_LOCATION+" - "+suggestion.NameCode}</span>
    );
  }
  //--------------------------------------------------------

    handleSubmit = (values, actions) => {
        const {productId} = this.props.match.params 
        const {motorInsurance, request_data, changeFlag} = this.state
        let policy_type = ageObj.whatIsCurrentMonth(values.registration_date) < 7 ? 6 : 1
        let newPolStartDate = addDays(new Date(), 1)           
        let newPolEndDate = addDays(new Date(newPolStartDate), 364) 
        let vehicleAge = Math.floor(moment().diff(values.registration_date, 'months', true))

        if(changeFlag == 1) {
        swal("Registration city is required")
        return false
        }

        const formData = new FormData(); 
        let post_data = {}

            post_data = {
                'policy_holder_id':request_data.policyholder_id,
                'menumaster_id':1,
                'registration_date':moment(values.registration_date).format("YYYY-MM-DD"),
                'location_id':values.location_id,
                'previous_is_claim':values.previous_is_claim,
                'previous_claim_bonus': values.previous_claim_bonus == "" ? "2" : values.previous_claim_bonus,      
                'prev_policy_flag': 0,
                'vehicleAge': vehicleAge,
                'pol_start_date': moment(newPolStartDate).format('YYYY-MM-DD'),
                'pol_end_date': moment(newPolEndDate).format('YYYY-MM-DD'),
                'policy_type':  policy_type,
                'insurance_company_id': values.insurance_company_id,
                'page_name': `four_wheeler_Vehicle_detailsTP/${productId}`,
            }

        console.log('post_data', post_data)
        formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios
        .post(`/four-wh-tp/vehicle-details`, formData)
        .then(res => { 
            this.props.loadingStop();
            let decryptResp = JSON.parse(encryption.decrypt(res.data));
            console.log('decryptResp-----', decryptResp)
            if(decryptResp.error == false){
                this.props.history.push(`/four_wheeler_OtherComprehensiveTP/${productId}`);
            }
            else{
                actions.setSubmitting(false)
                swal(decryptResp.msg)
            }
            
        })
        .catch(err => {
          this.props.loadingStop();
          actions.setSubmitting(false)
          let decryptResp = JSON.parse(encryption.decrypt(err.data));
            console.log('decryptResp-----', decryptResp)
        });
    }

    getInsurerList = () => {
        this.props.loadingStart();
        axios
          .get(`/company`)
          .then(res => {
            this.setState({
                insurerList: res.data.data
            });
            this.getAllAddress()
          })
          .catch(err => {
            this.setState({
                insurerList: []
            });
            this.props.loadingStop();
          });
    }

    getAllAddress() {
        axios.get(`location-list/${localStorage.getItem("policyHolder_id")}`)
          .then(res => {
            this.setState({
              customerDetails: res.data.data
            });
            this.props.loadingStop();
          })
          .catch(err => {
            this.props.loadingStop();
          });
      }

    fetchData = () => {
        const { productId } = this.props.match.params
        this.props.loadingStart();
        axios.get(`four-wh-tp/details/${localStorage.getItem("policyHolder_refNo")}`)
            .then(res => {
                 let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log('decryptResp_fetchData', decryptResp)
                 let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {};
                 let previousPolicy = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.previouspolicy : {};
                 let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                 let RTO_location = motorInsurance && motorInsurance.location && motorInsurance.location.RTO_LOCATION ? motorInsurance.location.RTO_LOCATION : ""
                 let step_completed = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.step_no : "";
                 let request_data = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.request_data : {};
                this.setState({
                    motorInsurance, previousPolicy, vehicleDetails,RTO_location,step_completed, request_data
                })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    handleChange =(value) => {
        let endDate = moment(value).add(1, 'years').format("YYYY-MM-DD")
        this.setState({
            EndDate: endDate,
            endDateFlag: true,
            serverResponse: [],
            error: []
        }) 
    }

    componentDidMount() {
        this.getInsurerList();
        this.fetchData();
        
    }


    render() {
        const {productId} = this.props.match.params  
        const { motorInsurance, CustomerID,suggestions, vehicleDetails, RTO_location, step_completed, location_reset_flag} = this.state

        let newInitialValues = Object.assign(initialValue, {
            registration_date: motorInsurance && motorInsurance.registration_date ? new Date(motorInsurance.registration_date) : "",
            location_id:  motorInsurance && motorInsurance.location_id && location_reset_flag == 0 ? motorInsurance.location_id : "",
            policy_type_Id : motorInsurance && motorInsurance.policytype_id ? motorInsurance.policytype_id : "0"
        });

        const inputCustomerID = {
            placeholder: "Search City",
            value: CustomerID ? CustomerID : RTO_location,
            onChange: this.onChangeCustomerID
          };
          

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
                { step_completed >= '1' && vehicleDetails.vehicletype_id == '6' ?
                <section className="brand m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead">
                            <h4 className="fs-18 m-b-30">Please share your vehicle details.</h4>
                        </div>
                    </div>
                    <div className="brand-bg">
                        <Formik initialValues={newInitialValues} onSubmit={this.handleSubmit} 
                        validationSchema={vehicleRegistrationValidation}
                        >
                            {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                                <Row>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                First Purchase/Registration Date
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                   
                                                    <Col sm={12} md={11} lg={4}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="registration_date"
                                                                minDate={new Date(minRegnDate)}
                                                                maxDate={new Date(maxRegnDate)}
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Registration Date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.registration_date}
                                                                onChange={(val) => {
                                                                    setFieldTouched('registration_date');
                                                                    setFieldValue('registration_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.registration_date && touched.registration_date ? (
                                                                <span className="errorMsg">{errors.registration_date}</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                Registration City
                                                         </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Autosuggest 
                                                                suggestions={suggestions}
                                                                onSuggestionsFetchRequested={this.onSuggestionsFetchCustomerID}
                                                                onSuggestionsClearRequested={this.onSuggestionsClearRequested}
                                                                getSuggestionValue={this.getCustomerIDSuggestionValue }
                                                                shouldRenderSuggestions={this.customerIDRender}
                                                                renderSuggestion={this.renderCustomerIDSuggestion}
                                                                inputProps={inputCustomerID} 
                                                                onChange={e=>this.onChange(e,setFieldValue)}
                                                                onSuggestionSelected={(e, {suggestion,suggestionValue}) => {
                                                                    this.SuggestionSelected(setFieldTouched,setFieldValue,suggestion)
                                                                    }}
                                                                />
                                                                {errors.location_id && touched.location_id ? (
                                                                    <span className="errorMsg">{errors.location_id}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                                
                                                <div className="d-flex justify-content-left resmb">
                                                <Button className={`backBtn`} type="button"  disabled={isSubmitting ? true : false} onClick= {this.selectBrand.bind(this,productId)}>
                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                </Button> 
                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                    {isSubmitting ? 'Wait..' : 'Next'}
                                                </Button> 
                                                </div>

                                            </Col>

                                            <Col sm={12} md={3}>
                                                <div className="vehbox">
                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                       
                                                            <div className="txtRegistr">Registration No.<br />
                                                            {motorInsurance && motorInsurance.registration_no}</div>
                                                            <div>
                                                            <button className="rgistrBtn" type="button" onClick={this.selectBrand.bind(this, productId)}>Edit</button>
                                                            </div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">Car Brand<br/>
                                                            <strong>{vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : ""}</strong></div>
                                                        <div><button className="rgistrBtn" type="button" onClick= {this.editBrand.bind(this,productId)}>Edit</button></div>
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                         <div className="txtRegistr">Car Model<br/>
                                                            <strong>{vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : ""}</strong></div>
                                                        <div><button className="rgistrBtn" type="button" onClick= {this.selectVehicleBrand.bind(this,productId)}>Edit</button></div>          
                                                    </div>

                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                        <div className="txtRegistr">Fuel Type<br/>
                                                            <strong>{vehicleDetails && vehicleDetails.varientmodel && fuel[Math.floor(vehicleDetails.varientmodel.fuel_type)]} </strong></div>
                                                    </div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                );
                            }}
                        </Formik>
                    </div>
                </section> : step_completed == "" ? "Forbidden" : null
            }

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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(TwoWheelerVehicleDetails));