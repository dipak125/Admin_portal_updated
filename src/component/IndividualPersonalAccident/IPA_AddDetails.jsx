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
import { addDays } from "date-fns";
import moment from "moment";

const initialValues = {
  pol_start_date : "",
  pol_end_date : "",
  insured : "",
  first_name : "",
  last_name : "",
  date_of_birth : "",
  occupation : "",
  gender : "",
  previous_policy_check : "",
  disability : ""
};

const vehicleRegistrationValidation = Yup.object().shape({  
  // insured: Yup.string().required("Please select insured type").nullable(),
  occupation: Yup.string().required("Please select occupation type"),
  gender: Yup.string().required("Please select gender").nullable(),
  insured: Yup.string().required("Please select insured type")
});

class AccidentAddDetails extends Component {
  state = {
    occupationList: [],
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
    this.fetchData();
    this.fetchInsurance();
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
        this.setState({
          accidentDetails
        });
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  // fetchSubVehicle = () => {
  //   const { productId } = this.props.match.params;
  //   let encryption = new Encryption();
  //   this.props.loadingStart();
  //   axios
  //     .get(`gcv-tp/sub-vehical-list/4`)
  //     .then((res) => {
  //       let decryptResp = JSON.parse(encryption.decrypt(res.data));
  //       console.log("decrypt--fetchSubVehicle------ ", decryptResp);

  //       let subVehicleList = decryptResp.data;
  //       this.setState({
  //         subVehicleList,
  //       });
  //       // this.fetchData();
  //     })
  //     .catch((err) => {
  //       // handle error
  //       this.props.loadingStop();
  //     });
  // };

  select_Plan = (productId) => {
    // productId === 5
    this.props.history.push(`/AccidentSelectPlan/${productId}`);
  };

 handleSubmit = (values, actions) => {
    const {productId} = this.props.match.params 
    const {accidentDetails} = this.state
    console.log('values------->>>',values)
    const formData = new FormData(); 
    let encryption = new Encryption();
    this.props.loadingStart();
    let policy_start_date = moment(values.pol_start_date).format('yyyy-MM-DD HH:mm:ss')
    let policy_end_date = moment(values.date_of_birth).format('yyyy-MM-DD HH:mm:ss')
    let post_data = {
        'policy_holder_id':accidentDetails.id,
        'menumaster_id':'9',
        'page_name': `AccidentAddDetails/${productId}`,
        'pol_start_date': policy_start_date,
        'pol_end_date': policy_end_date,
        'insured_type_id':values.insured,
        'claim_existing':values.previous_policy_check,
        'existing_physical_disability':values.disability,
        'occupation_id':values.occupation,
        'proposer_gender' : values.gender
    }
    console.log('post_data', post_data);
    formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
    // this.props.loadingStart();
    if( values.previous_policy_check == 1) {
      swal('Insurance Policy cannot be offered')
    } 
    else if(values.disability == 1) {
      swal('Insurance Policy cannot be offered')
    }
    axios
    .post(`ipa/policy-details`, formData)
    .then(res => { 
        let decryptResp = JSON.parse(encryption.decrypt(res.data));
        console.log('decryptResp-----', decryptResp)
        this.props.loadingStop();
        if (decryptResp.error == false) {
        this.props.history.push(`/AccidentAdditionalDetails/${productId}`);
        } else {
          actions.setSubmitting(false)
        }
    })
    .catch(err => { 
      this.props.loadingStop();
      actions.setSubmitting(false)
      let decryptErr = JSON.parse(encryption.decrypt(err.data));
      console.log('decryptErr-----', decryptErr)
    });

}

  fetchInsurance = () => {
    let encryption = new Encryption();
    // this.props.loaderStart();
    axios
      .get("occupations")
      .then((res) => {
        let decryptErr = JSON.parse(encryption.decrypt(res.data));
        console.log('decryptErr-----', decryptErr)
        this.setState({ occupationList: decryptErr.data });
        this.props.loadingStop();
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };

  render() {
    const { occupationList, accidentDetails} = this.state;
    const {productId} = this.props.match.params
    const newInitialValues = Object.assign(initialValues, {
      pol_start_date: new Date(),
      pol_end_date : new Date(moment().add(364, "day").calendar()),
      insured:  accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo.insured_type_id  : "",
      previous_policy_check: 0,
      disability: 0,
      first_name: accidentDetails ? accidentDetails.first_name : "",
      last_name: accidentDetails ? accidentDetails.last_name : "",
      date_of_birth: accidentDetails && accidentDetails.dob ? new Date(accidentDetails.dob) : "",
      occupation: accidentDetails && accidentDetails.ipainfo && accidentDetails.ipainfo.occupation ? accidentDetails.ipainfo.occupation.id : "",
      gender: accidentDetails ? accidentDetails.gender : ""
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
                      validationSchema={vehicleRegistrationValidation}
                    >
                      {({values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                        // console.log('values',values)

                        return (
                          <Form>
                            <Row>
                              <Col sm={6} md={5} lg={5}>
                                <h6>Policy start date:</h6>
                              </Col>
                              <Col sm={6} md={11} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <DatePicker
                                      name="pol_start_date"
                                      //   excludeOutOfBoundsTimes
                                      //   dropdownMode="select"
                                      dateFormat="yyyy-MM-dd"
                                      timeFormat="HH:mm:ss"
                                      className="datePckr inputfs12"
                                      disabled={true}
                                      selected={values.pol_start_date}
                                      onChange={(val) => {
                                        setFieldTouched("pol_start_date");
                                        setFieldValue("pol_start_date", val);
                                        }}
                                      /> 
                                    {errors.pol_start_date && touched.pol_start_date ? (
                                      <span className="errorMsg">
                                        {errors.pol_start_date}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col sm={6} md={5} lg={5}>
                                <h6>Policy end date</h6>
                              </Col>
                              <Col sm={6} md={11} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <DatePicker
                                      name="pol_end_date"
                                      dateFormat="yyyy-MM-dd"
                                      timeFormat="HH:mm:ss"
                                      className="datePckr inputfs12"
                                      disabled={true}
                                      // minDate={new Date(values.pol_end_date)}
                                      selected={values.pol_end_date}
                                      onChange={(val) => {
                                        setFieldTouched('pol_end_date');
                                        setFieldValue('pol_end_date', val);
                                        }}
                                      /> 
                                    {errors.pol_end_date &&
                                    touched.pol_end_date ? (
                                      <span className="errorMsg">
                                        {errors.pol_end_date}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              {" "}
                              <h1> </h1>{" "}
                            </Row>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4>Insured details</h4>
                              </div>
                            </div>
                            <Row>
                              {" "}
                              <h1> </h1>{" "}
                            </Row>
                            <Row>
                              <Col sm={12} md={3} lg={3}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="insured"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Insured Type</option>
                                      <option value="1">Primary Insured</option>
                                    </Field>
                                    {errors.insured && touched.insured ? (
                                      <span className="errorMsg">
                                        {errors.insured}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="first_name"
                                      type="text"
                                      placeholder="First Name"
                                      autoComplete="off"
                                      disabled={true}
                                      // onFocus={(e) =>
                                      //   this.changePlaceHoldClassAdd(e)
                                      // }
                                      // onBlur={(e) =>
                                      //   this.changePlaceHoldClassRemove(e)
                                      // }
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

                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="insurerName">
                                    <Field
                                      name="last_name"
                                      type="text"
                                      placeholder="Last Name"
                                      autoComplete="off"
                                      disabled={true}
                                      // onFocus={(e) =>
                                      //   this.changePlaceHoldClassAdd(e)
                                      // }
                                      // onBlur={(e) =>
                                      //   this.changePlaceHoldClassRemove(e)
                                      // }
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
                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="gender"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Select Gender</option>
                                      <option value="m">Male</option>
                                      <option value="f">Female</option>
                                    </Field>
                                    {errors.gender && touched.gender ? (
                                      <span className="errorMsg">
                                        {errors.gender}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>

                              <Col sm={12} md={3} lg={4}>
                                <FormGroup>
                                  <div className="formSection">
                                    <Field
                                      name="occupation"
                                      component="select"
                                      autoComplete="off"
                                      className="formGrp"
                                    >
                                      <option value="">Occupation Type</option>
                                        {occupationList && occupationList.length > 0 && occupationList.map((insurer, qIndex) => ( 
                                          <option key={qIndex} value= {insurer.id}>{insurer.occupation}</option>
                                        ))} 
                                    </Field>
                                    {errors.occupation && touched.occupation ? (
                                      <span className="errorMsg">
                                        {errors.occupation}
                                      </span>
                                    ) : null}
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <h3></h3>
                            </Row>
                            <Row>
                              <Col sm={12} md={9} lg={9}>
                                <FormGroup>
                                  <div className="d-flex justify-content-left">
                                    <div className="brandhead">
                                      <h4 className="fs-18 m-b-32">
                                        {" "}
                                        Have you made any claim in any existing
                                        or previous accident policy?{" "}
                                      </h4>
                                    </div>
                                  </div>
                                  <div className="d-inline-flex m-b-35">
                                    <div className="p-r-25">
                                      <label className="customRadio3">
                                      <Field
                                        type="radio"
                                        name="previous_policy_check"
                                        value="0"
                                        key="1"
                                        checked={
                                          values.previous_policy_check == "0" ? true : false }
                                        onChange={(e) => {
                                          setFieldTouched("previous_policy_check");
                                          setFieldValue("previous_policy_check", e.target.value);
                                          // this.handleChange(
                                          //   values,
                                          //   setFieldTouched,
                                          //   setFieldValue
                                          // );
                                        }}
                                      />
                                      <span className="checkmark " />
                                      <span className="fs-14"> No</span>
                                    </label>
                                  </div>
                                  <div className="p-r-25">
                                    <label className="customRadio3">
                                      <Field
                                        type="radio"
                                        name="previous_policy_check"
                                        value="1"
                                        key="1"
                                        checked={
                                          values.previous_policy_check == "1" ? true : false }
                                        onChange={(e) => {
                                          setFieldTouched("previous_policy_check");
                                          setFieldValue("previous_policy_check", e.target.value);
                                          // this.handleChange(
                                          //   values,
                                          //   setFieldTouched,
                                          //   setFieldValue
                                          // );
                                        }}
                                      />
                                      <span className="checkmark " />
                                      <span className="fs-14"> Yes</span>
                                    </label>
                                    {errors.previous_policy_check && touched.previous_policy_check ? (
                                      <span className="errorMsg">
                                        {errors.previous_policy_check}
                                      </span>
                                    ) : null}
                                    </div>
                                  </div>
                                </FormGroup>
                              </Col>
                            </Row>
                            <div className="d-flex justify-content-left">
                              <div className="brandhead">
                                <h4 className="fs-18 m-b-32">
                                  Do yo have any existing physical disability?
                                </h4>
                                <div className="d-inline-flex m-b-15">
                                  <div className="p-r-25">
                                    <label className="customRadio3">
                                      <Field
                                        type="radio"
                                        name="disability"
                                        value="0"
                                        key="1"
                                        checked={
                                          values.disability == "0" ? true : false }
                                        onChange={(e) => {
                                          setFieldTouched("disability");
                                          setFieldValue("disability", e.target.value);
                                          // this.handleChange(
                                          //   values,
                                          //   setFieldTouched,
                                          //   setFieldValue
                                          // );
                                        }}
                                      />
                                      <span className="checkmark " />
                                      <span className="fs-14"> No</span>
                                    </label>
                                  </div>
                                  <div className="p-r-25">
                                    <label className="customRadio3">
                                      <Field
                                        type="radio"
                                        name="disability"
                                        value="1"
                                        key="1"
                                        checked={
                                          values.disability == "1" ? true : false }
                                        onChange={(e) => {
                                          setFieldTouched("disability");
                                          setFieldValue("disability", e.target.value);
                                          // this.handleChange(
                                          //   values,
                                          //   setFieldTouched,
                                          //   setFieldValue
                                          // );
                                        }}
                                      />
                                      <span className="checkmark " />
                                      <span className="fs-14"> Yes</span>
                                    </label>
                                    {errors.disability && touched.disability ? (
                                      <span className="errorMsg">
                                        {errors.disability}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="d-flex justify-content-left carloan">
                              <h4> </h4>
                            </div>
                            <div className="d-flex justify-content-left resmb">
                              <Button
                                className={`backBtn`}
                                type="button"
                                onClick={this.select_Plan.bind(this,productId)}
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
  connect(mapStateToProps, mapDispatchToProps)(AccidentAddDetails)
);
