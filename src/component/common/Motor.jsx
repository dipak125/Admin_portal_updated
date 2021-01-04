import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import Encryption from '../../shared/payload-encryption';
import swal from 'sweetalert';
import { authLogout } from "../../store/actions/auth";

const initialValues = {};



class Motor extends Component {

    state = {
        motor_list: [],
    //     health_list: [
    //         {
    //           "id": "6",
    //           "product": "Arogya Sanjeevani",
    //           "image" : "Miscellaneous-car.svg"
    //         }            
    //       ]
      };


    buy_policy = (productId) => {
        if(productId == '2'){
         this.props.history.push(`/Registration/${productId}`);      
        }
        else if(productId == '3') {
            this.props.history.push(`/two_wheeler_Select-brandTP/${productId}`)
            // document.getElementById('bootstrapForm').submit()
        }
        else if(productId == '4') {
            this.props.history.push(`/two_wheeler_Select-brand/${productId}`)
            // document.getElementById('bootstrapForm').submit()
        }
        else if(productId == '6') {
            this.props.history.push(`/four_wheeler_Select-brandTP/${productId}`)
        }
        else if(productId == '7') {
            this.props.history.push(`/Registration_GCV_TP/${productId}`)
        }
        else if(productId == '8') {
            this.props.history.push(`/Registration_GCV/${productId}`)
        }
        else if(productId == '11') {
            this.props.history.push(`/Registration_MISCD/${productId}`)
        }
    }   

    getPolicyList = () => {
        let encryption = new Encryption();
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));
        }
        let bcmaster_id = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : (bc_data ? bc_data.agent_id : "")
        this.props.loadingStart();
        axios.get(`vehicle/types/${bcmaster_id}`)
          .then(res => {
              if(res.data.error == true && res.data.msg == "Invalid User") {
                swal(res.data.msg)
                this.props.logout() 
              }
            this.setState({
                motor_list: res.data.data
            });
            localStorage.removeItem('policyHolder_id');
            localStorage.removeItem('policyHolder_refNo');
            localStorage.removeItem('display_gender');
            sessionStorage.removeItem('pan_data');
            sessionStorage.removeItem('email_data');
            sessionStorage.removeItem('proposed_insured');
            sessionStorage.removeItem('display_looking_for');
            sessionStorage.removeItem('display_dob');
            localStorage.removeItem('newBrandEdit');
            localStorage.removeItem('brandEdit');
            localStorage.removeItem('registration_number');
            localStorage.removeItem('policy_type');
            localStorage.removeItem('check_registration');
            localStorage.removeItem('confirm');

            
            this.props.loadingStop();
          })
          .catch(err => {
            this.setState({
                motor_list: [] })
            this.props.loadingStop();
          });
    }

    componentDidMount() {
        this.getPolicyList()
    }


    render() {
        const { motor_list, health_list } = this.state;
        return (
            <Row>
                <Col sm={12}>
                    <div className="tablecontent">
                    {motor_list.length > 0 ?
                        <table>
                            {(this.props.tabId == '1') ? 
                                (<tbody>                                
                                    {motor_list.map((part, partIndex) => ( 
                                    <tr key={partIndex}>
                                        <td className="W-10"><img src={require(`../../assets/images/${part.logo}`)} alt="" /></td>
                                        <td className="W-70">{part.name}</td>
                                        <td className="W-10 text-right"> <button className="buy" onClick= {this.buy_policy.bind(this, part.id )}>Buy</button></td>
                                        {/* <td className="W-10 text-right"> <button className="renew">Renew</button></td> */}
                                    </tr>
                                    ))
                                    }
                                </tbody>) : 
                                null
                            }
                        </table>
                        : null}

                        <form action="https://secure.sbigeneral.in/SBIGTP/csc/display" target="_self" id="bootstrapForm" method="POST"> `
                            <input type="hidden" id="csc_id" name="csc_id" value={sessionStorage.getItem('csc_id')}/>
                            <input type="hidden" id="agent_name" name="agent_name" value={sessionStorage.getItem('agent_name')}/>
                        </form>
                    </div>
                    </Col>
                  </Row>  
        ) 
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
      loadingStop: () => dispatch(loaderStop()),
      logout: () => dispatch(authLogout())
    };
  };


export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Motor));