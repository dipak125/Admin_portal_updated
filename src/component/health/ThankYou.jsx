import React, { Component } from 'react';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import queryString from 'query-string';
import Encryption from '../../shared/payload-encryption';

// const refNumber = localStorage.getItem("policyHolder_id")

class ThankYouPage extends Component {

  state = {
    accessToken: "",
    response_text: [],
    policyNo: this.props.match.params.policyId,
    vehicletype: [],
    refNumber:  queryString.parse(this.props.location.search).access_id ? 
                queryString.parse(this.props.location.search).access_id : 
                localStorage.getItem("policyHolder_refNo")
  };

  // ------------------------ Custom PDF----------------------------

  generateDoc = () => {
    const { policyId } = this.props.match.params
    const formData = new FormData();
    formData.append('policyNo', policyId)
    this.props.loadingStart();
    axios
      .post(`/policy-download/policy-pdf`, formData)
      .then(res => {
        this.props.loadingStop();
        if(res.data.error == false) {
          this.downloadDoc()
        }
        else swal("Document not found")
               
      })
    
  }

  downloadDoc = () => {
    let file_path = `${process.env.REACT_APP_PAYMENT_URL}/policy_pdf_download.php?refrence_no=${this.state.refNumber}`
    const url = file_path;
    const pom = document.createElement('a');

    pom.style.display = 'none';
    pom.href = url;
    document.body.appendChild(pom);
    pom.click(); 
    window.URL.revokeObjectURL(url);


    localStorage.removeItem("policyHolder_id");
    localStorage.removeItem("policyHolder_refNo");
    localStorage.removeItem("policy_type");
    localStorage.removeItem("brandEdit");
    localStorage.removeItem("newBrandEdit");
    sessionStorage.removeItem('pan_data');
    sessionStorage.removeItem('email_data');
    sessionStorage.removeItem('proposed_insured');
    sessionStorage.removeItem('display_looking_for');
    sessionStorage.removeItem('display_dob');
  }

  //-----------------------------------Custom PDF End----------------------------------------


  //--------------------------------------CCM Service PDF ------------------------------------------
    getAccessToken = () => {
    this.props.loadingStart();
    axios
      .post(`/callTokenService`)
      .then(res => {
        this.setState({
          accessToken: res.data.access_token
        })
        return new Promise(resolve => {setTimeout(() => {
          this.getPolicyDoc(res.data.access_token)
            }
            ,5000)
        })
        
      })
      .catch(err => {
        this.setState({
          accessToken: []
        });
        this.props.loadingStop();
      });
  }

  getPolicyDoc = (access_token) => {

    const { policyNo } = this.state
    const formData = new FormData();
    //formData.append('access_token', access_token);
    //formData.append('policyNo', policyNo)
    const post_data_obj = {
      'access_token': access_token,
      'policyNo': policyNo,
      'policyHolder_Id':  this.state.refNumber
    }
    let encryption = new Encryption();
    formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
    this.props.loadingStart();
    axios
      .post(`/callDocApi`, formData)
      .then(res => {
        this.props.loadingStop();

        if(res.data.error == true) {
          swal({
            title: "Alert",
            text: "PDF Generation process is taking longer time than expected. Please have patience.",
            icon: "warning",
            // buttons: true,
            dangerMode: true,
          })
          .then((willDownload) => {
            if (willDownload) {
            this.getAccessToken()
            }
          })

        }
        else if (res.data.data.getPolicyDocumentResponseBody.payload.URL[0] == "No Results found for the given Criteria") {
          // swal(res.data.getPolicyDocumentResponseBody.payload.URL[0]);
          swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy document online. Please call 180 22 1111");
        }
        
        else {
          this.setState({
            response_text: res.data,
            res_error: false
          })

          this.generate_pdf(res.data.data, this.state.refNumber)    
        }
      })
      .catch(err => {
        this.setState({
          response_text: []
        });
        this.props.loadingStop();
      });
  }

  generate_pdf = (response_text, refNumber) => {
    // const {response_text, refNumber, res_error} = this.state
    const { policyNo } = this.state
    if (response_text && refNumber) {
      const formData = new FormData();
      //  formData.append('refNumber', refNumber);
      // formData.append('policy_no', policyNo);
      //formData.append('response_text', JSON.stringify(response_text))
      const post_data_obj = {
        'policy_holder_id': refNumber,
        'policy_no': policyNo,
        'response_text': JSON.stringify(response_text)
      }

      let encryption = new Encryption();
      formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data_obj)))
      this.props.loadingStart();
      axios
        .post(`/generate-pdf`, formData)
        .then(res => {
          this.props.loadingStop();
          localStorage.removeItem("policyHolder_id");
          localStorage.removeItem("policyHolder_refNo");
          localStorage.removeItem("policy_type");
          localStorage.removeItem("brandEdit");
          localStorage.removeItem("newBrandEdit");
          sessionStorage.removeItem('pan_data');
          sessionStorage.removeItem('email_data');
          sessionStorage.removeItem('proposed_insured');
          sessionStorage.removeItem('display_looking_for');
          sessionStorage.removeItem('display_dob');
          this.downloadDoc(res.data.data.uploded_path)
        })
        .catch(err => {
          this.setState({
          });
          this.props.loadingStop();
        });
    }
    else {
      swal("Could not get policy document")
    }

  }

  downloadDoc = () => {
    let file_path = `${process.env.REACT_APP_PAYMENT_URL}/ConnectPG/policy_pdf_download.php?refrence_no=${this.state.refNumber}`
    console.log(file_path);
    const { policyNo } = this.state
    const url = file_path;
    const pom = document.createElement('a');

    pom.style.display = 'none';
    pom.href = url;

    document.body.appendChild(pom);
    pom.click(); 
    window.URL.revokeObjectURL(url);

    // fetch(file_path,{
    //   mode: 'no-cors' // 'cors' by default
    // })
    //   .then(resp => resp.blob())
    //   .then(blob => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.style.display = 'none';
    //     a.href = url;
    //     // the filename you want
    //     // a.download = 'b7b98d12c9da4f44b7f5e372945fbf7f.pdf';
    //     a.download = policyNo+'.pdf';
    //     document.body.appendChild(a);
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    //     this.props.loadingStop();
    //     //alert('your file has downloaded!'); // or you know, something with better UX...
    //   })
     
    //   .catch(() => {
    //    this.props.loadingStop();

    //   });
      
  }

  //-----------------------------------CCM Service PDF End----------------------------------------


  fetchData = () => {
    const { productId } = this.props.match.params
    let encryption = new Encryption();

    axios.get(`policy-holder-additional-details/${this.state.refNumber}`)
        .then(res => {
            let decryptResp = JSON.parse(encryption.decrypt(res.data))
            console.log("decrypt", decryptResp)
            let vehicletype = decryptResp.data.policyHolder && decryptResp.data.policyHolder.vehiclebrandmodel ? decryptResp.data.policyHolder.vehiclebrandmodel.vehicletype : {};

            this.setState({
                vehicletype       
            })
        })
        .catch(err => {
            // handle error
            this.props.loadingStop();
        })
}


  componentDidMount() {      
    const { policyId } = this.props.match.params
    this.fetchData()
    window.history.pushState(null, null, window.location.href);
    window.onpopstate = function () {
      window.history.go(1);
    };

  }
  render() {
    const { policyId } = this.props.match.params
    const { vehicletype } = this.state
    
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
                  <div className="thankuinfo">
                    <div className="text-center custtxt">
                      <img src={require('../../assets/images/like.svg')} alt="" className="m-b-30" />
                      <p>Thank you for choosing SBI General Insurance</p>
                      <p className="fs-16 m-b-30">Policy No <span className="lghtBlue"> {policyId}</span></p>
                        <div className="d-flex justify-content-center align-items-center">
                        {vehicletype.download_type == 0 ?
                            <button className="policy m-l-20" onClick={this.generateDoc}>Policy Copy </button>
                            :
                            <button className="policy m-l-20" onClick={this.getAccessToken}>Policy Copy </button>
                        }
                        </div>
                    </div>
                  </div>
                </section>
                {/* <div className="dashbrd"><a href="#">Go to Dashboard</a></div> */}
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ThankYouPage));