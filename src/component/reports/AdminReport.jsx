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
import * as Yup from "yup";
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

const ComprehensiveValidation = Yup.object().shape({
    from_date: Yup.string().nullable().required("Please select From Date"),
    // to_date: Yup.string().required("Please select To Date"),
    to_date: Yup.string().nullable().required("Please select To Date"),
        // .when(
        //     'from_date',
        //     (from_date, schema) => 
        //     from_date && schema.max(moment(from_date).add(1,'month'),
        //     'To Date should be within 1 month of From Date')
        // ),
    // .test(
    //     "to_date",
    //     "To Date should be within 1 month of From Date",
    //     value => {
    //         const refdate = Yup.ref("from_date");
    //         return moment(refdate).diff(moment(value),'month') > 1;
    //     }
    //     // function(v) {
    //     //     const ref = Yup.ref("contactNo");
    //     //     return v !== this.resolve(ref);
    //     // }
    //   ),
    agent_id: Yup.string().max(15, "Agent Id can be maximum 15 characters")
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
        per_page: 10
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    handleSubmit=(values, page_no)=>{

        if (isNaN(page_no)) {
            page_no = 1;
        }
        let fromDate = moment(values['from_date']);
        let toDate = moment(values['to_date']);
        let diffMon = toDate.diff(fromDate, 'days');
        // let page_no = this.state.page_no;
        // console.log(diffMon, fromDate, toDate);

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

            // formData.append('bcmaster_id', this.state.bcmaster_id); // sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
            // formData.append('page', page_no);   
            // formData.append('policy_status', 'complete');
            // formData.append('role_id', this.state.role_id);
            postData['bcmaster_id'] = this.state.bcmaster_id;
            postData['page'] = page_no;
            postData['policy_status'] = 'complete';
            postData['role_id'] = this.state.role_id;

            formData.append('enc_data',encryption.encrypt(JSON.stringify(postData)));

            this.props.loadingStart();
            axios.post('admin/report-list',formData)
            .then(res=>{

                let encryption = new Encryption();
                let response = JSON.parse(encryption.decrypt(res.data)); 

                let statusCount = response.data && response.data.report ? response.data.report[1] : [];   
                let responseData = response.data && response.data.report ? response.data.report[0].data : []    
                page_no = response.data && response.data.report ? response.data.report[0].current_page : 1 ;
                let per_page = response.data && response.data.report ? response.data.report[0].per_page : 10;

                let policyHolder = [];
                for (const reportData in responseData) {
                    policyHolder.push(responseData[reportData]);
                }
                console.log(policyHolder);
                this.setState({
                    statusCount, policyHolder, page_no, per_page
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

        // formData.append('bcmaster_id', this.state.bcmaster_id); // sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        // formData.append('page_no', 1)   
        // formData.append('policy_status', 'complete')
        // formData.append('role_id', this.state.role_id);
        postData['bcmaster_id'] = this.state.bcmaster_id;
        postData['policy_status'] = 'complete';
        postData['role_id'] = this.state.role_id;

        formData.append('enc_data',encryption.encrypt(JSON.stringify(postData)));

        this.props.loadingStart();
        axios.post('admin/report-download',formData)
        .then(res=>{

            let encryption = new Encryption();
            let response = JSON.parse(encryption.decrypt(res.data)); 

            this.props.loadingStop();
            this.downloadDoc(response.data.report_id)
            // swal.fire('Report Id');
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                statusCount: 1
            });
        })
    }

    downloadDoc = (refNumber) => {
        let file_path = `${process.env.REACT_APP_PAYMENT_URL}/admin_report_download.php?report_id=${refNumber}&bcmaster_id=${this.state.bcmaster_id}`
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

    onPageChange = async (page, sizePerPage) => {
        // console.log("1", page);
        // await this.setState({
        //     page_no: page
        // });

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
        const { statusCount, policyHolder, products, partners, role_id, page_no, per_page } = this.state
        var totalRecord = statusCount ? statusCount.total_count : 1
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
                                    <Form>
                                        <div className="rghtsideTrigr collinput m-b-30">
                                            {/* <div>
                                                {errors.from_date}
                                            </div> */}
                                            {/* <Collapsible trigger="Search with Dates & Products" open={false} onClose = {this.handleClose.bind(this,3,setFieldValue,setFieldTouched)}> */}
                                                <div  className="listrghtsideTrigr">
                                                <Row className="m-b-20">
                                                    <Col sm={12} md={6} lg={6}>
                                                        <Row>
                                                            <Col sm={12} md={4} lg={4}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <span className="fs-16"> From Date </span>
                                                                        <span className="impField">*</span>
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={8} lg={8}>
                                                                <FormGroup>
                                                                    <DatePicker
                                                                        name="from_date"
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
                                                                        selected={values.from_date }
                                                                        onChange={(val) => {
                                                                            setFieldTouched('from_date');
                                                                            setFieldValue('from_date', val); 
                                                                        }}
                                                                        
                                                                    />
                                                                    {errors.from_date || !touched.from_date  ? (
                                                                        <span className="errorMsg">{errors.from_date }</span>
                                                                    ) : null}
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                    </Col>
                                                    <Col sm={12} md={6} lg={6}>
                                                        <Row>
                                                            <Col sm={12} md={4} lg={4}>
                                                                <FormGroup>
                                                                    <div className="insurerName">
                                                                        <span className="fs-16">To Date</span>
                                                                        <span className="impField">*</span>
                                                                    </div>
                                                                </FormGroup>
                                                            </Col>
                                                            <Col sm={12} md={8} lg={8}>
                                                                <FormGroup>
                                                                    <DatePicker
                                                                        name="to_date"
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
                                                                        selected={values.to_date }
                                                                        onChange={(val) => {
                                                                            setFieldTouched('to_date');
                                                                            setFieldValue('to_date', val); 
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
                                                                        >
                                                                        <option value="">Partners</option>
                                                                        {partners.map((partnerName, qIndex) => ( 
                                                                            <option key={partnerName.id} value={partnerName.id}>{partnerName.vendor_name}</option>    
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
                                                                        {products.map((productName, qIndex) => ( 
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
                                                                        {products.map((productName, qIndex) => ( 
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
                                                <Row>
                                                    {/* <Col sm={12} md={6} lg={5}>
                                                    </Col> */}
                                                    <Col sm={12} md={12} lg={12} style={{ textAlign: 'center' }}>
                                                        <Button className={`proceedBtn`} type="submit" >
                                                            Search
                                                        </Button>
                                                        &nbsp;&nbsp;
                                                        
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
                                    &nbsp;
                                </Row>
                                {policyHolder && this.state.showList === true ? 
                                <div className="customInnerTable">
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
                                        
                                        <TableHeaderColumn dataField='GWP' dataSort>GWP</TableHeaderColumn>
                                        <TableHeaderColumn dataField="ProductName">Product Name</TableHeaderColumn>
                                        <TableHeaderColumn dataField="VehicleDetails">Vehicle Details</TableHeaderColumn>
                                        <TableHeaderColumn dataField="RegistrationNo">Rgst. No</TableHeaderColumn>
                                        <TableHeaderColumn dataField="PaymentDate">Pay Date</TableHeaderColumn>
                                        
                                        <TableHeaderColumn dataField="TxnId">Order Id / Txn ID</TableHeaderColumn> 
                                        {/* 
                                        <TableHeaderColumn width='100px' tdStyle={{ whiteSpace: 'normal', width: '120px'}} dataField="request_data" dataFormat={quoteFormatter} >Quote Number</TableHeaderColumn>
                                        <TableHeaderColumn width='100px' tdStyle={{ whiteSpace: 'normal', width: '120px'}} dataField="request_data" dataFormat={premiumFormatter} >Net Premium</TableHeaderColumn> */}
                                        

                                        {/* <TableHeaderColumn width='100px'  dataField="reference_no" isKey dataAlign="center" dataFormat={ actionFormatter(this) }>Download</TableHeaderColumn> */}

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

export default connect( mapStateToProps, mapDispatchToProps)(AdminReport);
