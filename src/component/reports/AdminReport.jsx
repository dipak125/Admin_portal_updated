import React, { Component , Fragment} from 'react';
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
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import enGb from 'date-fns/locale/en-GB';
registerLocale('enGb', enGb)

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


function productFormatter(cell) {
    return (cell ? (cell.vehicletype ? cell.vehicletype.name : null): null);
} 

const newInitialValues = {
    to_date : "",
    from_date : "",
    batch_id: ""
}

const ComprehensiveValidation = Yup.object().shape({
    from_date: Yup.string().nullable().required("Please select From Date"),
    to_date: Yup.string().nullable().required("Please select To Date"),
    agent_id: Yup.string().max(15, "Agent Id can be maximum 15 characters"),
    batch_id: Yup.string().when(['product_type','group_prod_id'], {
        is: (product_type,group_prod_id) => (product_type == '2' && (group_prod_id == '23' || group_prod_id == '25')),
        then: Yup.string().required('Please select batch'),
        otherwise: Yup.string()
    }),
    intermediary_id: Yup.string().when(['partner_id'], {
        is: partner_id => partner_id == '12',
        then: Yup.string().required('Please select mi entities'),
        otherwise: Yup.string()
    }),
    user_id: Yup.string().when(['intermediary_id','partner_id'], {
        is: (intermediary_id,partner_id) => (intermediary_id != '' && partner_id == '12'),
        then: Yup.string().required('Please select user'),
        otherwise: Yup.string()
    }),
    product_type: Yup.string().when(['user_id', 'partner_id'], {
        is: (user_id,partner_id) => (user_id != '' && partner_id == '12'),
        then: Yup.string().required('Please select product type'),
        otherwise: Yup.string()
    }),
    group_prod_id: Yup.string().when(['product_type', 'partner_id'], {
        is: (product_type,partner_id) => (product_type == '2' && partner_id == '12'),
        then: Yup.string().required('Please select group product'),
        otherwise: Yup.string()
    })
    
})

class AdminReport extends Component {
    state = {
        statusCount: [],
        policyHolder: [],
        searchValues: {},
        products: [],
        showList: false,
        bcmaster_id: 0,
        role_id: 0,
        partners: [],
        page_no: 1,
        per_page: 10,
        last_page: 1,
        intermediaryVendorList: [],
        batchIds: [],
        partner_id: ""
    }
    
    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    convertUTCToTimezone = (utcDate, timezone = '+05:30', dateFormat = 'DD-MM-YYYY hh:mm') => {
        return moment(utcDate).utcOffset(timezone).format(dateFormat);
    }

    handleSubmit=(values, page_no)=>{

        if (isNaN(page_no)) {
            page_no = 1;
        }
        let fromDate = moment(values['from_date']);
        let toDate = moment(values['to_date']);
        let diffMon = toDate.diff(fromDate, 'days');

        if (fromDate > toDate) {
            swal(' From Date should be less than To Date ');
        } else if (diffMon > 31) {
            swal(' Date Range should not be more than 31 days ');
        } else {
            const formData = new FormData();
            let encryption = new Encryption();
            let postData = {}
            if(values != []) {
                this.setState({
                    searchValues : values,
                    showList: true
                });
                
                for (const key in values) {
                    if (values.hasOwnProperty(key) && values[key] != "") {
                    if(key == "from_date" || key == "to_date"){
                        postData[key] = moment(values[key]).format("YYYY-MM-DD");
                    }
                    else {
                        postData[key] = values[key];
                    }          
                    }
                }
            }

            postData['bcmaster_id'] = this.state.bcmaster_id;
            postData['page'] = page_no;
            postData['policy_status'] = 'complete';
            postData['role_id'] = this.state.role_id;

            formData.append('enc_data',encryption.encrypt(JSON.stringify(postData)));

            console.log("POST dATA SUBMIT--------------- ", postData);

            this.props.loadingStart();
            axios.post('admin/report-list',formData)
            .then(res=>{

                let encryption = new Encryption();
                let response = JSON.parse(encryption.decrypt(res.data)); 
                console.log("submit response --------------- ", response);

                let statusCount = response.data && response.data.report ? response.data.report : [];   
                let responseData = response.data && response.data.report ? response.data.report.data : []    
                page_no = response.data && response.data.report ? response.data.report.current_page : 1 ;
                let last_page = response.data && response.data.report ? response.data.report.last_page : 1 ;
                let per_page = response.data && response.data.report ? response.data.report.per_page : 10;

                let policyHolder = [];
                for (const reportData in responseData) {
                    let formatedDate = this.convertUTCToTimezone(responseData[reportData]['PaymentDate']);
                    responseData[reportData]['PaymentDate'] = formatedDate;
                    policyHolder.push(responseData[reportData]);
                }
                console.log("dercypt-Resp--------------- ", response);
                this.setState({
                    statusCount, policyHolder, page_no, per_page, last_page
                });
                this.props.loadingStop();
            }).
            catch(err=>{
                this.props.loadingStop();
                let encryption = new Encryption();
                let response = JSON.parse(encryption.decrypt(err.data)); 
                console.log("submit err --------------- ", response);
                this.setState({
                    statusCount: []
                });
            })
        }   
    }

    getDownload = () => {
        const formData = new FormData();
        let encryption = new Encryption();
        let values = this.state.searchValues;
        let postData = {}

        if(values != []) {            
            for (const key in values) {
                if (values.hasOwnProperty(key) && values[key] != "") {
                    if(key == "from_date" || key == "to_date"){
                        // formData.append(key, moment(values[key]).format("YYYY-MM-DD"));
                        postData[key] = moment(values[key]).format("YYYY-MM-DD");
                    }
                    else {
                        // formData.append(key, values[key]);
                        postData[key] = values[key];
                    }          
                }
            }       
        } 
        postData['page'] = this.state.page_no;
        postData['bcmaster_id'] = this.state.bcmaster_id;
        postData['policy_status'] = 'complete';
        postData['role_id'] = this.state.role_id;

        formData.append('enc_data',encryption.encrypt(JSON.stringify(postData)));
        console.log("download postdata---------------- ", postData)

        this.props.loadingStart();
        axios.post('admin/report-download',formData)
        .then(res=>{

            let encryption = new Encryption();
            let response = JSON.parse(encryption.decrypt(res.data)); 
            console.log("download resp---------------- ", response)
            this.props.loadingStop();
            this.downloadDoc(response.data.report_id)
            // swal.fire('Report Id');
        }).
        catch(err=>{
            let error = JSON.parse(encryption.decrypt(err.data)); 
            console.log("download error---------------- ", error)
            this.props.loadingStop();
            this.setState({
                statusCount: 1
            });
        })
    }

    downloadDoc = (refNumber) => {
        let file_path = `${process.env.REACT_APP_PAYMENT_URL}/admin_report_download.php?report_id=${refNumber}&bcmaster_id=${this.state.bcmaster_id}`
        // console.log(file_path);
        const { policyId } = this.props.match.params
        const url = file_path;
        const pom = document.createElement('a');
    
        pom.style.display = 'none';
        pom.href = url;
    
        document.body.appendChild(pom);
        pom.click(); 
        window.URL.revokeObjectURL(url);
          
    }

    onPageChange = async (page, sizePerPage) => {
        this.handleSubmit(this.state.searchValues, page);
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
        axios.get('admin/products')
        .then(res => {
        
            let encryption = new Encryption();
            let response = JSON.parse(encryption.decrypt(res.data));
            this.setState({
                products: response.data ? response.data : [],
            });
            // this.fetchDashboard();
            this.props.loadingStop();
        })
        .catch(err => {
        this.props.loadingStop();
        let encryption = new Encryption();
        let response = JSON.parse(encryption.decrypt(err.data));
        console.log("err ----------- ", response)
        });
    }

    getVendors = (partner_id) => {
        this.props.loadingStart();
        axios.get('admin/intermediaryVendors')
        .then(res => {
        
            let encryption = new Encryption();
            let response = JSON.parse(encryption.decrypt(res.data));
            this.setState({
                intermediaryVendorList: response.data ? response.data : [],
            });
            // this.fetchDashboard();
            this.props.loadingStop();
        })
        .catch(err => {
        this.props.loadingStop();
        let encryption = new Encryption();
        let error = JSON.parse(encryption.decrypt(err.data));
        console.log("err resp ---- ", error)
        });
    }

    getUserId = (parent_id) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let postData = {}
        postData['parent_id'] = parent_id;

        formData.append('enc_data',encryption.encrypt(JSON.stringify(postData)));

        this.props.loadingStart();
        axios.post('admin/getUserId',formData)
        .then(res => {
        
            let encryption = new Encryption();
            let response = JSON.parse(encryption.decrypt(res.data));
            console.log("resp ---- ", response)
            this.setState({
                userId: response.data ? response.data : [],
            });
            // this.fetchDashboard();
            this.props.loadingStop();
        })
        .catch(err => {
        this.props.loadingStop();
        let encryption = new Encryption();
        let error = JSON.parse(encryption.decrypt(err.data));
        console.log("err resp ---- ", error)
        });
    }

    getBatchID = (user_id,from_date,to_date,group_prod_id) => {
        const formData = new FormData();
        let encryption = new Encryption();
        let postData = {}
        postData['from_date'] = moment(from_date).format("YYYY-MM-DD");
        postData['to_date'] = moment(to_date).format("YYYY-MM-DD");
        postData['user_id'] = user_id;
        postData['group_prod_id'] = group_prod_id;
        

        formData.append('enc_data',encryption.encrypt(JSON.stringify(postData)));
        console.log("download postdata---------------- ", postData)

        this.props.loadingStart();
        axios.post('admin/getBatchId',formData)
        .then(res => {
        
            let encryption = new Encryption();
            let response = JSON.parse(encryption.decrypt(res.data));
            console.log("resp ---- ", response)
            this.setState({
                batchIds: response.data ? response.data : [],
            });
            // this.fetchDashboard();
            this.props.loadingStop();
        })
        .catch(err => {
        this.props.loadingStop();
        let encryption = new Encryption();
        let error = JSON.parse(encryption.decrypt(err.data));
        console.log("err resp ---- ", error)
        });
    }

    getRoleData = async (roleData) => {
        if (roleData && roleData !== null) {
            let role_id = roleData.rolemaster_id;
            let bcmaster_id = role_id === 1 ? 0 : roleData.bcmaster_id;
            let partners = [];

            if (role_id === 1) {
                this.props.loadingStart();
                await axios.get('admin/vendors')
                    .then(res => {
                        
                        let encryption = new Encryption();
                        let response = JSON.parse(encryption.decrypt(res.data));
            
                        partners = response.data ? response.data : [];
                        this.props.loadingStop();
                    })
                    .catch(err => {
                        this.props.loadingStop();
                    });
            }

            this.setState({
                bcmaster_id ,
                role_id , 
                partners
            })
        }
    }

    handleClose = (val,setFieldValue,setFieldTouched) => {
        if(val == 1) {
            // setFieldTouched('policy_no')
            // setFieldValue('policy_no', "")
        }       
    }

    componentDidMount() {
        this.getAllProducts();
        let encryption = new Encryption();

        let role_admin = JSON.parse(encryption.decrypt(sessionStorage.getItem('role_admin')));
        let role_details = encryption.decrypt(sessionStorage.getItem('role_details'));
        if (role_admin !== false && role_details !== null) {
            let roleData = JSON.parse(role_details);
            this.getRoleData(roleData);
        }
    }


    render() {
        const { statusCount, policyHolder, products, partners, role_id, page_no, per_page, last_page, intermediaryVendorList, batchIds, userId, partner_id } = this.state
        var totalRecord = statusCount ? statusCount.total : 1
        // var page_no = page_no ? page_no : 1 

        // console.log("StatusCount", statusCount, statusCount.total_count)

        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: parseInt(page_no),  // which page you want to show as default
            sizePerPage: per_page,
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
                            <h4 className="text-center mt-3 mb-3">Admin Report</h4>

                             <Formik initialValues={newInitialValues}
                                onSubmit={this.handleSubmit}
                                validationSchema={ComprehensiveValidation}
                                >
                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {

                                return (
                                    <Form autoComplete="off">
                                        <div className="rghtsideTrigr collinput m-b-30">
                                            {/* <div>
                                                {errors.from_date}
                                            </div> */}
                                            {/* <Collapsible trigger="Search with Dates & Products" open={false} onClose = {this.handleClose.bind(this,3,setFieldValue,setFieldTouched)}> */}
                                                <div  className="listrghtsideTrigr">
                                                <Row className="m-b-20">
                                                    <Col sm={12} md={4} lg={4}>
                                                        <Row>
                                                            <Col sm={12} md={4} lg={4}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <span className="fs-16"> From Date </span>
                                                                        {/* <span className="impField">*</span> */}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={8} lg={8}>
                                                                <FormGroup>
                                                                <DatePicker
                                                                    name="from_date"
                                                                    // minDate={new Date(minDate)}
                                                                    locale="enGb"
                                                                    maxDate={new Date()}
                                                                    dateFormat="dd MMM yyyy"
                                                                    placeholderText="Start Date"
                                                                    peekPreviousMonth
                                                                    peekPreviousYear
                                                                    showMonthDropdown
                                                                    showYearDropdown
                                                                    dropdownMode="select"
                                                                    className="datePckr inputfs12"
                                                                    selected={values.from_date}
                                                                    onChange={(val) => {
                                                                        setFieldTouched('from_date');
                                                                        setFieldValue('from_date', val); 
                                                                        setFieldValue('product_type', "");
                                                                        setFieldValue('batch_id', "");                                                                                                                                            
                                                                    }}
                                                                /> 
                                                                    {errors.from_date || !touched.from_date  ? (
                                                                        <span className="errorMsg">{errors.from_date }</span>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col sm={12} md={4} lg={4}>
                                                        <Row>
                                                            <Col sm={12} md={4} lg={4}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <span className="fs-16">To Date</span>
                                                                        {/* <span className="impField">*</span> */}
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={8} lg={8}>
                                                                <FormGroup>
                                                                    <DatePicker
                                                                        name="to_date"
                                                                        // minDate={new Date(minDate)}
                                                                        locale="enGb"
                                                                        maxDate={new Date()}
                                                                        dateFormat="dd MMM yyyy"
                                                                        placeholderText="End Date"
                                                                        peekPreviousMonth
                                                                        peekPreviousYear
                                                                        showMonthDropdown
                                                                        showYearDropdown
                                                                        dropdownMode="select"
                                                                        className="datePckr inputfs12"
                                                                        selected={values.to_date}
                                                                        onChange={(val) => {
                                                                            setFieldTouched('to_date');
                                                                            setFieldValue('to_date', val); 
                                                                            setFieldValue('product_type', "");
                                                                            setFieldValue('batch_id', "");
                                                                        }}
                                                                    /> 
                                                                    {errors.to_date || !touched.to_date  ? (
                                                                        <span className="errorMsg">{errors.to_date }</span>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                </Row>
                                                {role_id === 1 ? (
                                                    <Row>
                                                        <Col sm={12} md={4} lg={4}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Partners</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                        <Field
                                                                            name="partner_id"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={values.partner_id}
                                                                            className="formGrp"
                                                                            onChange= {(e)=>{
                                                                                if(e.target.value == '12') {
                                                                                    this.getVendors(e.target.value)
                                                                                }
                                                                                setFieldValue('partner_id', e.target.value)
                                                                                this.setState({partner_id: e.target.value, policyHolder: []})
                                                                                setFieldValue('product_type', "");
                                                                                setFieldValue('batch_id', "");
                                                                                setFieldValue('intermediary_id', "");
                                                                                setFieldValue('user_id', "");  
                                                                                setFieldValue('product_id', "");
                                                                                setFieldValue('agent_id', ""); 
                                                                            }}
                                                                        >
                                                                        <option value="">Partners</option>
                                                                        {partners && partners.map((partnerName, qIndex) => ( 
                                                                            <option key={partnerName.id} value={partnerName.id} key  ={qIndex}>{partnerName.vendor_name}</option>    
                                                                        ))}                                    
                                                                        </Field>     
                                                                        {errors.partner_id && touched.partner_id ? (
                                                                            <span className="errorMsg">{errors.partner_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                
                                                            </Row>
                                                        </Col>
                                                        
                                                        {values.partner_id == '12' ?
                                                        <Fragment>
                                                            <Col sm={12} md={4} lg={4}>
                                                                <Row>
                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <span className="fs-16">Mi entities/ Agents</span>
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={8} lg={8}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                            <Field
                                                                                name="intermediary_id"
                                                                                component="select"
                                                                                autoComplete="off"
                                                                                value={values.intermediary_id}
                                                                                className="formGrp"
                                                                                onChange = {(e)=> {
                                                                                    this.getUserId(e.target.value)
                                                                                    setFieldValue('product_type','')
                                                                                    setFieldValue('user_id','')
                                                                                    setFieldValue('intermediary_id',e.target.value)
                                                                                }}
                                                                            >
                                                                            <option value="">Partners</option>
                                                                            {intermediaryVendorList && intermediaryVendorList.map((partnerName, qIndex) => ( 
                                                                                <option key={partnerName.id} value={partnerName.id}>{partnerName.intermediary_name}</option>    
                                                                            ))}                                    
                                                                            </Field>     
                                                                            {errors.intermediary_id && touched.intermediary_id ? (
                                                                                <span className="errorMsg">{errors.intermediary_id}</span>
                                                                            ) : null}        
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    
                                                                </Row>
                                                            </Col>
                                                            {values.intermediary_id ?
                                                            <Col sm={12} md={4} lg={4}>
                                                                <Row>
                                                                    <Col sm={12} md={4} lg={4}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <span className="fs-16">User</span>
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={8} lg={8}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                            <Field
                                                                                name="user_id"
                                                                                component="select"
                                                                                autoComplete="off"
                                                                                value={values.user_id}
                                                                                className="formGrp" 
                                                                                onChange= {(e)=> {
                                                                                    setFieldValue('user_id', e.target.value)
                                                                                    setFieldValue('product_type','')
                                                                                }}
                                                                            >
                                                                            <option value="">Users</option>
                                                                            {userId && userId.map((partnerName, qIndex) => ( 
                                                                                <option key={qIndex} value={partnerName.id}>{partnerName.email_id}</option>    
                                                                            ))}                           
                                                                            </Field>     
                                                                            {errors.user_id && touched.user_id ? (
                                                                                <span className="errorMsg">{errors.user_id}</span>
                                                                            ) : null}        
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    
                                                                </Row>
                                                            </Col> : null }
                                                        </Fragment> : 
                                                        <Fragment>
                                                        <Col sm={12} md={4} lg={4}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Product</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
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
                                                                        {products && products.map((productName, qIndex) => ( 
                                                                            <option key={productName.id} value={productName.id}>{productName.name}</option>    
                                                                        ))}                                    
                                                                        </Field>     
                                                                        {errors.product_id && touched.product_id ? (
                                                                            <span className="errorMsg">{errors.product_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                
                                                            </Row>
                                                        </Col>
                                                        <Col sm={12} md={4} lg={4}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Agent ID</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                        <Field
                                                                            name="agent_id"
                                                                            type="text"
                                                                            placeholder=""
                                                                            autoComplete="off"
                                                                            value={values.agent_id}
                                                                            className="formGrp"
                                                                        />     
                                                                        {errors.agent_id && touched.agent_id ? (
                                                                            <span className="errorMsg">{errors.agent_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                {/* <Col sm={12} md={3} lg={2}>&nbsp;</Col> */}
                                                            </Row>
                                                        </Col>
                                                        </Fragment>
                                                        }
                                                        </Row>
                                                    ) : (
                                                    <Row>
                                                        <Col sm={12} md={6} lg={6}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Product</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
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
                                                                        {products && products.map((productName, qIndex) => ( 
                                                                            <option key={productName.id} value={productName.id}>{productName.name}</option>    
                                                                        ))}                                    
                                                                        </Field>     
                                                                        {errors.product_id && touched.product_id ? (
                                                                            <span className="errorMsg">{errors.product_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                
                                                            </Row>
                                                        </Col>
                                                        <Col sm={12} md={6} lg={6}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Agent ID</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                        <Field
                                                                            name="agent_id"
                                                                            type="text"
                                                                            placeholder=""
                                                                            autoComplete="off"
                                                                            value={values.agent_id}
                                                                            className="formGrp"
                                                                        />     
                                                                        {errors.agent_id && touched.agent_id ? (
                                                                            <span className="errorMsg">{errors.agent_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                {/* <Col sm={12} md={3} lg={2}>&nbsp;</Col> */}
                                                            </Row>
                                                        </Col>
                                                    </Row>
                                                )}
                                                {values.partner_id == '12' && values.user_id ?
                                                    <Row>    
                                                        <Col sm={12} md={4} lg={4}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Product Type</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                        <Field
                                                                            name="product_type"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={values.product_type}
                                                                            className="formGrp"
                                                                            onChange = {(e)=> {
                                                                                if(e.target.value == '1'){     
                                                                                    setFieldValue('batch_id', '')                           
                                                                                }
                                                                                setFieldValue('product_type', e.target.value)
                                                                                setFieldValue('group_prod_id', '')
                                                                                
                                                                            }}
                                                                           
                                                                        >
                                                                        <option value="">Products</option>
                                                                        <option key={1} value={1}>Retail</option>    
                                                                        <option key={2} value={2}>Group</option>                              
                                                                        </Field>     
                                                                        {errors.product_type && touched.product_type ? (
                                                                            <span className="errorMsg">{errors.product_type}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                
                                                            </Row>
                                                        </Col>
                                                        {values.partner_id == '12' && values.user_id && values.product_type == '2' ?
                                                        <Col sm={12} md={4} lg={4}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Group Product</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                        <Field
                                                                            name="group_prod_id"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={values.group_prod_id}
                                                                            className="formGrp"
                                                                            onChange = {(e)=> {
                                                                                if(values.from_date && values.to_date && values.product_type == '2' && (e.target.value == '23' || e.target.value == '25')){
                                                                                    this.getBatchID(values.user_id,values.from_date,values.to_date, e.target.value)
                                                                                }
                                                                                setFieldValue('group_prod_id', e.target.value)
                                                                                setFieldValue('batch_id', '')
                                                                            }}
                                                                        >
                                                                        <option value="">Select Group Product</option>
                                                                        <option value="21">Arogya Sanjeevani Micro - Group</option>
                                                                        <option value="23">KSB Micro - Group</option>
                                                                        <option value="25">Jan Rakshak Micro - Group</option>
                                                                                                          
                                                                        </Field>     
                                                                        {errors.group_prod_id && touched.group_prod_id ? (
                                                                            <span className="errorMsg">{errors.group_prod_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col> : null }
                                                        {values.partner_id == '12' && values.user_id && values.product_type == '2' && (values.group_prod_id == '23' || values.group_prod_id == '25') ?
                                                        <Col sm={12} md={4} lg={4}>
                                                            <Row>
                                                                <Col sm={12} md={4} lg={4}>
                                                                    <FormGroup>
                                                                        <div className="insurerName">
                                                                            <span className="fs-16">Batch Id</span>
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                                <Col sm={12} md={8} lg={8}>
                                                                    <FormGroup>
                                                                        <div className="formSection">
                                                                        <Field
                                                                            name="batch_id"
                                                                            component="select"
                                                                            autoComplete="off"
                                                                            value={values.batch_id}
                                                                            className="formGrp"
                                                                            onChange = {(e)=> {
                                                                                setFieldValue('batch_id',e.target.value)
                                                                            }}
                                                                        >
                                                                        <option value="">Batch Id</option>
                                                                        {batchIds && batchIds.map((partnerName, qIndex) => ( 
                                                                            <option key={partnerName.id} value={partnerName.id}>{partnerName.batch_no}</option>    
                                                                        ))}                                    
                                                                        </Field>     
                                                                        {errors.batch_id && touched.batch_id ? (
                                                                            <span className="errorMsg">{errors.batch_id}</span>
                                                                        ) : null}        
                                                                        </div>
                                                                    </FormGroup>
                                                                </Col>
                                                            </Row>
                                                        </Col> : null }
                                                    </Row> : null
                                                    }
                                                    <Row>
                                                        <Col sm={12} md={12} lg={12} style={{ textAlign: 'center' }}>
                                                            <Button className={`proceedBtn`} type="submit" >
                                                                Search
                                                            </Button>                                                                                                                      
                                                        </Col>
                                                    </Row>
                                                
                                                </div>
                                            {/* </Collapsible> */}
                                        </div>
                                    </Form>
                                        );
                                    }}
                                </Formik>
                                    

                                <Row>
                                    
                                </Row>
                                {policyHolder && this.state.showList === true ? 
                                <div className="customInnerTable dataTableCustom">
                                    {policyHolder.length === 0 ? null : (
                                        <div className="row">
                                            <div className="col" style={{ textAlign: 'center' }}>
                                                <Button className={`proceedBtn`} type="button" 
                                                    onClick={() =>
                                                        this.getDownload()
                                                    }
                                                >
                                                    Download Report
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    <br />
                                    {partner_id == '12' ? 
                                    <BootstrapTable ref="table"
                                    data={policyHolder}
                                    pagination={true}
                                    options={options}
                                    remote={true}
                                    fetchInfo={{ dataTotalSize: totalRecord }}
                                    // striped
                                    // hover
                                    //wrapperClasses="table-responsive "
                                    className="reportclass"
                                >
                                    <TableHeaderColumn isKey dataField="PolicyHolderId"  >Policy Holder ID</TableHeaderColumn>
                                    <TableHeaderColumn dataField='AgentCode' dataSort>MI Agent Agreement code</TableHeaderColumn>
                                    <TableHeaderColumn dataField="AgentName" >MI Agent Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="PolicyNumber" >Policy No</TableHeaderColumn>
                                    <TableHeaderColumn dataField="ProductName" >Product Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField='NetPremium' dataSort>Net Premium</TableHeaderColumn>
                                    <TableHeaderColumn dataField='GWP' dataSort>GWP</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CustomerName"  >Customer Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="State"  >State</TableHeaderColumn>
                                    <TableHeaderColumn dataField="PaymentDate">Payment date</TableHeaderColumn>                            
                                    <TableHeaderColumn dataField="TxnId">Txn ID</TableHeaderColumn>  
                                    <TableHeaderColumn >Loan A/c no</TableHeaderColumn>    
                                    </BootstrapTable> :
                                <BootstrapTable ref="table"
                                    data={policyHolder}
                                    pagination={true}
                                    options={options}
                                    remote={true}
                                    fetchInfo={{ dataTotalSize: totalRecord }}
                                    // striped
                                    // hover
                                    //wrapperClasses="table-responsive "
                                    className="reportclass"
                                >


                                    <TableHeaderColumn isKey dataField="PolicyHolderId"  >Policy Holder ID</TableHeaderColumn>
                                    <TableHeaderColumn dataField='PartnerName' dataSort>Agent Id</TableHeaderColumn>
                                    <TableHeaderColumn dataField='AgentCode' dataSort>Agent Code</TableHeaderColumn>
                                    <TableHeaderColumn dataField="AgentName" >Agent Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="PolicyNumber" >Policy No</TableHeaderColumn>
                                    <TableHeaderColumn dataField="CustomerName"  >Customer Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="State"  >State</TableHeaderColumn>

                                    <TableHeaderColumn dataField='NetPremium' dataSort>Net Premium</TableHeaderColumn>
                                    <TableHeaderColumn dataField='GWP' dataSort>GWP</TableHeaderColumn>
                                    <TableHeaderColumn dataField="ProductName">Product Name</TableHeaderColumn>
                                    <TableHeaderColumn dataField="VehicleDetails">Vehicle Details</TableHeaderColumn>
                                    <TableHeaderColumn dataField="RegistrationNo">Rgst. No</TableHeaderColumn>
                                    <TableHeaderColumn dataField="PaymentDate">Pay Date</TableHeaderColumn>
                                    
                                    <TableHeaderColumn dataField="TxnId">Order Id / Txn ID</TableHeaderColumn>   

                                </BootstrapTable>
                                }
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

export default connect( mapStateToProps, mapDispatchToProps)(AdminReport);
