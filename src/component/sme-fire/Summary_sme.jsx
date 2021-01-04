import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import Collapsible from 'react-collapsible';
import { Formik, Field, Form } from "formik";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter, Link, Route } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";

import { setSmeRiskData,setSmeData,setSmeOthersDetailsData,setSmeProposerDetailsData } from "../../store/actions/sme_fire";
import { connect } from "react-redux";
import * as Yup from "yup";
import Encryption from '../../shared/payload-encryption';
import queryString from 'query-string';
import fuel from '../common/FuelTypes';
import swal from 'sweetalert';
import moment from "moment";

const initialValue = {}

const validatePremium = Yup.object().shape({
    refNo: Yup.string().notRequired('Reference number is required')
    .matches(/^[a-zA-Z0-9]*$/, function() {
        return "Please enter valid reference number"
    }),
    })

class Summary_sme extends Component {

    constructor(props) {
        super(props);

        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            refNo: "",
            whatsapp: "",
            fulQuoteResp: [],
            motorInsurance: [],
            error: [],
            purchaseData: [],
            error1: [],
            refNumber: "",
            paymentStatus: [],
            accessToken: "",
            PolicyArray: [],
            memberdetails: [],
            nomineedetails:[],
            relation: [],
            policyHolder: [],
            vehicleDetails: [],
            previousPolicy: [],
            request_data: [],
            breakin_flag: 0,
            salutationName:'',
            policyHolder_refNo: queryString.parse(this.props.location.search).access_id ? 
                                queryString.parse(this.props.location.search).access_id : 
                                localStorage.getItem("policyHolder_refNo")
        };
    }


    handleClose(e) {
        this.setState({ show: false, });
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleSubmit = (values) => {
        // let formDataNew = new FormData(); 
        // formDataNew.append('menumaster_id',this.props.menumaster_id)
        // formDataNew.append('policy_ref_no',this.props.policy_holder_ref_no)
        // this.props.loadingStart();
        // axios.post('/sme/create-quote',
        // formDataNew
        // ).then(res=>{
        //     axios.post('/sme/con-sequence',
        //     formDataNew
        //     ).then(res=>{
                const {productId} = this.props.match.params;
                this.props.loadingStop();
                this.props.history.push(`/AdditionalDetails_SME/${productId}`);
        //     }).
        //     catch(err=>{
        //         this.props.loadingStop();
        //     });
        // }).
        // catch(err=>{
        //     this.props.loadingStop();
        // });
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();
        
            this.props.loadingStart();
            axios.get(`sme/details/${policy_holder_ref_no}`)
            .then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                let rawData = decryptResp.data
                
                if(decryptResp.data.policyHolder.step_no > 0){

                    this.props.setData({
                        start_date:decryptResp.data.policyHolder.request_data.start_date,
                        end_date:decryptResp.data.policyHolder.request_data.end_date,
                        
                        policy_holder_id:decryptResp.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:decryptResp.data.policyHolder.request_data.id,
                        completed_step:decryptResp.data.policyHolder.step_no,
                        menumaster_id:decryptResp.data.policyHolder.menumaster_id
                    });

                    

                }

                if(decryptResp.data.policyHolder.step_no == 1 || decryptResp.data.policyHolder.step_no > 1){

                    let risk_arr = JSON.parse(decryptResp.data.policyHolder.smeinfo.risk_address);

                    this.props.setRiskData(
                        {
                            house_building_name:risk_arr.house_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:decryptResp.data.policyHolder.smeinfo.pincode,
                            pincode_id:decryptResp.data.policyHolder.smeinfo.pincode_id,

                            buildings_sum_insured:decryptResp.data.policyHolder.smeinfo.buildings_sum_insured,
                            content_sum_insured:decryptResp.data.policyHolder.smeinfo.content_sum_insured,
                            stock_sum_insured:decryptResp.data.policyHolder.smeinfo.stock_sum_insured
                        }
                    );
                }

                // if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

                //     this.props.setSmeOthersDetails({
                    
                //         Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                //         previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                //         previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                //         Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                //         insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                //         previous_city:decryptResp.data.policyHolder.previouspolicy.address
        
                //     });

                // }

                // if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){

                //     let address = JSON.parse(decryptResp.data.policyHolder.address);

                //     this.props.setSmeProposerDetails(
                //         {
                //             first_name:decryptResp.data.policyHolder.first_name,
                //             last_name:decryptResp.data.policyHolder.last_name,
                //             salutation_id:decryptResp.data.policyHolder.salutation_id,
                //             date_of_birth:decryptResp.data.policyHolder.dob,
                //             email_id:decryptResp.data.policyHolder.email_id,
                //             mobile:decryptResp.data.policyHolder.mobile,
                //             gender:decryptResp.data.policyHolder.gender,
                //             pan_no:decryptResp.data.policyHolder.pancard,
                //             gstn_no:decryptResp.data.policyHolder.gstn_no,

                //             com_street_name:address.street_name,
                //             com_plot_no:address.plot_no,
                //             com_building_name:address.house_building_name,
                //             com_block_no:address.block_no,
                //             com_house_flat_no:address.house_flat_no,
                //             com_pincode:decryptResp.data.policyHolder.pincode,
                //             com_pincode_id:decryptResp.data.policyHolder.pincode_id
                //         }
                //     );
                // }

                let pincode_area_arr = JSON.parse(decryptResp.data.policyHolder.pincode_response);
                
                this.setState( 
                    {
                        // salutationName:decryptResp.data.policyHolder.salutation.displayvalue ,
                        // pincodeArea:pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM != null ? pincode_area_arr.LCLTY_SUBRB_TALUK_TEHSL_NM : 0,
                        quoteId:decryptResp.data.policyHolder.request_data.quote_id != null ? decryptResp.data.policyHolder.request_data.quote_id : 0,
                        gst:decryptResp.data.policyHolder.request_data.service_tax != null ? decryptResp.data.policyHolder.request_data.service_tax : 0,
                        netPremium:decryptResp.data.policyHolder.request_data.net_premium != null ? decryptResp.data.policyHolder.request_data.net_premium : 0,
                        finalPremium:decryptResp.data.policyHolder.request_data.payable_premium != null ? decryptResp.data.policyHolder.request_data.payable_premium : 0,
                        rawData: rawData.policyHolder.smeinfo.smecoverages != null ? rawData.policyHolder.smeinfo.smecoverages : 0,
                    }
                );
                    this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111")
                return false;
            })
        
        
    }

    componentDidMount() {
        this.fetchPolicyDetails()
    }

    getGender = (gender) => {

        if(gender == 'm'){
            return 'Male';
        }else if(gender == 'f'){
            return 'Female';
        }

    }

    otherDetails = (productId) => {
        // productId === 5
        this.props.history.push(`/OtherDetails/${productId}`);
    }

    getPostcodeArea = (com_pincode_id) => {

    }

    render() {
        const { policyHolder, show, fulQuoteResp, motorInsurance, error, error1, refNumber, paymentStatus, relation, memberdetails,nomineedetails, vehicleDetails, breakin_flag, rawData} = this.state
        const { productId } = this.props.match.params
        // console.log("rawData-----",rawData)
        // console.log("data------",rawData.policyHolder.smeinfo)
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

            const sme_Coverages =
            rawData && rawData.length > 0
              ? rawData.map((listing, qIndex) => (                   
                  <tr>
                  <td>{listing.coverage.description} :</td>
                  <td>{ listing.coverage.description == "Architecture and Surveyor Fee (Upto 3% of Claim Amount)" || listing.coverage.description == "Removal of Debris (Upto 1% claim amount)" ? '   ----' : listing.sum_insured}
                  {/* <td>{listing.sum_insured == null ? 0 : listing.sum_insured}</td> */}</td>
                  <td>{listing.premium == null ? 0 : listing.premium}</td>
                </tr>
                ))
              : null;

        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>

                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SME Summary</h4>
                                <Formik initialValues={initialValue} onSubmit={this.handleSubmit}
                                validationSchema={validatePremium}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                        return (
                                            <Form>
                                                <section className="brand m-t-11 m-b-25">
                                                    <div className="d-flex justify-content-left">
                                                        <div className="brandhead m-b-10">
                                                            <h4>SME FIRE </h4>
                                                            <p>You are just one steps away in getting your policy ready.</p> <p>Your Quotation Number is: <span><strong>{this.state.quoteId}</strong></span></p>
                                                        </div>
                                                    </div>
                                                    <div className="brandhead m-b-30">
                                                        <h5>{errMsg}</h5>
                                                        <h5>{paymentErrMsg}</h5>
                                                        <h4>
                                                            {/* Policy Reference Number {fulQuoteResp.QuotationNo} */}
                                                        </h4>
                                                    </div>

                                                    <Row>
                                                        <Col sm={12} md={9} lg={9}>
                                                            {/* <div className="rghtsideTrigr">
                                                                <Collapsible trigger="Proposer Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        <div>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Title:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.salutationName}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>First Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.first_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Last Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.last_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Email:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.email_id}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Date Of Birth:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{moment(new Date(this.props.date_of_birth)).format('LL')}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Mobile Number:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.mobile}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Gender:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.getGender(this.props.gender)}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>GSTN:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.gstn_no}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Pan No.:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.pan_no}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>

                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                    </div>
                                                                </Collapsible>
                                                            </div>

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Communication Details" >
                                                                    <div className="listrghtsideTrigr">
                                                                        <div>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>House/Building Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_building_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Street Name:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_street_name}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Plot No.:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_plot_no}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Pincode:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.props.com_pincode}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>Pincode Area:</FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{this.state.pincodeArea}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                    </div>
                                                                </Collapsible>    
                                                            </div> */}

                                                            <div className="rghtsideTrigr m-b-30">
                                                                <Collapsible trigger="Policy Summary"  open= {true}>
                                                                    <div className="listrghtsideTrigr">
                                                                        <div>
                                                                            {/* <strong>Policy Summary:</strong>
                                                                            <br/> */}
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>
                                                                                                <strong>Policy Start Date :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{moment(new Date(this.props.start_date)).format('DD MMM yyyy')}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                                <Col sm={12} md={6}>
                                                                                    <Row>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup><strong>Policy End Date :</strong></FormGroup>
                                                                                        </Col>
                                                                                        <Col sm={12} md={6}>
                                                                                            <FormGroup>{moment(new Date(this.props.end_date)).format('DD MMM yyyy')}</FormGroup>
                                                                                        </Col>
                                                                                    </Row>
                                                                                </Col>
                                                                            </Row>
                                                                            <Row>
                                                                                <Col sm={12} md={6}>
                                                                                <table  style={({width: "45rem"})}>
                                                                                <thead>
                                                                                    <tr>
                                                                                    <th>Cover Type</th>
                                                                                    <th>Sum Insured(₹)</th>
                                                                                    <th>Premium(₹)</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                {sme_Coverages}
                                                                                </tbody>
                                                                                </table>
                                                                                </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <p></p>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup><strong>Net Premium(₹) :</strong></FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.state.netPremium}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup><strong>GST(₹) :</strong></FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.state.gst}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </Col>
                                                                                </Row>
                                                                                <Row>
                                                                                    <Col sm={12} md={6}>
                                                                                        <Row>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup><strong>Final Premium(₹) :</strong></FormGroup>
                                                                                            </Col>
                                                                                            <Col sm={12} md={6}>
                                                                                                <FormGroup>{this.state.finalPremium}</FormGroup>
                                                                                            </Col>
                                                                                        </Row>
                                                                                    </Col>
                                                                                </Row>
                                                                            <Row>
                                                                                <p></p>
                                                                            </Row>
                                                                        </div>
                                                                    </div>

                                                                </Collapsible>
                                                            </div>

                                                            <div className="d-flex justify-content-left resmb">
                                                                
                                                                <Button className={`backBtn`} type="button" onClick= {this.otherDetails.bind(this,productId)}>
                                                                    {isSubmitting ? 'Wait..' : 'Back'}
                                                                </Button> 
                                                                <Button className={`proceedBtn`} type="submit"  disabled={isSubmitting ? true : false}>
                                                                    Next
                                                                </Button> 

                                                            </div>
                                                        </Col>
                                                    </Row>
                                                </section>
                                            </Form>
                                        );
                                    }}
                                </Formik>

                            </div>
                            <Footer />
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

        policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
        menumaster_id:state.sme_fire.menumaster_id,
        policy_holder_id:state.sme_fire.policy_holder_id,

        start_date: state.sme_fire.start_date,
        end_date: state.sme_fire.end_date,


        house_building_name: state.sme_fire.house_building_name,
        block_no: state.sme_fire.block_no,
        street_name: state.sme_fire.street_name,
        content_sum_insured: state.sme_fire.content_sum_insured,
        house_flat_no: state.sme_fire.house_flat_no,
        pincode: state.sme_fire.pincode,
        pincode_id: state.sme_fire.pincode_id,
        buildings_sum_insured: state.sme_fire.buildings_sum_insured,
        content_sum_insured: state.sme_fire.content_sum_insured,
        stock_sum_insured: state.sme_fire.stock_sum_insured,

        first_name:state.sme_fire.first_name,
        last_name:state.sme_fire.last_name,
        salutation_id:state.sme_fire.salutation_id,
        date_of_birth:state.sme_fire.date_of_birth,
        email_id:state.sme_fire.email_id,
        mobile:state.sme_fire.mobile,
        gender:state.sme_fire.gender,
        pan_no:state.sme_fire.pan_no,
        gstn_no:state.sme_fire.gstn_no,

        com_street_name:state.sme_fire.com_street_name,
        com_plot_no:state.sme_fire.com_plot_no,
        com_building_name:state.sme_fire.com_building_name,
        com_block_no:state.sme_fire.com_block_no,
        com_house_flat_no:state.sme_fire.com_house_flat_no,
        com_pincode:state.sme_fire.com_pincode,
        com_pincode_id:state.sme_fire.com_pincode_id,

        
        previous_start_date:state.sme_fire.previous_start_date,
        previous_end_date:state.sme_fire.previous_end_date,
        Previous_Policy_No:state.sme_fire.Previous_Policy_No,
        insurance_company_id:state.sme_fire.insurance_company_id,
        previous_city:state.sme_fire.previous_city,
        


    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData:(data) => dispatch(setSmeData(data)),
        setRiskData:(data) => dispatch(setSmeRiskData(data)),
        setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
        setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
};

export default withRouter(
    connect(mapStateToProps, mapDispatchToProps)(Summary_sme)
);