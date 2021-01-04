import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import { Row, Col, FormGroup, Button } from 'react-bootstrap';
import swal from 'sweetalert';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import Encryption from '../../shared/payload-encryption';
import axios from "../../shared/axios";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import moment from "moment";

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    if(row.break_in_status == "Vehicle Recommended and Reports Uploaded"){
        return (
            <LinkWithTooltip
                tooltip="Click to proceed"
                href="#"
                clicked={() => refObj.redirectLink(row)
                }
                id="tooltip-1"
            >               
                Approved 
            </LinkWithTooltip>
        )
    }
    else {
        return (
            <LinkWithTooltip
                tooltip="Get Status"
                href="#"
                clicked={() => refObj.getBreakinStatus(row)
                }
                id="tooltip-1"
            >
                <Button type="button" >
                    Get Status
                </Button> 
            </LinkWithTooltip>
        )
    }
}

function productFormatter(cell) {
    return (cell ? (cell.vehicletype ? cell.vehicletype.name : null): null);
} 

function premiumFormatter(cell) {
    return (cell ? (cell.net_premium ? cell.net_premium: null): null);
} 

function breakinFormatter(cell) {
    return (cell ? (cell.inspection_no ? cell.inspection_no: null): null);
} 

class BreakinList extends Component {
    state = {
        breakinList: []
    }

    redirectLink = (row) => {
        localStorage.setItem("policyHolder_refNo", row.reference_no)
        localStorage.setItem("policyHolder_id", row.request_data.policyholder_id)
        this.props.history.push(`/${row.page_name}`);
    }

    getBreakinStatus = (row) => {
        const formData = new FormData(); 
        formData.append('bcmaster_id', row.bcmaster_id ) 
        formData.append('ref_no', row.reference_no) 

        this.props.loadingStart();
        axios.post('breakin/get-status',formData)
        .then(res=>{
            if(res.data.error == false) {
                swal(`Status: ${res.data.data.breakin_status}`, `Inspection Number: ${res.data.data.inspection_no}`)
                .then((willUpdate) =>{
                    if(willUpdate) {
                        this.getBreakinList()
                    }
                } )
            }   
            else{
                this.getBreakinList()
            }             
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
        })  
    }

    getBreakinList=()=>{

        const formData = new FormData();
        let encryption = new Encryption();

        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        formData.append('bcmaster_id', sessionStorage.getItem('csc_id') ? "5" : bc_data ? bc_data.agent_id : "" ) 
        formData.append('bc_agent_id', sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : bc_data ? bc_data.user_info.data.user.username : "") 

        this.props.loadingStart();
        axios.post('breakin/list',formData)
        .then(res=>{
            let breakinList = res.data.data ? res.data.data : []                   
            this.setState({
                breakinList
            });
            this.props.loadingStop();
        }).
        catch(err=>{
            this.props.loadingStop();
            this.setState({
                breakinList: []
            });
        })
    
    }

    componentDidMount() {
        this.getBreakinList()
    }

    render() {
        const { breakinList } = this.state
        const options = {
            // afterColumnFilter: this.afterColumnFilter,
            // onExportToCSV: this.onExportToCSV,
            page: 1,  // which page you want to show as default
            sizePerPageList: [{
                text: '5', value: 5
            }, {
                text: '10', value: 10
            }, {
                text: '15', value: 15
            }, {
                text: '20', value: 20
            }, {
                text: 'All', value: breakinList.length
            }], // you can change the dropdown list for size per page
            sizePerPage: 10,  // which size per page you want to locate as default
            pageStartIndex: 1, // where to start counting the pages
            paginationSize: 3,  // the pagination bar size.
            prePage: 'Prev', // Previous page button text
            nextPage: 'Next', // Next page button text
            firstPage: 'First', // First page button text
            lastPage: 'Last', // Last page button text
            paginationShowsTotal: this.renderShowsTotal,  // Accept bool or function
            paginationPosition: 'bottom',  // default is bottom, top and both is all available
            noDataText: 'No Data'

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
                            <h4 className="text-center mt-3 mb-3">Break In</h4>  
                            <div className="customInnerTable">
                                <BootstrapTable ref="table"
                                    data={breakinList}
                                    pagination={true}
                                    options={options}
                                    striped
                                    hover
                                    wrapperClasses="table-responsive"
                                >

                                    <TableHeaderColumn width='200px' dataField='breakin' dataFormat={breakinFormatter} isKey dataSort>choice No</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="vehiclebrandmodel" dataFormat={productFormatter} >Product</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="breakin" dataFormat={(cell) => (cell && cell.created_at !== '0000-00-00 00:00:00' ? moment(cell.created_at).format("DD-MM-YYYY") : '')}>Inspection Date</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="request_data" dataFormat={premiumFormatter} >Premium</TableHeaderColumn>
                                    {/* <TableHeaderColumn width='200px' dataField="break_in_status"  dataFormat={(cell) => (cell == 1 ? "Approval pending" : "Approved")} >Status</TableHeaderColumn> */}
                                    <TableHeaderColumn width='200px' dataField="break_in_status" >Status</TableHeaderColumn>
                                    <TableHeaderColumn width='100px' dataField="request_data" dataFormat={(cell) =>(cell.quote_id) } >Quotatioin No.</TableHeaderColumn>
                                    <TableHeaderColumn width='150px' dataField="getstatus" dataAlign="center" dataFormat={ actionFormatter(this) }>Status</TableHeaderColumn>

                                </BootstrapTable>
                            </div>
                        </div></div>
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

export default connect( mapStateToProps, mapDispatchToProps)(BreakinList);