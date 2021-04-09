import React, { Component } from 'react';
import { Router, Route, Link } from 'react-router-dom';
import axios from "../../../shared/axios"

export default class SideNav extends Component {

    handleLogout = () => {
        let token = localStorage.getItem("auth_token");
        axios.get('/logout')
            .then(res => {
                localStorage.removeItem('cons_reg_info');
                this.props.logout();
            })
            .catch(err => {
                // this.props.loadingStop();
            });

    };

    render() {
        return (
            <>
                <nav className="flex-fill leftNav">
                    <ul className="navPan">
                        {/* <li>
							<Link to="/UnderMaintenance" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/leftIcon01.svg')} alt="" /></span>Dashboard</Link>
                        </li> */}
                        <li>
							<Link to="/Products" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/leftIcon02Hover.svg')} alt="" /></span>Products</Link>
                        </li>
                         {/* <li>
							<a href={`${process.env.REACT_APP_PAYMENT_URL}/sbig-csc/core/public/pdf_files/SBIG Sales Manager.pdf`} target="_blank" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/leftIcon03.svg')} alt="" /></span>Sales Manager </a>
                        </li>
                        <li>
                        <a href={`${process.env.REACT_APP_PAYMENT_URL}/sbig-csc/core/public/pdf_files/Arogya Sanjeevani.pdf`} target="_blank" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/leftIcon05.svg')} alt="" /></span>Arogya Sanjeevani Brochure </a>
                        </li> */}
                       {/* <li>
							<Link to="/UnderMaintenance" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/leftIcon05.svg')} alt="" /></span>Support</Link>
                        </li> */}
                    </ul>

                    {/* <button className="btn-lg" >
							<Link to="/#" activeClassName="active"><span className="leftIcon01"><img src={require('../../../assets/images/Logout.svg')} alt="" /></span>Logout</Link>
                    </button> */}
                </nav>
            </>
        )
    }
}
