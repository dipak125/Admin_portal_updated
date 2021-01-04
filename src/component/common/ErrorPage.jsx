import React, { Component } from 'react';
import HeaderTop from '../common/header/header-top/HeaderTop';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import queryString from 'query-string';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import Footer from '../common/footer/Footer';
import { Button } from 'react-bootstrap';

class ErrorPage extends Component {

    state = {
        errorDetails: [],
        httpCode: "",
        retry_url: "",
        retry: "",
        policyHolder: [],
        refNumber:  queryString.parse(this.props.location.search).access_id ? 
                    queryString.parse(this.props.location.search).access_id : 
                    localStorage.getItem("policyHolder_refNo")
    };

    componentDidMount() {
        this.fetchError();       
    }

    fetchError() {
        const formData = new FormData();
        formData.append('policy_ref_no', this.state.refNumber)
        axios.post(`policy-error-msg`, formData)
          .then(res => {
            if(res.data.data.message.httpCode == "404") {
              this.setState({
                errorDetails: res.data.data.message.moreInformation,
                httpCode: res.data.data.message.httpCode
              });

              if(res.data.data.message && res.data.data.message.retry && res.data.data.message.retry ==  1) {
                this.setState({
                  retry_url:  `${process.env.REACT_APP_PAYMENT_URL}/${res.data.data.message.payment_url}`,
                  retry: res.data.data.message.retry
                });
              }
            }
            else {
              this.setState({
                errorDetails: res.data.data.message.ValidateResult,
                httpCode: res.data.data.message.httpCode
              });
            }
            
            this.props.loadingStop();
          })
          .catch(err => {
            this.props.loadingStop();
          });
      }

      Retry_payment = () => {
        const { refNumber,retry_url } = this.state;
        window.location = retry_url
    }

    render() {
        const { errorDetails, httpCode,retry } = this.state
        return (
            <>
             <BaseComponent>
                <div className="container-fluid">
                  <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                      <SideNav />
                    </div>
                    <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10">
                      <section className="thankuBox">
                        <div className="text-center custtxt">
                        <p className="fs-16 m-b-30"><span className="lghtBlue">&nbsp;</span></p>
                          <img src={require('../../assets/images/Error.png')} alt="" className="m-b-30" />
                          <p className="fs-16 m-b-30"><span className="lghtBlue"><strong>{httpCode == "404" && errorDetails ? errorDetails : errorDetails && errorDetails.message ? errorDetails.message : null}</strong></span></p>
                          <p className="fs-16 m-b-30"><span className="lghtBlue">&nbsp;</span></p>                            
                        </div>
                      </section>
                      {retry == 1 ? <div className="dashbrd"><Button className="buy" type="button" onClick = {this.Retry_payment} >Retry Payment</Button></div> : null}
                      <br/>
                      <Footer />
                    </div>
                  </div>
                </div>
              </BaseComponent>
            </>
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
  
  export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ErrorPage));