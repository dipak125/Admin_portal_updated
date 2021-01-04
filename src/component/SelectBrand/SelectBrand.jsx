import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BrandTable from '../common/BrandTable';

class SelectBrand extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
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

    render() {
        return (
            <>
                <HeaderSecond />
                <section className="d-flex justify-content-center brand m-t-60">
                    <div className="brand-bg pd-30">
                        <div className="d-flex justify-content-left">
                            <div className="brandhead">
                                <h4>Please select  your car brand </h4>
                                <p>Lets start with your car details</p>
                            </div>
                        </div>

                        <Row>
                            <Col sm={12} md={9}>
                                <BrandTable />

                                <div className="d-flex justify-content-left">
                                    <button className="backBtn">Back</button>
                                    <button className="proceedBtn" onClick={this.handleShow} href={'#'}>Continue</button>
                                </div>
                            </Col>

                            <Col sm={12} md={3}>
                                <div className="regisBox">
                                    <Row className="no-gutters m-b-25">
                                        <Col sm={6}>
                                            <div className="txtRegistr">Registration No.
                                            MH 01B4266</div>
                                        </Col>

                                        <Col sm={6} className="text-right">
                                            <button className="rgistrBtn">Edit</button>
                                        </Col>
                                    </Row>

                                    <Row className="no-gutters">
                                        <Col sm={6}>
                                            <div className="txtRegistr">Car Brand
                                                Honda</div>
                                        </Col>

                                        <Col sm={6} className="text-right">
                                            <button className="rgistrBtn">Edit</button>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </section>

                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Body>
                        <h3>Select Model </h3>
                        <img src={require('../../assets/images/image-02.svg')} alt="" />

                        <div className="modalForm">
                            <FormGroup>
                                <div className="main">
                                    <input
                                        name="search"
                                        type="text"
                                        placeholder="Search your variant "
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                            </FormGroup>
                            <Row className="no-gutters">
                                <Col sm={9} className="text-left m-b-10">
                                    <div className="modalboxInfo brdrbottom">Accord
                                        <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                <div className="brdrbottom">
                                <label class="customCheckBoxtwo">
                                <input type="checkbox" checked="checked"/>
                                <span class="checkmark"></span>
                                </label>
                                </div>
                                </Col>
                                    

                                <Col sm={9} className="text-left m-b-10">
                                    <div className="modalboxInfo brdrbottom">Honda City
                                        <span className="grey ml-5">1.2 E MT 1198CC</span>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                <div className="brdrbottom">
                                <label class="customCheckBoxtwo">
                                <input type="checkbox" checked="checked"/>
                                <span class="checkmark"></span>
                                </label>
                                </div>
                                </Col>

                                <Col sm={9} className="text-left m-b-10">
                                    <div className="modalboxInfo brdrbottom">NEON 
                                        <span className="grey ml-5">1.2 EX MT 1198CC</span>
                                    </div>
                                </Col>
                                <Col sm={3}>
                                <div className="brdrbottom">
                                <label class="customCheckBoxtwo">
                                <input type="checkbox" checked="checked"/>
                                <span class="checkmark"></span>
                                </label>
                                </div>
                                </Col>
                              </Row>  
                        </div>
                            {/* <Button className="modalBut" variant="primary" onClick={this.handleClose}>
                OK
              </Button> */}
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export default SelectBrand;