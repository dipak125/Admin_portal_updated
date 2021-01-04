import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';

import swal from 'sweetalert';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import axios from "../../shared/axios"
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import Encryption from '../../shared/payload-encryption';
import moment from "moment";
import Collapsible from 'react-collapsible';
import { Formik, Field, Form, FieldArray } from "formik";
import DatePicker from "react-datepicker";

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Download PDF"
            href="#"
            clicked={() => refObj.downloadDoc(cell)
            }
            id="tooltip-1"
        >
            <Button type="button" >
            <img src={require('../../assets/images/download.png')} alt="" />
            </Button> 
        </LinkWithTooltip>
    )
}

function quoteFormatter(cell) {
    return (cell ? (cell.quote_id ? cell.quote_id: null): null);
}

function premiumFormatter(cell) {
    return (cell ? (cell.net_premium ? cell.net_premium: null): null);
}  

function polNumFormatter(cell) {
    return (cell ? (cell.policy_note ? cell.policy_note.policy_no : null): null);
} 

function productFormatter(cell) {
    return (cell ? (cell.vehicletype ? cell.vehicletype.name : null): null);
} 

const newInitialValues = {}


class PolicySearch extends Component {
    state = {
        statusCount: [],
        policyHolder: [],
        searchValues: {},
        products: []

    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    fetchDashboard=(values,page_no)=>{

        const formData = new FormData();
        let encryption = new Encryption();
        page_no = page_no ? page_no : '1'
        if(values != []) {
            this.setState({
                searchValues : values
            });
            
            for (const key in values) {
                if (values.hasOwnProperty(key)) {
                  if(key == "start_date" || key == "end_date"){
                    formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
                  }
                  else {
                     formData.append(key, values[key]);
                  }          
                }
              }
        
        }

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        formData.append('page_no', page_no)   
        formData.append('policy_status', 'complete')
        formData.append('bc_agent_id', sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : "") 

        this.props.loadingStart();
        axios.post('bc/policy-customer',formData)
        .then(res=>{
            let statusCount = res.data.data ? res.data.data : []   
            let policyHolder = res.data.data ? res.data.data.policyHolder : []                      
            this.setState({
                statusCount, policyHolder
            });
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                statusCount: []
            });
        })
    
    }

    handleSubmit=(values)=>{

        const formData = new FormData();
        let encryption = new Encryption();
        if(values != []) {
            this.setState({
                searchValues : values
            });
            
            for (const key in values) {
                console.log("values--- ", values[key])
                if (values.hasOwnProperty(key) && values[key] != "") {
                  if(key == "start_date" || key == "end_date"){
                    formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
                  }
                  else {
                     formData.append(key, values[key]);
                  }          
                }
              }
        
        }

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        // formData.append('bcmaster_id', bc_data ? bc_data.agent_id : "")  
        // formData.append('page_no', 1)   
        // formData.append('policy_status', 'complete')
        // formData.append('bc_agent_id', bc_data ? bc_data.user_info.data.user.username : "",) 

        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        formData.append('page_no', 1)   
        formData.append('policy_status', 'complete')
        formData.append('bc_agent_id', sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : "") 

        this.props.loadingStart();
        axios.post('bc/policy-customer',formData)
        .then(res=>{
            let statusCount = res.data.data ? res.data.data : []   
            let policyHolder = res.data.data ? res.data.data.policyHolder : []                      
            this.setState({
                statusCount, policyHolder
            });
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                statusCount: []
            });
        })
    
    }

    downloadDoc = (refNumber) => {
        let file_path = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/policy_pdf_download.php?refrence_no=${refNumber}`
        console.log(file_path);
        const { policyId } = this.props.match.params
        const url = file_path;
        const pom = document.createElement('a');
    
        pom.style.display = 'none';
        pom.href = url;
    
        document.body.appendChild(pom);
        pom.click(); 
        window.URL.revokeObjectURL(url);
          
      }

    onPageChange(page, sizePerPage) {
        this.fetchDashboard(this.state.searchValues,page);
    }

    renderShowsTotal(start, to, total) {
        start = start ? start : 0
        to = to ? to : 0
        total = total ? total : 0
        return (
          <p style={ { color: 'blue' } }>
            From { start } to { to }, total is { total }
          </p>
        );
      }

    getAllProducts = () => {
        this.props.loadingStart();
        axios.get('all-product')
        .then(res => {
        this.setState({
            products: res.data.data ? res.data.data : [],
        });
        // this.fetchDashboard();
        this.props.loadingStop();
        })
        .catch(err => {
        this.props.loadingStop();
        });
    }

    handleClose = (val,setFieldValue,setFieldTouched) => {
        if(val == 1) {
            setFieldTouched('policy_no')
            setFieldValue('policy_no', "")
        }
        if(val == 2) {
            setFieldTouched('mobile_no')
            setFieldValue('mobile_no', "")
            setFieldTouched('email_id')
            setFieldValue('email_id', "")
        }
        if(val == 3) {
            setFieldTouched('start_date')
            setFieldValue('start_date', "")
            setFieldTouched('end_date')
            setFieldValue('end_date', "")
        }
        if(val == 4) {
            setFieldTouched('start_date')
            setFieldValue('start_date', "")
            setFieldTouched('end_date')
            setFieldValue('end_date', "")
            setFieldTouched('product_id')
            setFieldValue('product_id', "")
        }
        
    }

    componentDidMount() {
        this.getAllProducts()
    }


    render() {
        const { statusCount, policyHolder, products } = this.state
        var totalRecord = statusCount ? statusCount.totalRecord : 1
        var page_no = statusCount ? statusCount.page_no : 1 

        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: parseInt(page_no),  // which page you want to show as default
            sizePerPage: 10,
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            hideSizePerPage: true,
            remote: true,
            showTotal: true,
            onPageChange: this.onPageChange.bind(this),

        };

          
        return (
            <BaseComponent>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                        <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                            <div className="contBox m-b-45 tickedTable">
                            <h4 className="text-center mt-3 mb-3">Policy Search</h4>

                             <Formik initialValues={newInitialValues}
                                onSubmit={this.handleSubmit}
                                // validationSchema={ComprehensiveValidation}
                                >
                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form>
                                        <div className="rghtsideTrigr collinput W-90 m-b-30">
                                            <Collapsible trigger="Search with Policy Number" open={false} onClose = {this.handleClose.bind(this,1,setFieldValue,setFieldTouched)}>
                                                <div className="listrghtsideTrigr">
                                                <Row>
                                                <Col sm={12} md={6} lg={10}>
                                                    <Row>
                                                    <Col sm={12} md={2} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16">Enter policy Number</span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="policy_no"
                                                                    type="text"
                                                                    placeholder=""
                                                                    autoComplete="off"
                                                                    className="premiumslid"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.policy_no}
                                                                />
                                                                {errors.policy_no && touched.policy_no ? (
                                                                    <span className="errorMsg">{errors.policy_no}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                    </Row>
                                                    </Col>
                                                    <Button className={`proceedBtn`} type="submit" >
                                                        Search
                                                    </Button>
                                                </Row>
                                               
                                                <Row><Col>&nbsp;</Col></Row>
                                                </div>                    
                                            </Collapsible>
                                            <Collapsible trigger="Search with Proposer Details" open={false} onClose = {this.handleClose.bind(this,2,setFieldValue,setFieldTouched)}>
                                                <div className="listrghtsideTrigr">
                                                <Row>
                                                <Col sm={12} md={6} lg={5}>
                                                <Row>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16">Enter Mobile Number </span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="mobile_no"
                                                                    type="text"
                                                                    placeholder=""
                                                                    autoComplete="off"
                                                                    className="premiumslid"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.mobile_no}
                                                                />
                                                                {errors.mobile_no && touched.mobile_no ? (
                                                                    <span className="errorMsg">{errors.mobile_no}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    </Col>
                                               
                                                    <Col sm={12} md={6} lg={5}>
                                                    <Row>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16">Enter Email ID</span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <Field
                                                                    name="email_id"
                                                                    type="text"
                                                                    placeholder=""
                                                                    autoComplete="off"
                                                                    className="premiumslid"
                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                    value={values.email_id}
                                                                />
                                                                {errors.email_id && touched.email_id ? (
                                                                    <span className="errorMsg">{errors.email_id}</span>
                                                                ) : null}
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    </Col>
                                                    <Button className={`proceedBtn m-b-40`} type="submit" >
                                                        Search
                                                    </Button>
                                                </Row>
                                                
                                                </div>
                                            </Collapsible>
                                            <Collapsible trigger="Seach with Dates" open={false} onClose = {this.handleClose.bind(this,3,setFieldValue,setFieldTouched)}>
                                                <div className="listrghtsideTrigr">
                                                <Row>
                                                <Col sm={12} md={5}>
                                                    <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16"> From Date </span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={6}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="start_date"
                                                                // minDate={new Date()}
                                                                maxDate={new Date()}
                                                                autoComplete="off"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Start Date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.start_date }
                                                                onChange={(val) => {
                                                                    setFieldTouched('start_date');
                                                                    setFieldValue('start_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.start_date  && touched.start_date  ? (
                                                                <span className="errorMsg">{errors.start_date }</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    </Col>
                                                
                                                    <Col sm={12} md={5}>
                                                    <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16">To Date</span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={6}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="end_date"
                                                                // minDate={new Date()}
                                                                maxDate={new Date()}
                                                                autoComplete="off"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="End Date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.end_date}
                                                                onChange={(val) => {
                                                                    setFieldTouched('end_date');
                                                                    setFieldValue('end_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.end_date  && touched.end_date  ? (
                                                                <span className="errorMsg">{errors.end_date }</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    </Col>
                                                    <Button className={`proceedBtn`} type="submit" >
                                                        Search
                                                    </Button>
                                                </Row>
                                                
                                                <Row><Col>&nbsp;</Col></Row>
                                                </div>
                                            </Collapsible>
                                            <Collapsible trigger="Search with Dates & Products" open={false} onClose = {this.handleClose.bind(this,3,setFieldValue,setFieldTouched)}>
                                                <div  className="listrghtsideTrigr">
                                                <Row className="m-b-20">
                                                <Col sm={12} md={6} lg={5}>
                                                    <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16"> From Date </span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="start_date"
                                                                // minDate={new Date()}
                                                                maxDate={new Date()}
                                                                autoComplete="off"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="Start Date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.start_date }
                                                                onChange={(val) => {
                                                                    setFieldTouched('start_date');
                                                                    setFieldValue('start_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.start_date  && touched.start_date  ? (
                                                                <span className="errorMsg">{errors.start_date }</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={5}>
                                                    <Row>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16">To Date</span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <FormGroup>
                                                            <DatePicker
                                                                name="end_date"
                                                                // minDate={new Date()}
                                                                maxDate={new Date()}
                                                                autoComplete="off"
                                                                dateFormat="dd MMM yyyy"
                                                                placeholderText="End Date"
                                                                peekPreviousMonth
                                                                peekPreviousYear
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.end_date }
                                                                onChange={(val) => {
                                                                    setFieldTouched('end_date');
                                                                    setFieldValue('end_date', val); 
                                                                }}
                                                                
                                                            />
                                                            {errors.end_date  && touched.end_date  ? (
                                                                <span className="errorMsg">{errors.end_date }</span>
                                                            ) : null}
                                                        </FormGroup>
                                                    </Col>
                                                    </Row>
                                                    </Col>
                                                </Row>
                                                <Row>
                                                <Col sm={12} md={6} lg={10}>
                                                    <Row>
                                                    <Col sm={12} md={2} lg={4}>
                                                        <FormGroup>
                                                            <div className="insurerName">
                                                                <span className="fs-16">Products</span>
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={4}>
                                                        <FormGroup>
                                                            <div className="formSection">
                                                            <Field
                                                                name="product_id"
                                                                component="select"
                                                                autoComplete="off"
                                                                value={values.product_id}
                                                                className="formGrp"
                                                            >
                                                            <option value="">Products</option>
                                                            {products.map((productName, qIndex) => ( 
                                                                <option value={productName.id}>{productName.name}</option>    
                                                            ))}                                    
                                                            </Field>     
                                                            {errors.product_id && touched.product_id ? (
                                                                <span className="errorMsg">{errors.product_id}</span>
                                                            ) : null}        
                                                            </div>
                                                        </FormGroup>
                                                    </Col>
                                                    <Col sm={12} md={3} lg={2}>&nbsp;</Col>
                                                    </Row>
                                                    </Col>
                                                    <Button className={`proceedBtn`} type="submit" >
                                                        Search
                                                    </Button>
                                                </Row>
                                                
                                                </div>
                                            </Collapsible>
                                        </div>
                                    </Form>
                                        );
                                    }}
                                </Formik>
                                    

                                <Row>
                                    &nbsp;
                                </Row>
                                {policyHolder ? 
                                <div className="customInnerTable">
                                <BootstrapTable ref="table"
                                    data={policyHolder}
                                    pagination={true}
                                    options={options}
                                    remote={true}
                                    fetchInfo={{ dataTotalSize: totalRecord }}
                                    // striped
                                    // hover
                                    wrapperClasses="table-responsive"
                                >

                                    <TableHeaderColumn width='150px'  dataField="request_data" dataFormat={polNumFormatter} >Policy Number</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField='request_data' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell.start_date).format("MM-DD-YYYY") : '')} dataSort>Policy Start Date</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField='request_data' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell.end_date).format("MM-DD-YYYY") : '')} dataSort>Policy End Date</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="vehiclebrandmodel" dataFormat={productFormatter} >Product</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="first_name" >Proposer Name</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="mobile"  >Mobile Number</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="email_id"  >Email ID</TableHeaderColumn>
{/* 
                                    <TableHeaderColumn width='100px' tdStyle={{ whiteSpace: 'normal', width: '120px'}} dataField="request_data" dataFormat={quoteFormatter} >Quote Number</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' tdStyle={{ whiteSpace: 'normal', width: '120px'}} dataField="request_data" dataFormat={premiumFormatter} >Net Premium</TableHeaderColumn> */}
                                    

                                    <TableHeaderColumn width='100px'  dataField="reference_no" isKey dataAlign="center" dataFormat={ actionFormatter(this) }>Download</TableHeaderColumn>

                                </BootstrapTable>
                                </div>
                                : null }
                            </div>
                        </div>
                        <Footer />
                    </div>
                </div>
            </BaseComponent>
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

export default connect( mapStateToProps, mapDispatchToProps)(PolicySearch);
