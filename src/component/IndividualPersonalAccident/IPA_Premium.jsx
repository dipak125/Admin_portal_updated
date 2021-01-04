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
import Collapsible from "react-collapsible";

const initialValues = {
  regNumber: "",
  check_registration: 2,
};


class IPA_Premium extends Component {
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
        let address = accidentDetails && accidentDetails.address ? JSON.parse(accidentDetails.address) : {};
        console.log("---accidentDetails--->>", accidentDetails);
        this.setState({
          accidentDetails,address
        });
        this.props.loadingStop();
      })
      .catch((err) => {
        // handle error
        this.props.loadingStop();
      });
  };

  CommunicationDetails = (productId) => {
    // productId === 5
    this.props.history.push(`/AccidentAdditionalDetails/${productId}`);
  };

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
    const { occupationList, accidentDetails, address} = this.state;
    const {productId} = this.props.match.params
    const newInitialValues = Object.assign(initialValues, {});
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
                    >
                      {({values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                        // console.log('values',values)

                        return (
                          <Form>

                            <div className="d-flex justify-content-left carloan">
                              <h4> </h4>
                            </div>
                            <div className="rghtsideTrigr">
                                <Collapsible trigger="Policy Details" open={true}>
                                    <div className="listrghtsideTrigr">
                                        <div> 
                                        </div>
                                    </div>
                                </Collapsible>
                            </div>
                            <div className="rghtsideTrigr">
                                <Collapsible trigger="Proposer Details">
                                    <div className="listrghtsideTrigr">
                                        <div>                                            
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Title :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{accidentDetails && accidentDetails.ipainfo ? accidentDetails.ipainfo.ipatitle.description : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                          
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Proposer Name :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{accidentDetails ? accidentDetails.first_name : "" }   { accidentDetails ? accidentDetails.last_name : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                           
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Date of birth :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{accidentDetails && accidentDetails.dob ? accidentDetails.dob : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                          
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Mobile No. :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{accidentDetails ? accidentDetails.mobile : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                          
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Email-id :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{accidentDetails ? accidentDetails.email_id : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                         
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Address :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{address && address.street_name ? address.street_name : ""}, {address && address.plot_no ? address.plot_no : ""}, {address && address.house_building_name ? address.house_building_name : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>
                                        </div>
                                    </div>
                                </Collapsible>
                            </div>
                            <div className="rghtsideTrigr">
                                <Collapsible trigger="Nominee Details">
                                    <div className="listrghtsideTrigr">
                                        <div>                                         
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Name:</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{(accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0 ? accidentDetails.request_data.nominee[0].first_name : ""}  {(accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].last_name : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                         
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Date of birth :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{(accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].dob : null}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>                                        
                                        <Row>
                                           <Col sm={12} md={6}>
                                              <Row>
                                               <Col sm={12} md={6}>
                                                <FormGroup>Relation with proposer :</FormGroup>
                                                </Col>
                                                <Col sm={12} md={6}>
                                                  <FormGroup>{(accidentDetails && accidentDetails.request_data) && accidentDetails.request_data.nominee.length > 0  ? accidentDetails.request_data.nominee[0].relation.ksb_slug : ""}</FormGroup>
                                                </Col>
                                               </Row>
                                           </Col>
                                        </Row>   
                                        </div>
                                    </div>
                                </Collapsible>
                            </div>
                            <div className="d-flex justify-content-left resmb">
                              <Button
                                className={`backBtn`}
                                type="button"
                                onClick={this.CommunicationDetails.bind(this,productId)}
                              >
                                {isSubmitting ? "Wait.." : "Back"}
                              </Button>
                              <Button
                                className={`proceedBtn`}
                                type="submit"
                                disabled={isSubmitting ? true : false}
                              >
                                {isSubmitting ? "Wait.." : "Make Payment"}
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
  connect(mapStateToProps, mapDispatchToProps)(IPA_Premium)
);
