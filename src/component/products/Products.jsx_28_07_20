import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Button, Navbar, Nav, Form, FormControl, NavDropdown, NavItem, Row, Col, Tab } from 'react-bootstrap';

import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";

import Table from '../common/Table';
import Footer from '../common/footer/Footer';


class Products extends Component {

    state = {
        product_id: ''
    };

    componentDidMount() {
        let product_id = sessionStorage.getItem("product_id")
        this.setState({
            product_id: product_id
        })

        // this.setState({
        //     product_id: '5221643668'
        // })


    }
    
    render() {
        const {product_id} = this.state
        console.log('product_id', product_id)
        return (
            <>
            <BaseComponent>
                <section className="d-flex justify-content-left">
                    <div className="flex-fill w-100">
                        <div className="container-fluid">
                            <div className="row">
                                <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2">
                                    <SideNav />
                                </div>
                                <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                    <div className="messageDeskSec">
                                        {(product_id == '5221671739') ?
                                        <Tab.Container id="left-tabs-example" defaultActiveKey="first"> 
                                        <Row>
                                            <Col sm={12}>
                                                <Nav variant="pills" className="flex-column">
                                                    <div className="d-flex justify-content-left messageDeskTab">
                                                    <div><Nav.Item><Nav.Link eventKey="first">Motor</Nav.Link></Nav.Item></div>
                                                    <div><Nav.Item><Nav.Link eventKey="second">Health</Nav.Link></Nav.Item></div>                                
                                                    </div>
                                                </Nav>
                                            </Col>
                                            <Col sm={12}>
                                                <Tab.Content>
                                                    <Tab.Pane eventKey="first">
                                                        <Table tabId='1'/>
                                                        <Footer />
                                                    </Tab.Pane>
                                                    <Tab.Pane eventKey="second">
                                                            <Table tabId='2'/>
                                                            <Footer />
                                                    </Tab.Pane>
                                                </Tab.Content>
                                            </Col>
                                        </Row>
                                        </Tab.Container>:
                                        (product_id == '5221643668') ? 
                                        <Tab.Container id="left-tabs-example" defaultActiveKey= "second"> 
                                            <Row>
                                                <Col sm={12}>
                                                    <Nav variant="pills" className="flex-column">
                                                        <div className="d-flex justify-content-left messageDeskTab">
                                                        <div><Nav.Item><Nav.Link eventKey="first">Motor</Nav.Link></Nav.Item></div>
                                                        <div><Nav.Item><Nav.Link eventKey="second">Health</Nav.Link></Nav.Item></div>
                                                        </div>
                                                    </Nav>
                                                </Col>
                                                <Col sm={12}>
                                                    <Tab.Content>
                                                        <Tab.Pane eventKey="first">
                                                            <Table tabId='1'/>
                                                            <Footer />
                                                        </Tab.Pane>
                                                        <Tab.Pane eventKey="second">
                                                            <Table tabId='2'/>
                                                            <Footer />
                                                        </Tab.Pane>
                                                    </Tab.Content>
                                                </Col>
                                            </Row>
                                        </Tab.Container> : <Tab.Container id="left-tabs-example" defaultActiveKey= "second"> 
                                            <Row>
                                                <Col sm={12}>
                                                    <Nav variant="pills" className="flex-column">
                                                        <div className="d-flex justify-content-left messageDeskTab">
                                                        <div><Nav.Item><Nav.Link eventKey="first">Motor</Nav.Link></Nav.Item></div>
                                                        <div><Nav.Item><Nav.Link eventKey="second">Health</Nav.Link></Nav.Item></div>
                                                        </div>
                                                    </Nav>
                                                </Col>
                                                <Col sm={12}>
                                                    <Tab.Content>
                                                        <Tab.Pane eventKey="first">
                                                            <Table tabId='1'/>
                                                            <Footer />
                                                        </Tab.Pane>
                                                        <Tab.Pane eventKey="second">
                                                            <Table tabId='2'/>
                                                            <Footer />
                                                        </Tab.Pane>
                                                    </Tab.Content>
                                                </Col>
                                            </Row>
                                        </Tab.Container>} 
                                    </div>

                                </div>

                            </div>
                        </div>
                    </div>
                </section>
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
  
  export default connect(
    mapStateToProps,
    mapDispatchToProps
  )(Products);