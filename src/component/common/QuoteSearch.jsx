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


const actionFormatter = (refObj) => (cell, row) => {
    // , enumObject
    return (
        <LinkWithTooltip
        tooltip="Click to proceed"
        href="#"
        clicked={() => refObj.redirectLink(cell,row)
        }
        id="tooltip-1"
        >               
        <div>{polNumFormatter(cell)}</div>
        </LinkWithTooltip>
    )
}


function premiumFormatter(cell) {
    return (cell ? (cell.net_premium ? cell.net_premium: null): null);
}  

function polNumFormatter(cell) {
    return (cell ? (cell.policy_note ? cell.policy_note.policy_no : null): null);
} 

function productFormatter(cell, row) {
    if(row.menumaster_id == '2'){
        return 'Arogya Sanjeevani'
    }else if(row.menumaster_id == '8'){
        return 'Arogya Topup'
    }else{
        return (cell ? (cell.vehicletype ? cell.vehicletype.name : null): null);
    }
}

function nameFormatter(cell, row){

    return (
        <div>{row.first_name+' '+row.last_name}</div>
    )
    
}

const statusFormatter = (refObj) => (cell,row) => {
    return (
        <div>Quote Issued</div>
    )
}

const newInitialValues = {}


class QuoteSearch extends Component {
    state = {
        statusCount: [],
        policyHolder: [],
        searchValues: {},
        products: []

    }

    redirectLink = (cell,row) => {
        //console.log('1st Char ===',row.page_name.substr(0, 1))
        let page_name = row.page_name
        //console.log('page_name == ', page_name)
        localStorage.setItem("policyHolder_refNo", row.reference_no)
        localStorage.setItem("policy_holder_ref_no", row.reference_no)        
        localStorage.setItem("policyHolder_id", cell.policyholder_id)
        if(page_name.substr(0, 1) == '/'){
            this.props.history.push(`${page_name}`);
        }else{
            this.props.history.push(`/${page_name}`);
        }
        
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    openPage = (cell) => {
        swal(cell.policy_note.policy_no)
    }

    fetchDashboard=(page_no)=>{

        const formData = new FormData();
        let encryption = new Encryption();
        page_no = page_no ? page_no : '1'


        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }

        formData.append('start_date', moment().format("YYYY-MM-DD"))   
        formData.append('end_date', moment().format("YYYY-MM-DD"))   
        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        formData.append('page_no', page_no)   
        formData.append('policy_status', 'pending')
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

    onPageChange(page, sizePerPage) {
    this.fetchDashboard(page);
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

    componentDidMount() {
        this.fetchDashboard(1)
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
                            <h4 className="text-center mt-3 mb-3">Quote History</h4>                           

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

                                    <TableHeaderColumn width='195px'  dataField="request_data" dataAlign="center" dataFormat={ actionFormatter(this)} isKey >Quote Number</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="request_data" dataAlign="center" dataFormat={ nameFormatter} >Proposer Name</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="vehiclebrandmodel" dataAlign="center" dataFormat={productFormatter} >Product</TableHeaderColumn>
                                    <TableHeaderColumn width='95px'  dataField='created_at' dataFormat={(cell) => (cell !== '0000-00-00 00:00:00' ? moment(cell).format("DD-MM-YYYY") : '')} dataAlign="center" dataSort>Quote Issue Date</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataAlign="center" dataField="request_data" dataFormat={premiumFormatter} > Premium</TableHeaderColumn>
                                    <TableHeaderColumn width='100px'  dataField="request_data" dataAlign="center" dataFormat={statusFormatter(this)} >Status</TableHeaderColumn>

                                    

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

export default connect( mapStateToProps, mapDispatchToProps)(QuoteSearch);
