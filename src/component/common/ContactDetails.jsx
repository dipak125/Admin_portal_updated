import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import axios from "../../shared/axios"
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";

const initialValues = {};
  

class ContactDetails extends Component {

    state = {
        doc_list: [
            {
                "id": "2",
                "product": "Contact details of Sales Manager",
                "image" : "Miscellaneous-car.svg"
              }          
          ]
      };

    dload_doc = (productId) => {
        let filePath = `${process.env.REACT_APP_PAYMENT_URL}/core/public/pdf_files/`
        let fileName = ""
        if(productId == '1'){            
            fileName = "Arogya_Sanjeevani.pdf"
            this.downloadDoc(filePath,fileName)
        }
        else if(productId == '2') {
            fileName = "SBIG_Sales_Manager.pdf"
            this.downloadDoc(filePath,fileName)
        }
    }   

    downloadDoc = (filePath,fileName) => {
        var anchor = document.createElement('a');
        anchor.href = filePath+fileName;
        anchor.target = '_blank';
        // anchor.download = filePath;;
        anchor.click();
      }

    getPolicyList = () => {
        
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
        
    }

    componentDidMount() {
        this.getPolicyList()
    }


    render() {
        const { doc_list } = this.state;
        return (
            <Row>
                <Col sm={12}>
                    <div className="tablecontent">
                    {doc_list.length > 0 ?
                        <table>
                            <tbody>                                
                                {doc_list.map((doc, docIndex) => ( 
                                    <tr key={docIndex}>
                                        {/* <td className="W-10"><img src={require(`../../assets/images/${doc.image}`)} alt="" /></td> */}
                                        <td className="W-70">{doc.product}</td>
                                        <td className="W-10 text-right"> <button className="buy" onClick= {this.dload_doc.bind(this, doc.id )} >View</button></td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                        : null}
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
      loadingStop: () => dispatch(loaderStop())
    };
  };


export default withRouter (connect( mapStateToProps, mapDispatchToProps)(ContactDetails));