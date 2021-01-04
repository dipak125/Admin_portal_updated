import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, FormGroup } from 'react-bootstrap';
import moment from "moment";

// import SideNav from '../common/side-nav/SideNav';
// import Footer from '../common/footer/Footer';
import TicketStatus from '../support/TicketStatus'
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";

const actionFormatter = (refObj) => (cell, row, enumObject) => {
    return (
        <LinkWithTooltip
            tooltip="Show Ticket"
            href="#"
            clicked={() => refObj.ticketDetails(row.ticket)
            }
            id="tooltip-1"
        >
            {row.ticket}
        </LinkWithTooltip>
    )
}

class TicketCount extends Component {

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    state = {
        ticketCount: [
            {
                ticket: "0001",
                status: "open",
                subject: "timesheet Issue",
            },
            {
                ticket: "0002",
                status: "closed",
                subject: "System Issue",
            }
        ],
        ticketId: "",
        viewTicket: false
    }

    ticketDetails = (ticketId) => {
        this.setState({ ticketId: ticketId, viewTicket: true })
    }

    render() {
        const { ticketCount, ticketId, viewTicket } = this.state
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
                text: 'All', value: ticketCount.length
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
            <>

                <div className="contBox m-b-45 tickedTable">

                    {viewTicket == true ?
                        <TicketStatus ticketId={ticketId} />
                        :
                        <BootstrapTable ref="table"
                            data={ticketCount}
                            pagination={true}
                            headerStyle={{ background: '#85c0ff' }}
                            striped
                            hover
                            condensed
                            wrapperClasses="table-responsive"
                        >

                            <TableHeaderColumn width='100px' dataField='ticket' isKey={true} dataFormat={actionFormatter(this)} >Tickets</TableHeaderColumn>
                            <TableHeaderColumn width='120px' dataField="status" tdStyle={{ whiteSpace: 'normal' }} >Status</TableHeaderColumn>
                            <TableHeaderColumn width='150px' dataField="subject" tdStyle={{ whiteSpace: 'normal' }}>Subject</TableHeaderColumn>


                        </BootstrapTable>
                    }
                </div>
            </>
        );
    }
}

export default TicketCount;