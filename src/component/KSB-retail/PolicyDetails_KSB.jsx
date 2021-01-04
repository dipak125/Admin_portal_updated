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
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik'
import moment from "moment";
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import { Formik, Field, Form } from "formik";


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

const initialValue = {
  gateway : ""
}


// const date_UTC = moment().format();
const date_cstom = moment().format("D-MMMM-YYYY-h:mm:ss");
const date_DB = moment().format("YYYY-mm-D");

class PolicyDetails extends Component {
  state = {
    accessToken: "",
    policyHolderDetails: [],
    familyMember: [],
    nomineeDetails: [],
    fulQuoteResp: [],
    error: [],
    purchaseData: [],
    error1: [],
    show: false,
    refNumber: "",
    paymentStatus: [],
    policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                        queryString.parse(this.props.location.search).access_id : 
                        localStorage.getItem("policyHolder_refNo")
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
    this.props.history.push(`/NomineeDetails_KSB/${productId}`);
  };

  getPolicyHolderDetails = () => {
    const policyHolder_refNo = this.state.policyHolder_refNo
    
    this.props.loadingStart();
    axios
      .get(`ksb/details/${policyHolder_refNo}`)
      .then((res) => {
        var policyHolderDetails = res.data.data.policyHolder ? res.data.data.policyHolder : []

        this.setState({
          policyHolderDetails: policyHolderDetails,
          nomineeDetails: policyHolderDetails.request_data && policyHolderDetails.request_data.nominee && policyHolderDetails.request_data.nominee[0],
          familyMember: res.data.data.policyHolder.request_data.family_members,
          refNumber: res.data.data.policyHolder.reference_no,
          paymentStatus: res.data.data.policyHolder.payment ? res.data.data.policyHolder.payment[0] : []
        });
        this.fullQuote( res.data.data.policyHolder );
      })
      .catch((err) => {
        if(err.status == 401) {
          swal("Session out. Please login")
        }
        else swal("Something wrong happened. Please try after some")

        this.setState({
          policyHolderDetails: [],
        });
        this.props.loadingStop();
      });
  };


  fullQuote = (policyHolderDetails) => {
    let id = policyHolderDetails.id;
    let ksbplan_id = policyHolderDetails.ksbinfo.ksbplan_id
    let polStartDate = policyHolderDetails.request_data.start_date
    console.log('policyHolderDetails', policyHolderDetails)
    const formData = new FormData();
    //let encryption = new Encryption();

    formData.append("id", id);
    formData.append("ksbplan_id", ksbplan_id);
    formData.append("policyStartDate", polStartDate);
    formData.append("ksbperiod_id", '3');

  //  const post_data = {
  //     "id":id,
  //     "insureValue":insureValue,
  //   }
  //   formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))    

    axios
      .post(`/fullQuoteServiceKSBRetail`, formData)
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

  handleSubmit = (values) => {
    const {policyHolderDetails} = this.state
    if(policyHolderDetails && policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.paymentgateway && policyHolderDetails.bcmaster.paymentgateway.slug && values.gateway == 1) {
      if(policyHolderDetails.bcmaster.paymentgateway.slug == "csc_wallet") {
          this.payment()
      }
      if(policyHolderDetails.bcmaster.paymentgateway.slug == "razorpay") {
          this.Razor_payment()
      }
      if(policyHolderDetails.bcmaster.paymentgateway.slug == "PPINL") {
          this.paypoint_payment()
      }
    }
    else if (policyHolderDetails && policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.paymentgateway && policyHolderDetails.bcmaster.paymentgateway.slug && values.gateway == 2) {
      this.props.history.push(`/Vedvag_gateway/${this.props.match.params.productId}?access_id=${this.state.policyHolder_refNo}`);
    }
  }


  payment = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/payment.php?refrence_no=${refNumber}`
  }

  Razor_payment = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/razorpay/pay.php?refrence_no=${refNumber}`
  }

  paypoint_payment = () => {
    const { refNumber } = this.state;
    window.location = `${process.env.REACT_APP_PAYMENT_URL}/ppinl/pay.php?refrence_no=${refNumber}`
  }

  componentDidMount() {
     this.getPolicyHolderDetails();
  }

  render() {
    const { productId } = this.props.match.params;
    const { fulQuoteResp, error, show, policyHolderDetails, refNumber, paymentStatus, nomineeDetails } = this.state;

    console.log("policyHolderDetails ", policyHolderDetails)
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
                      <FormGroup>{member.InsuredName}</FormGroup>
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
                      <FormGroup>{
                      member.GenderCode == 'F' && member.ArgInsuredRelToProposer > 2?
                      (member.ArgInsuredRelToProposer==3 || member.ArgInsuredRelToProposer==5 || member.ArgInsuredRelToProposer==7)?
                      relationArr[parseInt(member.ArgInsuredRelToProposer)+1]:relationArr[member.ArgInsuredRelToProposer]:relationArr[member.ArgInsuredRelToProposer]}</FormGroup>
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

    const nomineeData = 
      <div>
        <Row>
            <Col sm={12} md={6}>
                <Row>
                    <Col sm={12} md={6}>
                        <FormGroup>Name:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                        <FormGroup>{nomineeDetails ? nomineeDetails.first_name : null}</FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <FormGroup>Date Of Birth:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                        <FormGroup>{ nomineeDetails ? moment(nomineeDetails.dob).format("DD-MM-YYYY") : null}</FormGroup>
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <FormGroup>Relation With Proposer:</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                        <FormGroup>{nomineeDetails ? relationArr[nomineeDetails.relation_with] : []}</FormGroup> 
                    </Col>
                </Row>

                <Row>
                    <Col sm={12} md={6}>
                        <FormGroup>Gender</FormGroup>
                    </Col>
                    <Col sm={12} md={6}>
                        <FormGroup>{nomineeDetails && nomineeDetails.gender == "m" ? "Male" : "Female"}</FormGroup>
                    </Col>
                </Row>
            </Col>
        </Row>
        <Row>
            <p></p>
        </Row>
      </div>


    const apointeeData = 
    <div>
      <Row>
          <Col sm={12} md={6}>
              <Row>
                  <Col sm={12} md={6}>
                      <FormGroup>Name:</FormGroup>
                  </Col>
                  <Col sm={12} md={6}>
                      <FormGroup>{nomineeDetails && nomineeDetails.appointee_name ? nomineeDetails.appointee_name : null}</FormGroup>
                  </Col>
              </Row>

              <Row>
                  <Col sm={12} md={6}>
                      <FormGroup>Relation With Nominee:</FormGroup>
                  </Col>
                  <Col sm={12} md={6}>
                  <FormGroup>{nomineeDetails ? relationArr[nomineeDetails.appointee_relation_with] : []}</FormGroup>
                  </Col>
              </Row>
          </Col>
      </Row>
      <Row>
          <p></p>
      </Row>
    </div>


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

    const paymentErrMsg =
    paymentStatus && paymentStatus.transaction_status == 103 ? (
        <span className="errorMsg">
          <h6>
            <strong>
              Payment failed. Please try again
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
                  KSB Retail Policy
                </h4>
                  <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                    // validationSchema={validatePremium}
                    >
                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                            return (
                                <Form>
                                  <section className="brand">
                                    <div className="boxpd">
                                      <div className="d-flex justify-content-left carloan">
                                        <h4> Details of your Policy Premium</h4>
                                      </div>
                                      <div className="brandhead m-b-30">
                                        <h5>{errMsg}</h5>
                                        <h5>{paymentErrMsg}</h5>
                                        <h4>
                                          Policy Reference Number {fulQuoteResp.QuotationNo}
                                        </h4>
                                      </div>

                                      <Row>
                                        <Col sm={12} md={9} lg={9}>
                                          <div className="rghtsideTrigr">
                                            <Collapsible trigger="KSB Retail Policy, SBI General Insurance Company Limited"  open= {true}>
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
                                                      {Math.round(fulQuoteResp.BeforeVatPremium)}
                                                    </FormGroup>
                                                  </Col>
                                                  <Col sm={12} md={3}>
                                                    <FormGroup>Net Premium:</FormGroup>
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
                                              <strong>Member Details :</strong>
                                              <div className="listrghtsideTrigr">{items}</div> 
                                              <strong>Nominee Details :</strong>
                                              <div className="listrghtsideTrigr">{nomineeData}</div>
                                              {nomineeDetails && nomineeDetails.is_appointee == '1' ? <strong>Appointee Details :</strong> : null }
                                              {nomineeDetails && nomineeDetails.is_appointee == '1' ? <div className="listrghtsideTrigr">{apointeeData}</div> : null }
                                            </Collapsible>
                                          </div>

                                          <div className="rghtsideTrigr m-b-40">
                                            <Collapsible trigger=" Contact information">
                                              <div className="listrghtsideTrigr">
                                                <div className="d-flex justify-content-end carloan">
                                                  <Link to ={`/Address_KSB/${productId}`}> Edit</Link>
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
                                              </Col>
                                                <Col sm={12} md={6}>
                                                    <FormGroup>
                                                    <div className="paymntgatway">
                                                          Select Payment Gateway
                                                          <div>
                                                          {/* <img src={require('../../assets/images/green-check.svg')} alt="" className="m-r-10" /> */}
                                                          <label className="customRadio3">
                                                          <Field
                                                              type="radio"
                                                              name='gateway'                                            
                                                              value='1'
                                                              key='1'  
                                                              onChange={(e) => {
                                                                  setFieldValue(`gateway`, e.target.value);
                                                              }}
                                                              checked={values.gateway == '1' ? true : false}
                                                          />
                                                              <span className="checkmark " /><span className="fs-14"> 
                                                          
                                                                  { policyHolderDetails && policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.paymentgateway && policyHolderDetails.bcmaster.paymentgateway.logo ? <img src={require('../../assets/images/'+ policyHolderDetails.bcmaster.paymentgateway.logo)} alt="" /> :
                                                                  null
                                                                  }
                                                              </span>
                                                          </label>
                                                          </div>

                                                          {policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.id === 2 ?
                                                          <div>
                                                          <label className="customRadio3">
                                                          <Field
                                                              type="radio"
                                                              name='gateway'                                            
                                                              value='2'
                                                              key='1'  
                                                              onChange={(e) => {
                                                                  setFieldValue(`gateway`, e.target.value);
                                                              }}
                                                              checked={values.gateway == '2' ? true : false}
                                                          />
                                                              <span className="checkmark " /><span className="fs-14"> 
                                                          
                                                                  { policyHolderDetails.bcmaster && policyHolderDetails.bcmaster.id === 2 ? <img src={require('../../assets/images/vedavaag.png')} alt="" /> :
                                                                  null
                                                                  }
                                                              </span>
                                                          </label>
                                                          </div> : null }
                                                    </div>
                                                  </FormGroup>
                                              </Col>
                                          </Row>

                                          <div className="d-flex justify-content-left resmb">
                                            <Button
                                              className="backBtn"
                                              onClick={this.nomineeDetails.bind(this, productId)}
                                            >
                                              Back
                                            </Button>
                                          {fulQuoteResp.QuotationNo && values.gateway != "" ? 
                                            <Button type="submit"
                                              className="proceedBtn"
                                            >
                                              Make Payment
                                            </Button> : null
                                          } 
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
                                    </div>
                                  </section>
                                  
                                </Form>
                            );
                        }}
                  </Formik>
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
