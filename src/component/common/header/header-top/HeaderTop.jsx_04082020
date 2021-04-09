import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import { connect } from "react-redux";
import { authLogout } from "../../../../store/actions/auth";
import axios from "../../../../shared/axios"

class HeaderTop extends Component {

    handleLogout = () => {
        let token = localStorage.getItem("auth_token");
        axios.get('/logout')
            .then(res => {
                localStorage.removeItem('cons_reg_info');
                this.props.history.push(`/LogIn`);
                this.props.logout();
            })
            .catch(err => {
                this.props.logout();
                // this.props.loadingStop();
            });

    };

    componentWillUpdate(nextProps, nextState) {

      }
      
    render() {
        // const { isLoggedIn } = this.props;
        return (
            <>
                <section className="container-fluid headerTop d-flex justify-content-between">
                    <div className="align-self-center"><img src={require('../../../../assets/images/logo.svg')} alt="" /></div>
                    {localStorage.getItem("auth_token") ? 
                    <div className="align-self-right">
                        <select
                            name="langauage"
                            className="listSelect"
                            defaultValue={localStorage.getItem('lang_name')}
                            onChange={e => {
                                localStorage.setItem('lang_name', e.target.value);
                                window.location.reload();
                            }}
                            style={{
                                width: '96px',
                                position: 'relative',
                                top: '14px',
                                left: '-9px',
                                border: '0px',
                                boxShadow: 'none'
                            }}>
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </div> 
                     : null } 

                    {localStorage.getItem("auth_token") ?
                    <div className="align-self-center userTopRtSec">
                        <Dropdown alignRight>
                            <Dropdown.Toggle variant="" id="dropdown-basic">
                                <div className="d-flex topUserBtn">
                                    <div className="align-self-center">
                                        <a href="#" className="notiBell">
                                        </a>
                                    </div>
                                    {/* <div className="align-self-center userNameImg">
                                        <img src={require('../../../../assets/images/user.svg')} alt="" />
                                    </div>
                                    <div className="align-self-center d-none d-sm-block">
                                    <img src={require('../../../../assets/images/shapes-and-symbols.svg')} alt="" />
                                    </div> */}
                                </div>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item >Logout</Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>                       
                    </div>
                    : null }
                    
                    {this.props.loading ? (
                        <div className="loading">
                            <Loader type="Oval" color="#edae21" height="50" width="50" />
                        </div>
                    ) : null}
                </section>
            </>
        )
    }
}

const mapDispatchToProps = dispatch => {
    return {
        logout: () => dispatch(authLogout())
    }
}

const mapStateToProps = state => {
    return {
        loading: state.loader.loading
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderTop);