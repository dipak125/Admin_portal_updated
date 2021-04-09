import React, { Component } from 'react';
import { Router, Route, Link } from 'react-router-dom';
import { Button, Navbar, Nav, Form, FormControl, NavDropdown, NavItem, Row, Col, Tab } from 'react-bootstrap';
// import HamburgMenu from '../../hamburg-menu/HamburgMenu';
import SideNav from '../../side-nav/SideNav';

export default class HeaderBottom extends Component {
    render() {
        return (
            <>
                <section className="headerButtom d-flex justify-content-left">
                    {/* <Navbar className="flex-fill" collapseOnSelect expand="lg" bg="light" variant="light">
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content-center">
                            <Nav>								
                                <Nav.Link href="#">Motor </Nav.Link>
                                <Nav.Link href="#">Health</Nav.Link>
                                <Link to="/#" className="nav-link" activeClassName="active">Personal Accident</Link>
                                <NavDropdown title="Upcoming Events" id="collasible-nav-dropdown">
                                    <NavDropdown.Item href="#">Action</NavDropdown.Item>
                                    <NavDropdown.Item href="#">Another action</NavDropdown.Item>
                                    <NavDropdown.Item href="#">Something</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item href="#">Separated link</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Navbar.Collapse>
                    </Navbar> */}

                        <div className="flex-fill w-100">
                                <div className="container-fluid">
                                        <div className="row">
                                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2">
                                        <SideNav />
                                        </div>


                                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                                                <div className="messageDeskSec">
                                                    <Tab.Container id="left-tabs-example" defaultActiveKey="first">
                                                        <Row>
                                                            <Col sm={12}>
                                                                <Nav variant="pills" className="flex-column">
                                                                    <div className="d-flex justify-content-left messageDeskTab">
                                                                        <div>
                                                                            <Nav.Item>
                                                                                <Nav.Link eventKey="first">Motor</Nav.Link>
                                                                            </Nav.Item>
                                                                        </div>
                                                                        <div>
                                                                            <Nav.Item>
                                                                                <Nav.Link eventKey="second">Health</Nav.Link>
                                                                            </Nav.Item>
                                                                        </div>
                                                                        <div>
                                                                            <Nav.Item>
                                                                                <Nav.Link eventKey="third">Personal Accident</Nav.Link>
                                                                            </Nav.Item>
                                                                        </div>
                                                                    </div>
                                                                </Nav>
                                                            </Col>
                                                            <Col sm={12}>
                                                                <Tab.Content>
                                                                    <Tab.Pane eventKey="first">
                                                                    Hello World!
                                                                    </Tab.Pane>
                                                                    <Tab.Pane eventKey="second">
                                                                    Health
                                                                </Tab.Pane>
                                                                    <Tab.Pane eventKey="third">
                                                                    Personal Accident
                                                                </Tab.Pane>
                                                                </Tab.Content>
                                                            </Col>
                                                        </Row>
                                                    </Tab.Container>
                                                </div>
                                            </div>
                                            
                                        </div>
                                </div>
                            </div>
                </section>
                {/* <HamburgMenu /> */}
                
            </>
        )
    }
}
