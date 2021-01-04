import React, { Component } from "react";
import { Row, Col, Modal, Button, FormGroup } from "react-bootstrap";
import BaseComponent from "../BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import axios from "../../shared/axios";
import { withRouter } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import * as Yup from "yup";
import swal from "sweetalert";
import Encryption from "../../shared/payload-encryption";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import { changeFormat, get18YearsBeforeDate, PersonAge } from "../../shared/dateFunctions";
import moment from "moment";

const initialValues = {
  regNumber: "",
  check_registration: 2,
  pinDataArr: [],
  titleList: [],
  first_name: "",
  last_name: "",
  salutation_id: "",
  date_of_birth: "",
  email_id: "",
  building_name : "",
  city: "",
  plot_no: "",
  street_name: "",
  pincode: "",
  pincode_id: "",
  nominee_dob: null,
  nominee_first_name: "",
  nominee_last_name: "",
  nominee_salutation_id: "",
  date_of_birth: "",
  relation_with: "", 
  appointee_name: "",
  appointee_dob: "",
  appointee_relation_with: "",
  // is_appointee: 0
};
const minDobNominee = moment(moment().subtract(111, 'years').calendar()).add(1, 'day').calendar()
const maxDobNominee = moment().subtract(3, 'months').calendar();
const minDobAppointee = moment(moment().subtract(111, 'years').calendar()).add(1, 'day').calendar()
const maxDobAppointee = moment().subtract(3, 'months').calendar();
// VALIDATION :-----------------------
const IPA__Validation = Yup.object().shape({
  // salutation_id: Yup.string().required("Title is required").nullable(),
  // first_name: Yup.string()
  //   .required("First Name is required")
  //   .min(3, function () {
  //     return "First name must be 3 characters";
  //   })
  //   .max(40, function () {
  //     return "Full name must be maximum 40 characters";
  //   })
  //   .matches(/^[A-Za-z]+$/, function () {
  //     return "Please enter valid first name";
  //   })
  //   .nullable(),
  // last_name: Yup.string()
  //   .required("Last Name is required")
  //   .min(1, function () {
  //     return "Last name must be 1 characters";
  //   })
  //   .max(40, function () {
  //     return "Full name must be maximum 40 characters";
  //   })
  //   .matches(/^[A-Za-z]+$/, function () {
  //     return "Please enter valid last name";
  //   })
  //   .nullable(),
  // // last_name: Yup.string().required('Name is required').nullable(),
  // date_of_birth: Yup.date().required("Please enter date of birth").nullable(),
  
email_id: Yup.string().email().min(8, function() {
    return "Email must be minimum 8 characters"
})
.max(75, function() {
    return "Email must be maximum 75 characters"
}).matches(/^[a-zA-Z0-9]+([._\-]?[a-zA-Z0-9]+)*@\w+([-]?\w+)*(\.\w{2,3})+$/,'Invalid Email Id').nullable(),
// mobile: Yup.string()
// .matches(/^[6-9][0-9]{9}$/,'Invalid Mobile number').required('Mobile No. is required').nullable(),
  // pan_no: Yup.string()
  // .matches(/^[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/,'Invalid PAN number') .nullable(),
  // gstn_no: Yup.string()
  // .matches(/^[0-9]{2}[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}$/,'Invalid GSTIN').nullable(),
  //11AAACC7777A7A7
  building_name: Yup.string()
    .required("Please enter Building name")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid building name";
    })
    .nullable(),
  // block_no: Yup.string().required("Please enter Plot number").nullable(),
  plot_no: Yup.string()
    .required("Please enter Plot number")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid plot number";
    })
    .nullable(),
  city: Yup.string()
    .required("Please enter City")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid City";
    })
    .nullable(),
  street_name: Yup.string()
    .required("Please enter City")
    .matches(/^[a-zA-Z0-9][a-zA-Z0-9-/.,-\s]*$/, function () {
      return "Please enter valid street name";
    })
    .nullable(),
  pincode: Yup.string()
    .required("Pincode is required")
    .matches(/^[0-9]{6}$/, function () {
      return "Please enter valid 6 digit pin code";
    })
    .nullable(),
  pincode_id: Yup.string().required("Please select Area").nullable(),
  // NOMINEE--------
  nominee_salutation_id: Yup.string().required("Title is required").nullable(),
  nominee_first_name: Yup.string()
    .required("First Name is required")
    .min(3, function () {
      return "First name must be 3 characters";
    })
    .max(40, function () {
      return "Full name must be maximum 40 characters";
    })
    .matches(/^[A-Za-z]+$/, function () {
      return "Please enter valid first name";
    })
    .nullable(),
  nominee_last_name: Yup.string()
    .required("Last Name is required")
    .min(1, function () {
      return "Last name must be 1 characters";
    })
    .max(40, function () {
      return "Full name must be maximum 40 characters";
    })
    .matches(/^[A-Za-z]+$/, function () {
      return "Please enter valid last name";
    })
    .nullable(),
  nominee_dob: Yup.date().required("Please enter date of birth").nullable(),
  relation_with: Yup.string().required(function () {
    return "Please select relation";
  }),
  //  appointee_dob: Yup.date().required(function() {
  //       return "Date should not be future date"
  //       }).test(
  //           "18YearsChecking",
  //           function() {
  //               return "Appointee age should be more than 18 years"
  //           },
  //           function (value) {
  //               const ageObj = new PersonAge();
  //               if (value) {
  //                   const age_Obj = new PersonAge();
  //                   return age_Obj.whatIsMyAge(value) >= 18;
  //               }
  //               return true;
  //           }
  //       ).test(
  //           "18YearsChecking",
  //           function() {
  //               return "Please enter Appointee date of birth"
  //           },
  //           function (value) {
  //               const ageObj = new PersonAge();
  //               if (ageObj.whatIsMyAge(this.parent.dob) < 18) {   
  //                   return ageObj.whatIsMyAge(value) >= 18;    
  //               }
  //               return true;
  //           }
  //       ),
  // appointee_name:Yup.string(function() {
  //   return "Please enter appointee name"
  //   }).notRequired(function() {
  //   return "Please enter appointee name"
  //     })        
  //     .matches(/^[a-zA-Z]+([\s]?[a-zA-Z]+)$/, function() {
  //         return "Please enter valid name"
  //     }).test(
  //     "18YearsChecking",
  //     function() {
  //         return "Please enter appointee name"
  //     },
  //     function (value) {
  //         const ageObj = new PersonAge();
  //         if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {   
  //             return false;    
  //         }
  //         return true;
  //     }
  //     ).min(3, function() {
  //     return "Name must be minimum 3 chracters"
  //     })
  //     .max(40, function() {
  //     return "Name must be maximum 40 chracters"
  //     }),
  //     appointee_relation_with: Yup.string().notRequired(function() {
  //     return "Please select relation"
  //     }).test(
  //     "18YearsChecking",
  //     function() {
  //         return "Please enter Appointee relation"
  //     },
  //     function (value) {
  //         const ageObj = new PersonAge();
  //         if (ageObj.whatIsMyAge(this.parent.dob) < 18 && !value) {   
  //             return false;    
  //         }
  //         return true;
  //     }
  //     )
});

class AccidentAdditionalDetails extends Component {
  state = {
    appointeeFlag: false,
    is_appointee:0,
    request_data: [],
  };

  changePlaceHoldClassAdd(e) {
    let element = e.target.parentElement;
    element.classList.add("active");
  }

  changePlaceHoldClassRemove(e) {
    let element = e.target.parentElement;
    e.target.value.length === 0 && element.classList.remove("active");
  }

  componentDidMount() {
    // this.fetchSubVehicle();
    this.fetchSalutation();
    this.fetchData();
  }

  fetchData = () => {
    const { productId } = this.props.match.params;
    let policyHolder_refNo = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
    let encryption = new Encryption();
    axios
      .get(`ipa/details/${policyHolder_refNo}`)
      .then((res) => {
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        // console.log("decrypt---accidentDetails--->>", decryptResp);
        let accidentDetails = decryptResp.data && decryptResp.data.policyHolder ? decryptResp.data.policyHolder : null;
        console.log("---accidentDetails--->>", accidentDetails);
        let address = accidentDetails && accidentDetails.address ? JSON.parse(accidentDetails.address) : {};
        let pincodeRESP = accidentDetails && accidentDetails.pincode_response ? JSON.parse(accidentDetails.pincode_response) : {};
        this.setState({
          accidentDetails,
          address,
          pincodeRESP,
        });
        let pincodeArea = pincodeRESP && pincodeRESP.PIN_CD ?  pincodeRESP.PIN_CD : ""
        console.log('pincodeArea------>>',pincodeArea)
         this.fetchAreadetailsBack(pincodeArea)
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  handleSubmit = (values, actions, ageValue) => {
    const {productId} = this.props.match.params 
    const {accidentDetails} = this.state
    console.log('values------->>>',values)
    const formData = new FormData(); 
    let encryption = new Encryption();
    let date_of_birth = moment(values.nominee_dob).format('yyyy-MM-DD');
    let date_of_birth_appointee = moment(values.appointee_dob).format('yyyy-MM-DD') ? moment(values.appointee_dob).format('yyyy-MM-DD') : null;
    this.props.loadingStart();
    let post_data = {
        'policy_holder_id': accidentDetails.id,
        'menumaster_id':'9',
        'page_name': `AccidentAdditionalDetails/${productId}`,
        'first_name': values.first_name,
        'last_name': values.last_name,
        'salutation_id': values.salutation_id,
        'date_of_birth': date_of_birth,
        'email_id': values.email_id,
        'house_building_name': values.building_name,
        'city':values.city,
        'plot_no': values.plot_no,
        'street': values.street_name,
        'pincode': values.pincode,
        'pincode_id': values.pincode_id,
        'nominee_first_name': values.nominee_first_name,
        'nominee_last_name': values.nominee_last_name,
        'nominee_title_id' : values.nominee_salutation_id,
        'nominee_dob' : date_of_birth,
        'relation_with' : values.relation_with, 
        'appointee_name':values.appointee_name,
        'appointee_dob':date_of_birth_appointee,
        'appointee_relation_with':values.appointee_relation_with,
    }
    console.log('post_data', post_data);
    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
    axios
    .post(`ipa/proposer-info`, formData)
    .then(res => { 
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log('decryptResp-----', decryptResp)
        if (decryptResp.error == false) {
        this.props.history.push(`/AccidentAdditionalPremium/${productId}`);
        } else {
          actions.setSubmitting(false)
        }
        this.props.loadingStop();
    })
    .catch(err => { 
      this.props.loadingStop();
      actions.setSubmitting(false)
      let decryptErr = JSON.parse(encryption.decrypt(err.data));
      console.log('decryptErr-----', decryptErr)
      actions.setSubmitting(false)
    });

}

  fetchAreadetails = (e) => {
    let pinCode = e.target.value;

    if (pinCode.length == 6) {
      const formData = new FormData();
      this.props.loadingStart();
      // let encryption = new Encryption();
      const post_data_obj = {
        pincode: pinCode,
      };
      //    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
      formData.append("pincode", pinCode);
      axios
        .post("pincode-details", formData)
        .then((res) => {
          if (res.data.error === false) {
            let stateName =
              res.data.data &&
              res.data.data[0] &&
              res.data.data[0].pinstate.STATE_NM
                ? res.data.data[0].pinstate.STATE_NM
                : "";
            this.setState({
              pinDataArr: res.data.data,
              stateName,
            });
            this.props.loadingStop();
          } else {
            this.props.loadingStop();
            swal("Plese enter a valid pincode");
          }
        })
        .catch((err) => {
          this.props.loadingStop();
        });
    }
  };

  fetchAreadetailsBack = (pincode_input) => {
    let pinCode = pincode_input.toString();

    console.log("fetchAreadetailsBack pinCode", pinCode.length);

    if (pinCode != null && pinCode != "" && pinCode.length == 6) {
      console.log("fetchAreadetailsBack pinCode", pinCode);
      const formData = new FormData();
      this.props.loadingStart();
      // let encryption = new Encryption();
      const post_data_obj = {
        pincode: pinCode,
      };
      // formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data_obj)))
      formData.append("pincode", pinCode);
      axios
        .post("pincode-details", formData)
        .then((res) => {
          let stateName =
            res.data.data &&
            res.data.data[0] &&
            res.data.data[0].pinstate.STATE_NM
              ? res.data.data[0].pinstate.STATE_NM
              : "";
          this.setState({
            pinDataArr: res.data.data,
            stateName,
          });
          this.props.loadingStop();
        })
        .catch((err) => {
          this.props.loadingStop();
        });
    }
  };

  fetchSalutation=()=>{
    const formData = new FormData();
    let encryption = new Encryption();
    this.props.loadingStart();
    formData.append('policy_for_flag', 1)
    axios.get('ipa/titles')
    .then(res=>{
      let decryptResp = JSON.parse(encryption.decrypt(res.data))
      console.log("decrypt", decryptResp)
        let titleList = decryptResp.data
        console.log('titlelist----->>',titleList)                       
        this.setState({
            titleList
        });
        this.props.loadingStop();
    }).
    catch(err=>{
        this.props.loadingStop();
        this.setState({
            titleList: []
        });
    })  
}

  AddDetails = (productId) => {
    this.props.history.push(`/AccidentAddDetails/${productId}`);
  };

  ageCheck = (value) => {
      const ageObj = new PersonAge();
      let age = ageObj.whatIsMyAge(value)
      console.log("ageCheck---->>",age)
      if(age < 18){
          this.setState({
              appointeeFlag: true,
              is_appointee:1,
          })
      }
      else {
          this.setState({
              appointeeFlag: false,
              is_appointee:0
          })
      } 
      // console.log('is_appointee------->>',this.is_appointee)
  }
  ageCheckValue = (value) => {
      const ageObj = new PersonAge();
      let ageValue = ageObj.whatIsMyAge(value)
          this.setState({
              ageValue
          })
          // console.log("ageCheckValue---->>",ageValue)
  }


  render() {
    const { pinDataArr, titleList, appointeeFlag, is_appointee, accidentDetails, ageValue, address, pincodeRESP } = this.state;
    console.log('address--------->>',address)
    const age_Value = ageValue ? ageValue : ""
    console.log("ageCheckValue--->>state---->>",age_Value)
    const { productId } = this.props.match.params;
    const newInitialValues = Object.assign(initialValues, {      
      salutation_id: accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo.ipatitle.id : "",
      first_name: accidentDetails ? accidentDetails.first_name : "",
      last_name: accidentDetails ? accidentDetails.last_name : "",
      date_of_birth: accidentDetails && accidentDetails.dob ? new Date(accidentDetails.dob) : "",
      mobile: accidentDetails ? accidentDetails.mobile : "",
      email_id: accidentDetails ? accidentDetails.email_id : "",
      proposer_gender: accidentDetails ? accidentDetails.gender : "",  
      building_name: address && address.house_building_name ? address.house_building_name : "",
      city: address && address.city ? address.city : "",
      plot_no: address && address.plot_no ? address.plot_no : "",
      street_name: address && address.street_name ? address.street_name : "",
      pincode: accidentDetails ? accidentDetails.pincode : "",
      pincode_id: pincodeRESP && pincodeRESP.id ? pincodeRESP.id  : "",
      nominee_salutation_id : (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].title_id : "",
      nominee_first_name: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].first_name : "" ,
      nominee_last_name: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].last_name : "" ,
      nominee_dob : (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? new Date(accidentDetails.request_data.nominee[0].dob) : null,
      relation_with : (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].relation_with : "",        
      // is_appointee: ,
      appointee_name: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].appointee_name : "",
      appointee_dob: accidentDetails && accidentDetails.request_data ? new Date(accidentDetails.request_data.nominee[0].appointee_dob) : "",
      appointee_relation_with: (accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].appointee_relation_with : "",
      nominee_age: this.state.ageValue ? this.state.ageValue : ""
    });

    return (
      <>
        <BaseComponent>
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                <SideNav />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">
                  SBI General Insurance Company Limited
                </h4>
                <section className="brand">
                  <div className="boxpd">
                    <h4 className="m-b-30">
                      {" "}
                      {/* Select the Sum Insured for individual personal accident */}
                    </h4>
                    <Formik
                      initialValues={newInitialValues}
                      onSubmit={this.handleSubmit}
                      validationSchema={IPA__Validation}
                    >
                      {({values,errors,setFieldValue,setFieldTouched,isValid,isSubmitting,touched}) => {
                        // console.log('values',values)

                        return (
                          <Form>
                            <h4 className="text mt-3 mb-3">
                              Communication Details
                            </h4>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4 className="fs-18 m-b-30">
                                  Contact details of proposer
                                </h4>
                              </div>
                            </div>

                            <Row>
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="salutation_id"
                                      component="select"
                                      autoComplete="off"
                                      disabled={true}
                                      className="formGrp"
                                    >
                                      <option value="">Title</option>
                                      {titleList && titleList.length > 0 && titleList.map((title, qIndex) => ( 
                                        <option key={qIndex} value={title.id}>{title.description}</option>
                                      ))}
                                    </Field>
                                    {errors.salutation_id && touched.salutation_id ? (
                                  <span className="errorMsg">{errors.salutation_id}</span>
                                  ) : null}               
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={12} md={4} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="first_name"
                                      type="text"
                                      placeholder="First Name"
                                      disabled={true}
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.first_name}
                                    />
                                    {errors.first_name && touched.first_name ? (
                                      <span className="errorMsg">
                                        {errors.first_name}
                                      </span>
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
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.last_name}
                                    />
                                    {errors.last_name && touched.last_name ? (
                                      <span className="errorMsg">
                                        {errors.last_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <DatePicker
                                    name="date_of_birth"
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="DOB"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    disabled={true}
                                    dropdownMode="select"
                                    // maxDate={new Date(maxDobAdult)}
                                    // minDate={new Date(minDobAdult)}
                                    className="datePckr"
                                    selected={values.date_of_birth}
                                    onChange={(val) => {
                                      setFieldTouched("date_of_birth");
                                      setFieldValue("date_of_birth", val);
                                    }}
                                  />
                                  {errors.date_of_birth &&
                                  touched.date_of_birth ? (
                                    <span className="errorMsg">
                                      {errors.date_of_birth}
                                    </span>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={4} lg={4}>
                                <FormGroup className="m-b-25">
                                  <div className="insurerName nmbract">
                                    <span>+91</span>
                                    <Field
                                      name="mobile"
                                      type="text"
                                      placeholder="Mobile No. "
                                      disabled={true}
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.mobile}
                                      maxLength="10"
                                      className="phoneinput pd-l-25"
                                    />
                                    {errors.mobile && touched.mobile ? (
                                      <span className="errorMsg msgpositn">
                                        {errors.mobile}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={4} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="email_id"
                                      type="email"
                                      placeholder="Email "
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.email_id}
                                    />
                                    {errors.email_id && touched.email_id ? (
                                      <span className="errorMsg">
                                        {errors.email_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={12} md={4} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="pincode"
                                      type="test"
                                      placeholder="Pincode"
                                      autoComplete="off"
                                      maxLength="6"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      onKeyUp={(e) => this.fetchAreadetails(e)}
                                      value={values.pincode}
                                      maxLength="6"
                                      onInput={(e) => {}}
                                    />
                                    {errors.pincode && touched.pincode ? (
                                      <span className="errorMsg">
                                        {errors.pincode}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={3} lg={4}>
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
                                      {pinDataArr &&
                                        pinDataArr.length > 0 &&
                                        pinDataArr.map((resource, rindex) => (
                                          <option key= {rindex} value={resource.id}>
                                            {
                                              resource.LCLTY_SUBRB_TALUK_TEHSL_NM
                                            }
                                          </option>
                                        ))}

                                      {/*<option value="area2">Area 2</option>*/}
                                    </Field>
                                    {errors.pincode_id && touched.pincode_id ? (
                                      <span className="errorMsg">
                                        {errors.pincode_id}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="building_name"
                                      type="text"
                                      placeholder="Building/House Name"
                                      autoComplete="off"
                                      // onFocus={(e) =>
                                      //   this.changePlaceHoldClassAdd(e)
                                      // }
                                      // onBlur={(e) =>
                                      //   this.changePlaceHoldClassRemove(e)
                                      // }
                                      value={values.building_name}
                                    />
                                    {errors.building_name &&
                                    touched.building_name ? (
                                      <span className="errorMsg">
                                        {errors.building_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="plot_no"
                                      type="text"
                                      placeholder="Plot No. "
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.plot_no}
                                    />
                                    {errors.plot_no && touched.plot_no ? (
                                      <span className="errorMsg">
                                        {errors.plot_no}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="street_name"
                                      type="text"
                                      placeholder="Street Name"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.street_name}
                                    />
                                    {errors.street_name &&
                                    touched.street_name ? (
                                      <span className="errorMsg">
                                        {errors.street_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="city"
                                      type="text"
                                      placeholder="City"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.city}
                                    />
                                    {errors.city && touched.city ? (
                                      <span className="errorMsg">
                                        {errors.city}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row></Row>
                            <Row>
                              <h3></h3>
                            </Row>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4 className="fs-18 m-b-30">
                                  Nominee Details
                                </h4>
                              </div>
                            </div>
                            <Row>
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="nominee_salutation_id"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Title</option>
                                      {titleList && titleList.length >0 && titleList.map((title, qIndex) => ( 
                                       <option key= {qIndex} value={title.id}>{title.description}</option>
                                      ))}
                                    </Field>
                                    {errors.nominee_salutation_id && touched.nominee_salutation_id ? (
                                        <span className="errorMsg">{errors.nominee_salutation_id}</span>
                                        ) : null}               
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={12} md={4} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="nominee_first_name"
                                      type="text"
                                      placeholder="First Name"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.nominee_first_name}
                                    />
                                    {errors.nominee_first_name &&
                                    touched.nominee_first_name ? (
                                      <span className="errorMsg">
                                        {errors.nominee_first_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={12} md={4} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="nominee_last_name"
                                      type="text"
                                      placeholder="Last Name"
                                      autoComplete="off"
                                      onFocus={(e) =>
                                        this.changePlaceHoldClassAdd(e)
                                      }
                                      onBlur={(e) =>
                                        this.changePlaceHoldClassRemove(e)
                                      }
                                      value={values.nominee_last_name}
                                    />
                                    {errors.nominee_last_name &&
                                    touched.nominee_last_name ? (
                                      <span className="errorMsg">
                                        {errors.nominee_last_name}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row className="m-b-45">
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <DatePicker
                                    name="nominee_dob"
                                    dateFormat="yyyy-MM-dd"
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
                                      setFieldTouched("nominee_dob");
                                      setFieldValue("nominee_dob", value);
                                      this.ageCheck(value);
                                      this.ageCheckValue(value)
                                    }}
                                    selected={values.nominee_dob}
                                  />
                                  {errors.nominee_dob && touched.nominee_dob ? (
                                    <span className="errorMsg">
                                      {errors.nominee_dob}
                                    </span>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={4} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="nominee_age"
                                      type="text"
                                      placeholder="Age"
                                      autoComplete="off"
                                      value={new Date().getFullYear() - new Date(values.nominee_dob).getFullYear()}
                                    />
                                  </div>
                                </FormGroup>
                              </Col>
                              <Col sm={12} md={4} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="relation_with"
                                      component="select"
                                      autoComplete="off"
                                      value={values.relation_with}
                                      className="formGrp"
                                    >
                                      <option value="">
                                        Relation with Primary Insured
                                      </option>
                                      <option value="1">Self</option>
                                      <option value="2">Spouse</option>
                                      <option value="3">Son</option>
                                      <option value="4">Daughter</option>
                                      <option value="5">Father</option>
                                      <option value="6">Mother</option>
                                      <option value="7">Father In Law</option>
                                      <option value="8">Mother In Law</option>
                                    </Field>
                                    {errors.relation_with &&
                                    touched.relation_with ? (
                                      <span className="errorMsg">
                                        {errors.relation_with}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            {appointeeFlag || is_appointee == "1" ? (
                              <div>
                                <div className="d-flex justify-content-left carloan m-b-25">
                                  <h4> Appointee Details</h4>
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
                                          onFocus={(e) =>
                                            this.changePlaceHoldClassAdd(e)
                                          }
                                          onBlur={(e) =>
                                            this.changePlaceHoldClassRemove(e)
                                          }
                                          value={values.appointee_name}
                                        />
                                        {errors.appointee_name &&
                                        touched.appointee_name ? (
                                          <span className="errorMsg">
                                            {errors.appointee_name}
                                          </span>
                                        ) : null}
                                      </div>
                                    </FormGroup>
                                  </Col>
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <DatePicker
                                    name="appointee_dob"
                                    dateFormat="dd MMM yyyy"
                                    placeholderText="DOB"
                                    peekPreviousMonth
                                    peekPreviousYear
                                    showMonthDropdown
                                    showYearDropdown
                                    dropdownMode="select"
                                    maxDate={new Date(maxDobAppointee)}
                                    minDate={new Date(minDobAppointee)}
                                    className="datePckr"
                                    onChange={(value) => {
                                      setFieldTouched("appointee_dob");
                                      setFieldValue("appointee_dob", value);
                                      // this.ageCheck(value);
                                    }}
                                    selected={values.appointee_dob}
                                  />
                                  {errors.appointee_dob && touched.appointee_dob ? (
                                    <span className="errorMsg">
                                      {errors.appointee_dob}
                                    </span>
                                  ) : null}
                                </FormGroup>
                              </Col>

                                  <Col sm={12} md={4} lg={4}>
                                    <FormGroup>
                                      <div className="formSection">
                                        <Field
                                          name="appointee_relation_with"
                                          component="select"
                                          autoComplete="off"
                                          value={values.appointee_relation_with}
                                          className="formGrp"
                                        >
                                          <option value="">
                                            Relation with Nominee
                                          </option>
                                          {/* {self_selected ? ( */}
                                            {/* "" */}
                                          {/* ) : ( */}
                                            <option value="1">Self</option>
                                          {/* )} */}
                                          <option value="2">Spouse</option>
                                          <option value="3">Son</option>
                                          <option value="4">Daughter</option>
                                          <option value="5">Father</option>
                                          <option value="6">Mother</option>
                                          <option value="7">
                                            Father In Law
                                          </option>
                                          <option value="8">
                                            Mother In Law
                                          </option>
                                        </Field>
                                        {errors.appointee_relation_with &&
                                        touched.appointee_relation_with ? (
                                          <span className="errorMsg">
                                            {errors.appointee_relation_with}
                                          </span>
                                        ) : null}
                                      </div>
                                    </FormGroup>
                                  </Col>
                                </Row>
                              </div>
                            ) : null}

                            <div className="d-flex justify-content-left carloan">
                              <h4> </h4>
                            </div>
                            <div className="d-flex justify-content-left resmb">
                              <Button
                                className={`backBtn`}
                                type="button"
                                onClick={this.AddDetails.bind(this,productId)}
                              >
                                {isSubmitting ? "Wait.." : "Back"}
                              </Button>
                              <Button
                                className={`proceedBtn`}
                                type="submit"
                                disabled={isSubmitting ? true : false}
                              >
                                {isSubmitting ? "Wait.." : "Procced"}
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

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadingStart: () => dispatch(loaderStart()),
    loadingStop: () => dispatch(loaderStop()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(AccidentAdditionalDetails)
);
