import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Button, Navbar, Nav, FormControl, NavDropdown, NavItem, Row, Col, Table, Tab, FormGroup } from 'react-bootstrap';
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { Textarea } from 'react-formik-ui'
import { Formik, Field, Form, ErrorMessage } from "formik";
import Footer from '../common/footer/Footer';
import * as Yup from "yup";
import { Link } from 'react-router-dom';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import axios from "../../shared/axios"
import swal from 'sweetalert';


class NewTicket extends Component {

    state = {
        helpMasterList: []
    };

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    getHelpMasterList = () => {
        axios
            .get(`/help-master`)
            .then(res => {
                this.setState({
                    helpMasterList: res.data.data
                });
            })
            .catch(err => {
                this.setState({
                    helpMasterList: []
                });
            });
    }

    fileUpload = (selectedFile) => {
        const formData = new FormData();

        formData.append(
            "fileName",
            selectedFile[0],
            selectedFile[0].name
        );

        axios
            .post("maintenance/uploadDocs", formData)
            .then(res => {
                swal(res.data.message, {
                    icon: "success"
                }).then(() => {
                    this.props.loadingStop();
                    this.getScheduleList();
                });
            })
            .catch(err => {
                //   swal("", err.data.message, 'error');
                this.props.loadingStop();
            });

    };

    componentDidMount() {
        this.getHelpMasterList()
    }

    render() {
        const { helpMasterList } = this.state
        console.log(helpMasterList);
        return (
            <>
                <div className="createtckt">
                    <div className="d-flex justify-content-left opntckt">
                        <div>
                            <h2>Open a New Ticket</h2>
                            <p>Please fill in the form below to open a new ticket.</p>
                            {/* <p class='class="text-primary'>
                                <Link class='class="text-primary' to="/TicketCount" activeClassName="active">Existing Tickets</Link>
                            </p> */}

                        </div>
                    </div>

                    <div className="opntckt">
                        <Row>
                            <Col sm={12} md={1}>Email:	</Col>
                            <Col sm={12} md={1}>test@gmail.com</Col>
                        </Row>
                        <Row>
                            <Col sm={12} md={1}>Client:</Col>
                            <Col sm={12} md={11}>XXXXXX</Col>
                        </Row>
                    </div>

                    <div className="justify-content-left opntckt">
                        <Formik
                            initialValues={{
                                help_topic: '',
                                issueSummery: ''
                            }}
                            validationSchema={Yup.object().shape({
                                help_topic: Yup.string()
                                    .required('Help Topic required'),
                                issueSummery: Yup.string()
                                    .required('Issue Summery is required')
                            })}
                            onSubmit={fields => {
                                alert('SUCCESS!! :-)\n\n' + JSON.stringify(fields, null, 4))
                            }}
                        >
                            {({ errors, status, touched }) => (
                                <Form>
                                    <div className="justify-content-left opntckt">
                                        <Col sm={12} md={6} className="pd-l-0">
                                            <h4>Help Topic</h4>
                                            <FormGroup>
                                                <Field name="help_topic" as="select" className={'form-control' + (errors.help_topic && touched.help_topic ? ' is-invalid' : '')}>
                                                    <option value="">Select Topic</option>
                                                    {helpMasterList.map((item, qIndex) => (
                                                        <option value={item.Id}>{item.name}</option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="help_topic" component="div" className="invalid-feedback" />
                                            </FormGroup>
                                        </Col>

                                    </div>
                                    <div class="form-group issue-area">
                                        <label for="usr">Issue Summary:</label>
                                        <FormGroup>
                                            <Field
                                                name="issueSummery"
                                                as="textarea"
                                                className={'form-control' + (errors.issueSummery && touched.issueSummery ? ' is-invalid' : '')}
                                                component={props =>
                                                    <CKEditor
                                                        config={{placeholder: "Write your details here"}} 
                                                        editor={ClassicEditor}
                                                        onInit={editor => {
                                                            // You can store the "editor" and use when it is needed.
                                                            console.log('Editor is ready to use!', editor);
                                                        }}
                                                        onChange={(event, editor) => {
                                                            const data = editor.getData();
                                                            console.log({ event, editor, data });
                                                        }}
                                                        onBlur={(event, editor) => {
                                                            console.log('Blur.', editor);
                                                        }}
                                                        onFocus={(event, editor) => {
                                                            console.log('Focus.', editor);
                                                        }}
                                                    />
                                                }
                                            />
                                            <ErrorMessage name="issueSummery" component="div" className="invalid-feedback" />
                                        </FormGroup>
                                    </div>
                                    <div class="form-group">
                                        <input type="file" key='1' name="attachment"
                                            accept=".png, .jpeg, .jpg, .doc, .docx, .xls, .xlsx, .pdf"
                                            onChange={(e) => {
                                                const { target } = e
                                                if (target.value.length > 0) {
                                                    this.fileUpload(e.target.files)
                                                } else {
                                                    target.reset();
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <button type="submit" className="btn btn-primary mr-2">Register</button>
                                        <button type="reset" className="btn btn-secondary">Reset</button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </>
        );
    }
}

export default NewTicket;