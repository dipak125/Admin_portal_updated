import React, { Component } from 'react';
import { Dropdown } from 'react-bootstrap';
import Loader from "react-loader-spinner";
import { connect } from "react-redux";
import { authLogout } from "../../../../store/actions/auth";
import axios from "../../../../shared/axios"
import Encryption from '../../../../shared/payload-encryption';
import Blink from 'react-blink-text';


class HeaderTop extends Component {

    state = {
        logo: sessionStorage.getItem('logo') && sessionStorage.getItem('logo') != null ? sessionStorage.getItem('logo') : "",
        bc_data: {},
        csc_data: {},
        bcmaster_id: 0
    }

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

    componentDidMount() {
        let encryption = new Encryption();

        // let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        let csc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        let bc_data = localStorage.getItem('users') ? localStorage.getItem('users') : "";
        // console.log(bc_data);
        
        if(bc_data) {
            let bcmaster_id = JSON.parse(encryption.decrypt(sessionStorage.getItem('bcmaster_id')));
            // let encryption = new Encryption();
            bc_data = JSON.parse(encryption.decrypt(JSON.parse(bc_data).user));
            // console.log(bc_data);
            this.setState({
                bc_data,
                bcmaster_id
            })
        }
        // else if(csc_data && sessionStorage.getItem('csc_id')) {
        //     let encryption = new Encryption();
        //     // csc_data = JSON.parse(csc_data)          
        //     // csc_data = csc_data.user
        //     csc_data = JSON.parse(csc_data) 
        //     csc_data = csc_data.user
        //     csc_data = JSON.parse(encryption.decrypt(csc_data));  
        //     this.setState({csc_data})
        // }
    }

      
    render() {
        // console.log("BC_data---", bc_data.user_info )
        const { logo, bc_data, csc_data, bcmaster_id } = this.state
        // console.log("bc_data---------------- ", bc_data)
        // console.log("bcmaster_id---------------- ", bcmaster_id)
        return (
            <>
                <section className="container-fluid headerTop d-flex justify-content-between">
                    <div className="align-self-center"><img src={require('../../../../assets/images/logo.svg')} alt="" /></div>
                    {/* {localStorage.getItem("auth_token") ? 
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
                     : null }  */}

                    
                    <div className="align-self-center userTopRtSec">
                        <Dropdown alignRight>
                            <Dropdown.Toggle variant="" id="dropdown-basic">
                                <div className="d-flex topUserBtn">
                                {sessionStorage.getItem("auth_token") && bc_data && this.props.flag !== "logout" ?
                                    <div className="align-self-center userNameImg">
                                        Welcome {bc_data.name}                                        
                                    </div>
                                    //     :  
                                    // sessionStorage.getItem("auth_token") && csc_data ?
                                    //     <div className="align-self-center userNameImg">
                                    //         Welcome {csc_data.name}                                            
                                    //     </div>
                                        : null }
                                    <div className="align-self-center">
                                     {this.props.flag == "logout" ? null :  
                                    logo ? 
                                    <img src={require(`../../../../assets/images/${logo}`)} alt="" className="notiBell"/>
                                    : null}
                                    </div>

                                </div>
                            </Dropdown.Toggle>
                            {/* <Dropdown.Menu>
                                <Dropdown.Item >Logout</Dropdown.Item> 
                            </Dropdown.Menu> */}
                        </Dropdown>                       
                    </div>
                    
                    
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