import React, { Component } from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

class TicketCountTable extends Component {
    render() {
        return (
            <>
                <BootstrapTable  striped hover condensed>
                <TableHeaderColumn dataField='id' isKey>Ticket #</TableHeaderColumn>
                <TableHeaderColumn dataField='name'>Create Date</TableHeaderColumn>
                <TableHeaderColumn dataField='price'>Status</TableHeaderColumn>
                <TableHeaderColumn dataField='price'>Subject</TableHeaderColumn>
                <TableHeaderColumn dataField='price'>Department</TableHeaderColumn>
            </BootstrapTable>
            </>
        );
    }
}

export default TicketCountTable;