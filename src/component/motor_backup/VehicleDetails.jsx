import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
// import ReactTooltip from "react-tooltip";
import { Formik, Field, Form, FieldArray } from "formik";

const initialValue = {}

class VehicleDetails extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    selectBrand = (productId) => {
        this.props.history.push(`/Select-brand/${productId}`);
    }

    handleSubmit = () => {
        const {productId} = this.props.match.params 
        this.props.history.push(`/OtherComprehensive/${productId}`);
    }

    render() {
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
                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                <section className="brand m-t-11 m-b-25">
                    <div className="d-flex justify-content-left">
                        <div className="brandhead">
                            <h4 className="fs-18 m-b-30">Please share your vehicle details.</h4>
                        </div>
                    </div>
                    <div className="brand-bg">
                        <Formik initialValues={initialValue} onSubmit={this.handleSubmit}>
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
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='fPurchaseDate'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                                value = {values.fPurchaseDate}
                                                            >
                                                                <option value="">Select Year</option>
                                                                <option value="male">2020</option>
                                                                <option value="female">2019</option>
                                                                <option value="female">2018</option>
                                                                <option value="female">2017</option>
                                                                <option value="female">2016</option>
                                                                <option value="female">2015</option>
                                                                <option value="female">2014</option>
                                                                <option value="female">2013</option>
                                                                <option value="female">2012</option>
                                                                <option value="female">2011</option>
                                                                <option value="female">2010</option>
                                                                <option value="female">2009</option>
                                                            </Field>     
                                                            {errors.fPurchaseDate && touched.fPurchaseDate ? (
                                                            <span className="errorMsg">{errors.fPurchaseDate}</span>
                                                            ) : null}          
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={3}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name='fPurchaseMnt'
                                                                component="select"
                                                                autoComplete="off"                                                                        
                                                                className="formGrp"
                                                                value = {values.fPurchaseMnt}
                                                            >
                                                                <option value="">Select Month</option>
                                                                <option value="male">January</option>
                                                                <option value="female">February</option>
                                                                <option value="female">March</option>
                                                                <option value="female">April</option>
                                                                <option value="female">May</option>
                                                                <option value="female">June</option>
                                                                <option value="female">July</option>
                                                                <option value="female">August</option>
                                                                <option value="female">September</option>
                                                                <option value="female">October</option>
                                                                <option value="female">November</option>
                                                                <option value="female">December</option>
                                                            </Field>     
                                                            {errors.fPurchaseMnt && touched.fPurchaseMnt ? (
                                                            <span className="errorMsg">{errors.gender}</span>
                                                            ) : null}       
                                                            </div>
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
                                                                <Field
                                                                    name="Registration City"
                                                                    type="text"
                                                                    placeholder="Registration City"
                                                                    autoComplete="off"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                />
                                                                {errors.eia_account_no && touched.eia_account_no ? (
                                                                    <span className="errorMsg">{errors.eia_account_no}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={12}>
                                                        <FormGroup>
                                                            <div className="carloan">
                                                                <h4>Have you made a claim in your existing Policy</h4>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col sm={4}>
                                                        <FormGroup>
                                                            <div className="d-inline-flex m-b-35">
                                                                <div className="p-r-25">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='loan'                                            
                                                                        value='1'
                                                                        key='1'  
                                                                        onChange={(e) => {
                                                                            setFieldValue(`loan`, e.target.value);
                                                                        }}
                                                                        checked={values.loan == '1' ? true : false}
                                                                    />
                                                                        <span className="checkmark " /><span className="fs-14"> No, I haven't</span>
                                                                    </label>
                                                                </div>

                                                                <div className="">
                                                                    <label className="customRadio3">
                                                                    <Field
                                                                        type="radio"
                                                                        name='loan'                                            
                                                                        value='0'
                                                                        key='1'  
                                                                        onChange={(e) => {
                                                                            setFieldValue(`loan`, e.target.value);
                                                                        }}
                                                                        checked={values.loan == '0' ? true : false}
                                                                    />
                                                                        <span className="checkmark" />
                                                                        <span className="fs-14">Yes I have</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row className="m-b-30">
                                                    <Col sm={12} md={5} lg={5}>
                                                        <FormGroup>
                                                            <div className="fs-18">
                                                                Current No Claim Bonus
                                                       </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                                <Field
                                                                    name='noClaimBonus'
                                                                    component="select"
                                                                    autoComplete="off"                                                                        
                                                                    className="formGrp"
                                                                    value = {values.noClaimBonus}
                                                                >
                                                                    <option value="">--Select--</option>
                                                                    <option>0</option>
                                                                    <option>20</option>
                                                                    <option>25</option>
                                                                    <option>35</option>
                                                                    <option>45</option>
                                                                    <option>50</option>
                                                                </Field>     
                                                                {errors.noClaimBonus && touched.noClaimBonus ? (
                                                                <span className="errorMsg">{errors.noClaimBonus}</span>
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
                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Registration No.</div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Car Brand<br/>
                                                                <strong>BAJAJ AUTO</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Car Model<br/>
                                                                <strong>4S CHAMPION</strong></div>
                                                        </Col>

                                                        <Col sm={12} md={5} className="text-right">
                                                            <button className="rgistrBtn">Edit</button>
                                                        </Col>
                                                    </Row>

                                                    <Row className="m-b-25">
                                                        <Col sm={12} md={7}>
                                                            <div className="txtRegistr">Fuel Type<br/>
                                                                <strong>PETROL </strong></div>
                                                        </Col>
                                                    </Row>
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

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(VehicleDetails));