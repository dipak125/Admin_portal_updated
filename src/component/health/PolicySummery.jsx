import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import Collapsible from 'react-collapsible';

class PolicySummery extends Component {

    policyDetails = (productId) => {
        this.props.history.push(`/PolicyDetails/${productId}`);
    }

    thankYou = (productId) => {
        this.props.history.push(`/ThankYou/${productId}`);
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
                                <h4 className="text-center mt-3 mb-3">Arogya Sanjeevani Policy</h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <div className="d-flex justify-content-left carloan">
                                            <h4> Details of your Policy</h4>
                                        </div>
                                        <div className="brandhead m-b-30">
                                            <h4>Policy Number 004500003277045</h4>
                                        </div>

                                        <Row>
                                            <Col sm={12} md={9} lg={9}>

                                        <div className="rghtsideTrigr">
                                                <Collapsible trigger="Arogya Sanjeevani Policy, SBI General Insurance Company Limited" >
                                                    <div className="listrghtsideTrigr">
                                                   <Row>
                                                   <Col sm={12} md={3}><FormGroup>Sum Insured:</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> 300,000</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup>Applicable Taxes:</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> 1,468</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup>Gross Premium:</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> 8,155</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup>Net Premium;</FormGroup></Col>
                                                   <Col sm={12} md={3}><FormGroup><strong>Rs:</strong> 9,623</FormGroup></Col>
                                                   </Row>
                                                    </div>
                                                    
                                                    </Collapsible>
                                                    </div>

                                                    <div className="rghtsideTrigr">
                                                <Collapsible trigger=" Member Details" >
                                                    <div className="listrghtsideTrigr">
                                                    <Row>
                                                   <Col sm={12} md={6}>
                                                       <Row>
                                                       <Col sm={12} md={6}><FormGroup>Name:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>ma hs</FormGroup></Col>
                                                        </Row>
                                                   

                                                   
                                                       <Row>
                                                       <Col sm={12} md={6}><FormGroup>Date Of Birth:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>01-05-1981</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Relation With Proposer:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>Self</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Gender</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>male</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Date Of Birth:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>02-05-1984</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Relation With Proposer:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>Spouse</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Gender</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>female</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Date Of Birth:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>04-02-2002</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Relation With Proposer:</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>Child_1</FormGroup></Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}><FormGroup>Gender</FormGroup></Col>
                                                        <Col sm={12} md={6}><FormGroup>male</FormGroup></Col>
                                                        </Row>
                                                        </Col>
                                                   
                                                   </Row>
                                                   
                                                    </div>
                                                    
                                                    </Collapsible>
                                                    </div>

                                                    <div className="rghtsideTrigr m-b-40">
                                                <Collapsible trigger=" Contact information" >
                                                    <div className="listrghtsideTrigr">
                                                    <div className="d-flex justify-content-end carloan">
                                                    <a href="#"> Edit</a>
                                                </div>
                                                <Row>
                                                   <Col sm={12} md={6}>
                                                       <Row>
                                                       <Col sm={12} md={6}>Mobile number:</Col>
                                                        <Col sm={12} md={6}>8546789654</Col>
                                                        </Row>

                                                        <Row>
                                                       <Col sm={12} md={6}>Email:</Col>
                                                        <Col sm={12} md={6}>test@gmail.com</Col>
                                                        </Row>
                                                      </Col>
                                                    </Row>    
                                                    </div>
                                                    
                                                    </Collapsible>
                                                    </div>

                                                     <div className="d-flex justify-content-left resmb">
                                                        <button className="backBtn" onClick= {this.policyDetails.bind(this, productId )}>Back</button>
                                                        <button className="proceedBtn" onClick= {this.thankYou.bind(this, productId )}>Next</button>
                                                    </div>

                                                    </Col>

                                                    <Col sm={12} md={3}>
                                                <div className="regisBox">
                                                    <h3 className="medihead">Assurance of Insurance. Everywhere in India, for every Indian </h3>
                                                </div>
                                            </Col>
                                        </Row>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>
                </BaseComponent>
            </>
        );
    }
}

export default PolicySummery;