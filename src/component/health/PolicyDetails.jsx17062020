import React, { Component } from "react";
import {
  Row,
  Col,
  Modal,
  Button,
  FormGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";

import BaseComponent from ".././BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import Collapsible from "react-collapsible";
import axios from "../../shared/axios";
import { withRouter, Link } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'
import moment from "moment";
import Otp from "./Otp";
import swal from 'sweetalert';

const genderArr = {
  M: "Male",
  F: "Female",
};

const relationArr = {
1:"Self",
2:"Spouse",
3:"Son",
4:"Daughter",
5:"Father",
6:"Mother",
7:"Father In Law",
8:"Mother In Law"
}

// const date_UTC = moment().format();
const date_cstom = moment().format("D-MMMM-YYYY-h:mm:ss");
const date_DB = moment().format("YYYY-mm-D");

class PolicyDetails extends Component {
  state = {
    accessToken: "",
    policyHolderDetails: [],
    familyMember: [],
    fulQuoteResp: [],
    error: [],
    purchaseData: [],
    error1: [],
    show: false,
  };

  handleClose = () => {
    this.setState({ show: false });
  }

  handleShow = () => {
    this.setState({ show: true });
  };

  policySummery = (policyId) => {
    this.props.history.push(`/ThankYou/${policyId}`);
  };

  nomineeDetails = (productId) => {
    this.props.history.push(`/NomineeDetails/${productId}`);
  };

  getPolicyHolderDetails = () => {
    this.props.loadingStart();
    axios
      .get(`/policy-holder/${localStorage.getItem("policyHolder_id")}`)
      .then((res) => {
        this.setState({
          policyHolderDetails: res.data.data.policyHolder,
          familyMember: res.data.data.policyHolder.request_data.family_members,
        });
        this.getAccessToken(
          res.data.data.policyHolder,
          res.data.data.policyHolder.request_data.family_members
        );
      })
      .catch((err) => {
        this.setState({
          policyHolderDetails: [],
        });
        this.props.loadingStop();
      });
  };

  getAccessToken = (policyHolderDetails, familyMember) => {
    axios
      .post(`/callTokenService`)
      .then((res) => {
        this.setState({
          accessToken: res.data.access_token,
        });
        this.fullQuote(
          res.data.access_token,
          policyHolderDetails,
          familyMember
        );
      })
      .catch((err) => {
        this.setState({
          accessToken: [],
        });
        this.props.loadingStop();
      });
  };

  getAccessTokenForInception = (e) => {
    this.props.loadingStart();
    axios
      .post(`/callTokenService`)
      .then((res) => {
        this.setState({
          accessToken: res.data.access_token,
        });
        this.policyInception(res.data.access_token);
      })
      .catch((err) => {
        this.setState({
          accessToken: [],
        });
        this.props.loadingStop();
      });
  };

  fullQuote = (access_token, policyHolderDetails) => {
    let id = localStorage.getItem("policyHolder_id");
    let insureValue = Math.floor(policyHolderDetails.request_data.sum_insured);

    const formData = new FormData();
    formData.append("id", id);
    formData.append("insureValue", insureValue);
    formData.append("access_token", access_token);
    axios
      .post(`/fullQuoteServiceArogyaSeries`, formData)
      .then((res) => {
        if (res.data.PolicyObject) {
          this.setState({
            fulQuoteResp: res.data.PolicyObject,
            error: [],
          });
        } else {
          this.setState({
            fulQuoteResp: [],
            error: res.data,
          });
        }
        this.props.loadingStop();
      })
      .catch((err) => {
        this.setState({
          serverResponse: [],
        });
        this.props.loadingStop();
      });
  };

  policyInception = (access_token) => {
    const { fulQuoteResp, error } = this.state;
    const formData = new FormData();
    formData.append("quotationNo", fulQuoteResp.QuotationNo);
    formData.append("amount", fulQuoteResp.DuePremium);
    formData.append("access_token", access_token);
    axios
      .post(`/callIssueQuoteMod`, formData)
      .then((res) => {
        if (res.data.PolicyNo) {
          this.setState({
            purchaseData: res.data,
            error1: [],
          });
          this.policySummery(res.data.PolicyNo);
        } else {
          this.setState({
            purchaseData: [],
            error1: res.data,
          });
          swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 180 22 1111");
        }
        this.props.loadingStop();
      })
      .catch((err) => {
        this.setState({
          serverResponse: [],
        });
        this.props.loadingStop();
      });
  };

  componentDidMount() {
    this.getPolicyHolderDetails();
  }

  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, show, policyHolderDetails } = this.state;

    console.log("fulQuoteResp ", fulQuoteResp)
    const items =
      fulQuoteResp &&
      fulQuoteResp.PolicyLobList && fulQuoteResp.PolicyLobList.length > 0 && 
      fulQuoteResp.PolicyLobList[0].PolicyRiskList
        ? fulQuoteResp.PolicyLobList[0].PolicyRiskList.map((member, qIndex) => {
            return (
              <div>
              <Row>
                <Col sm={12} md={6}>
                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Name:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.FirstName+" "+member.LastName}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{member.DateOfBirth}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Relation With Proposer:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{relationArr[member.ArgInsuredRelToProposer]}</FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col sm={12} md={6}>
                      <FormGroup>Gender</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                      <FormGroup>{genderArr[member.GenderCode]}</FormGroup>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
              <p></p>
              </Row>
              </div>
            );
          })
        : null;

    const errMsg =
      error && error.message ? (
        <span className="errorMsg">
          <h6>
            <strong>
              Thank you for showing your interest for buying product.Due to some
              reasons, we are not able to issue the policy online.Please call
              180 22 1111
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
                <h4 className="text-center mt-3 mb-3">
                  Arogya Sanjeevani Policy
                </h4>
                <section className="brand">
                  <div className="boxpd">
                    <div className="d-flex justify-content-left carloan">
                      <h4> Details of your Policy Premium</h4>
                    </div>
                    <div className="brandhead m-b-30">
                      <h5>{errMsg}</h5>
                      <h4>
                        Policy Reference Number {fulQuoteResp.QuotationNo}
                      </h4>
                    </div>

                    <Row>
                      <Col sm={12} md={9} lg={9}>
                        <div className="rghtsideTrigr">
                          <Collapsible trigger="Arogya Sanjeevani Policy, SBI General Insurance Company Limited">
                            <div className="listrghtsideTrigr">
                              <Row>
                                <Col sm={12} md={3}>
                                  <FormGroup>Sum Insured:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong>{" "}
                                    {fulQuoteResp.SumInsured}
                                  </FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>Applicable Taxes:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong> {fulQuoteResp.TGST}
                                  </FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>Gross Premium:</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong>{" "}
                                    {fulQuoteResp.GrossPremium}
                                  </FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>Net Premium;</FormGroup>
                                </Col>
                                <Col sm={12} md={3}>
                                  <FormGroup>
                                    <strong>Rs:</strong>{" "}
                                    {fulQuoteResp.DuePremium}
                                  </FormGroup>
                                </Col>
                              </Row>
                            </div>
                          </Collapsible>
                        </div>

                        <div className="rghtsideTrigr">
                          <Collapsible trigger=" Member Details">
                            <div className="listrghtsideTrigr">{items}</div>
                          </Collapsible>
                        </div>

                        <div className="rghtsideTrigr m-b-40">
                          <Collapsible trigger=" Contact information">
                            <div className="listrghtsideTrigr">
                              <div className="d-flex justify-content-end carloan">
                                <Link to ={`/Address/${productId}`}> Edit</Link>
                              </div>
                              <Row>
                                <Col sm={12} md={6}>
                                  <Row>
                                    <Col sm={12} md={6}>
                                      Mobile number:
                                    </Col>
                                    <Col sm={12} md={6}>
                                      {policyHolderDetails.mobile}
                                    </Col>
                                  </Row>

                                  <Row>
                                    <Col sm={12} md={6}>
                                      Email:
                                    </Col>
                                    <Col sm={12} md={6}>
                                      {policyHolderDetails.email_id}
                                    </Col>
                                  </Row>
                                </Col>
                              </Row>
                            </div>
                          </Collapsible>
                        </div>

                        <Row>
                          <Col sm={12} md={6}>
                            <FormGroup>
                              <div className="paymntgatway">
                                {/* <img src={require('../../assets/images/down-arrow-blue.svg')} alt="" /> */}
                              </div>
                            </FormGroup>
                          </Col>
                          <Col sm={12} md={6}>
                            <FormGroup>
                              <div className="paymntgatway">
                                Select Payment Gateway
                                <div>
                                  <img
                                    src={require("../../assets/images/radio-checked.svg")}
                                    alt=""
                                    className="m-t-10"
                                  />
                                  <img
                                    src={require("../../assets/images/CSC.svg")}
                                    alt=""
                                    className="m-l-5"
                                  />
                                </div>
                              </div>
                            </FormGroup>
                          </Col>
                        </Row>

                        <div className="d-flex justify-content-left resmb">
                          <button
                            className="backBtn"
                            onClick={this.nomineeDetails.bind(this, productId)}
                          >
                            Back
                          </button>
                        {fulQuoteResp.QuotationNo ? 
                          <button
                            className="proceedBtn"
                            onClick={this.handleShow}
                          >
                            Make Payment
                          </button> : null
                        }

                        </div>
                      </Col>

                      <Col sm={12} md={3}>
                        <div className="regisBox">
                          <h3 className="medihead">
                            Assurance of Insurance. Everywhere in India, for
                            every Indian{" "}
                          </h3>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </section>
                <Modal
                  className=""
                  bsSize="md"
                  show={show}
                  onHide={this.handleClose}
                >
                  <div className="otpmodal">
                    <Modal.Body>
                      <Otp
                        quoteNo = {fulQuoteResp.QuotationNo}
                        duePremium = {fulQuoteResp.DuePremium}
                        reloadPage={(e) => this.getAccessTokenForInception(e)}
                      />
                    </Modal.Body>
                  </div>
                </Modal>
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
  connect(mapStateToProps, mapDispatchToProps)(PolicyDetails)
);
