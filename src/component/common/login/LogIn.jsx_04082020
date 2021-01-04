import React, { Component } from "react";
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../../store/actions/loader";
import {
    Row,
    Col,
    Button
} from "react-bootstrap";

import { Formik, Field, Form } from "formik";
import * as Yup from "yup";
import "./LogIn.css";
import { authProcess } from "../../../store/actions/auth";
import BaseComponent from '../../BaseComponent';

const initialValues = {
    emailAddress: "",
    password: ""
};

const loginvalidation = Yup.object().shape({
    emailAddress: Yup.string()
        .email("Please enter a valid email")
        .required("Please enter email id"),
    password: Yup.string().required("Please enter password")
});

class LogIn extends Component {
    state = {
        email: '',
        pass: '',
        rememberMe: 0,
        errMsg: null,
    }

    componentDidMount() {
        let bodyClass = [];
        bodyClass.length && document.body.classList.remove(...bodyClass);
        document.body.classList.add("loginBody");

        // check remember me option
        const loginData = JSON.parse(localStorage.getItem('loginData'));
        if (loginData) {
            this.setState({
                email: loginData.email,
                pass: loginData.pass,
                rememberMe: loginData.rememberMe ? 1 : 0
            });
        }
        this.handleSubmit();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.match.path === '/login' && !nextProps.loading) {
            this.props.history.push('/user-list');
        }
    }

    rememberMeHandler = (e) => {
        if (e.target.checked === true) {
            this.setState({ rememberMe: 1 });
        } else {
            this.setState({ rememberMe: 0 });
        }
    }

    // handleSubmit = (values, actions) => {
    //     //console.log('values', values); return false;
    //     this.props.loadingStart();
    //     values.rememberMe = this.state.rememberMe;
    //     this.setState({ errMsg: '' });

    //     this.props.onFormSubmit(values,
    //         () => {
    //             this.props.loadingStop();
    //             this.props.history.push('/Products');
    //         },
    //         (err) => {
    //             this.props.loadingStop();
    //             actions.setSubmitting(false);
    //             if (err.data.message) {
    //                 this.setState({ errMsg: err.data.message });
    //                 actions.resetForm();
    //             } else {
    //                 // console.log(err.data);
    //                 actions.setErrors(err.data);
    //             }
    //         }
    //     );
    // }

    handleSubmit = () => {
        //console.log('values', values); return false;
        let values = {}
        this.props.loadingStart();
        values.rememberMe = this.state.rememberMe;
        values.emailAddress= "csc@gmail.com";
        values.password= "12345";
        this.setState({ errMsg: '' });

        this.props.onFormSubmit(values,
            () => {
                this.props.loadingStop();
                this.props.history.push('/Products');
            },
            (err) => {
                this.props.loadingStop();
                if (err.data.message) {
                    this.setState({ errMsg: err.data.message });
                } else {
                    // console.log(err.data);
                }
            }
        );
    }


    render() {
        //console.log('state', this.state);
        const { email, pass, rememberMe } = this.state;

        const newInitialValues = Object.assign(initialValues, {
            emailAddress: email ? email : '',
            password: pass ? pass : ''
        });
        return (
            <BaseComponent>
                <div className="d-flex justify-content-center brand lginpg">
                    <div className="login-box-body">

                        {/* <Formik
                            initialValues={newInitialValues}
                            validationSchema={loginvalidation}
                            onSubmit={this.handleSubmit}
                        >
                            {({ values, errors, isValid, touched, isSubmitting }) => {
                                return (
                                    <Form>
                                        {this.state.errMsg ? (
                                            <Row className="show-grid">
                                                <Col md={12}>
                                                    <div className="errorMsg">{this.state.errMsg}</div>
                                                </Col>
                                            </Row>
                                        ) : null}
                                        <Row className="show-grid">
                                            <Col md={12}>
                                                <div className="form-group">
                                                    <label>Email ID</label>
                                                    <Field
                                                        name="emailAddress"
                                                        type="text"
                                                        className={`form-control`}
                                                        placeholder="Email"
                                                        autoComplete="off"
                                                        value={values.emailAddress}
                                                    />
                                                    {errors.emailAddress && touched.emailAddress ? (
                                                        <span className="errorMsg">{errors.emailAddress}</span>
                                                    ) : null}
                                                </div>
                                            </Col>
                                            <Col md={12}>
                                                <div className="form-group">
                                                    <label>Password</label>
                                                    <Field
                                                        name="password"
                                                        type="password"
                                                        className={`form-control`}
                                                        autoComplete="off"
                                                        placeholder="Password"
                                                        value={values.password}
                                                    />
                                                    {errors.password && touched.password ? (
                                                        <span className="errorMsg">{errors.password}</span>
                                                    ) : null}
                                                </div>
                                            </Col>
                                        </Row>
                                        <Row className="show-grid dropinput">
                                            <Col xs={8}>

                                                <label className="customCheckBox formGrp formGrp">
                                                 <input type="checkbox"
                                                        checked={rememberMe ? true : false}
                                                        value={rememberMe}
                                                        onChange={this.rememberMeHandler}
                                                        className="user-self"/>
                                                    <span className="checkmark mL-0"></span>
                                                    Remember Me
                                                </label>
                                            </Col>
                                            <Col xs={4}>
                                                <Button
                                                    type="submit"
                                                    className={`btn btn-default btn-md ${
                                                        isSubmitting ? "btn-disable" : "btn-custom-red"
                                                        } pull-right`}
                                                    disabled={isSubmitting ? true : false}
                                                >
                                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Form>
                                );
                            }}
                        </Formik> */}
                    </div>
                </div>
            </BaseComponent>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        // loading: state.auth.loading,
        token: state.auth.token
    }
}

const mapDispatchToProps = dispatch => {
    return {
        onFormSubmit: (data, onSuccess, onFailure) => dispatch(authProcess(data, onSuccess, onFailure)),
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(LogIn);


