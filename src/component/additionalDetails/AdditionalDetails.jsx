import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup, DropdownButton, Dropdown } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Footer from '../common/footer/Footer';


class AdditionalDetails extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            showHide1: true
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

    handleClose = () => {
        this.setState({ show: false });
    }

    handleShow = () => {
        this.setState({ show: true });
    }

    hideHandle = (showType) => {
        if (showType == "first") {
            console.log(showType)
            this.setState({
                showHide1: false
            })
        } else {
            console.log(showType)
            this.setState({
                showHide1: false
            })
        }
    }

    showHandle = (showType) => {
        if (showType == "first") {
            console.log(showType)
            this.setState({
                showHide1: true
            })
        } else {
            console.log(showType)
            this.setState({
                showHide1: true
            })
        }
    }
    render() {
        const showHide1 = this.state.showHide1;
        return (
            <>
                <HeaderSecond />
                <div className="d-flex justify-content-center align-items-center m-t-60 hdtop"><img src={require('../../assets/images/checked.svg')} alt="" className="m-r-10" />
                Thank you for your payment! Please help us with additional details to prepare your policy. </div>
                <section className="d-flex justify-content-center brand m-t-11 m-b-25">
                    <div className="brand-bg pd-30">
                        <div className="d-flex justify-content-left">
                            <div className="brandhead m-b-10">
                                <h4>You are just few steps away in getting your policy ready. Please share a few more details. </h4>
                            </div>
                        </div>


                        <Row>
                            <Col sm={12} md={9} lg={9}>
                                <div className="d-flex justify-content-left carloan">
                                    <h4> Taken Car Loan</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <div className="d-inline-flex m-b-35">
                                            <div className="p-r-25">
                                                <label className="customRadio2">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                        checked={showHide1}
                                                        onClick={() => this.showHandle('first')}
                                                    />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                        onClick={() => this.hideHandle('first')}
                                                    />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Bank Name "
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Previous Insurer Name "
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> Owners Details</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Full Name"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <DropdownButton
                                                    alignRight
                                                    title="Gender"
                                                    id=""
                                                    className="insurerName"
                                                >
                                                    <Dropdown.Item eventKey="1">Male</Dropdown.Item>
                                                    <Dropdown.Item eventKey="2">Female</Dropdown.Item>
                                                </DropdownButton>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            {/* <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="DOB"
                                                />
                                            </div> */}
                                            <DatePicker
                                                // showTimeSelect
                                                // timeFormat="HH:mm"
                                                // timeIntervals={15}
                                                // timeCaption="time"
                                                minDate={new Date()}
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="DOB"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                className="datePckr"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="PAN Card No."
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Address"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Pincode"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Location"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <div className="d-flex justify-content-left carloan">
                                    <h4> Nominee Details</h4>
                                </div>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Name"
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <DropdownButton
                                                    alignRight
                                                    title="Gender"
                                                    id=""
                                                    className="insurerName"
                                                >
                                                    <Dropdown.Item eventKey="1">Male</Dropdown.Item>
                                                    <Dropdown.Item eventKey="2">Female</Dropdown.Item>
                                                </DropdownButton>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <DatePicker
                                                // showTimeSelect
                                                // timeFormat="HH:mm"
                                                // timeIntervals={15}
                                                // timeCaption="time"
                                                minDate={new Date()}
                                                dateFormat="dd MMM yyyy"
                                                placeholderText="DOB"
                                                peekPreviousMonth
                                                peekPreviousYear
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode="select"
                                                className="datePckr"
                                            />
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                    <FormGroup>
                                            <div className="insurerName m-b-25">
                                                <DropdownButton
                                                    alignRight
                                                    title="Relation"
                                                    id=""
                                                    className="insurerName"
                                                >
                                                    <Dropdown.Item eventKey="1">Father</Dropdown.Item>
                                                    <Dropdown.Item eventKey="2">Mother</Dropdown.Item>
                                                </DropdownButton>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                            <div className="insurerName">
                                                <h4 className="fs-16">Do you have EIA account</h4>
                                            </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <div className="d-inline-flex m-b-35">
                                            <div className="p-r-25">
                                                <label className="customRadio2">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                        checked={showHide1}
                                                        onClick={() => this.showHandle('first')}
                                                    />
                                                    <span className="checkmark " /><span className="fs-14"> Yes</span>
                                                </label>
                                            </div>

                                            <div className="">
                                                <label className="customRadio3">
                                                    <input
                                                        type="radio"
                                                        name="radio2"
                                                        onClick={() => this.hideHandle('first')}
                                                    />
                                                    <span className="checkmark" />
                                                    <span className="fs-14">No</span>
                                                </label>
                                            </div>
                                        </div>
                                        </FormGroup>
                                    </Col>
                                    <Col sm={12} md={4} lg={4}>
                                        <FormGroup>
                                        <div className="insurerName">
                                                <input
                                                    name="name"
                                                    type="text"
                                                    placeholder="Enter EIA no."
                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                />
                                            </div>
                                        </FormGroup>
                                    </Col>
                                </Row>
                                <div className="d-flex justify-content-left resmb">
                                    <button className="backBtn">Back</button>
                                    <button className="proceedBtn" onClick={this.handleShow} href={'#'}>Continue</button>
                                </div>

                            </Col>

                            <Col sm={12} md={3} lg={3}>
                                <div className="motrcar"><img src={require('../../assets/images/motor-car.svg')} alt="" /></div>
                            </Col>
                        </Row>

                    </div>
                </section>
                <Footer/>
            </>
        );
    }
}

export default AdditionalDetails;