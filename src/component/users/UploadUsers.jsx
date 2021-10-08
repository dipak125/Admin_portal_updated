import React, { Fragment, Component } from "react"
import { connect } from "react-redux";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import { Formik, Form } from "formik";
import { Button } from 'react-bootstrap';
import * as Yup from 'yup';
import Encryption from '../../shared/payload-encryption';
import axios from "../../shared/axios"
import swal from 'sweetalert';
import BaseComponent from '../BaseComponent';

const initialValues = {
    users_excel: '',
    fileSize : '',
}

const bcUsersFileUploadValidation = Yup.object().shape({
  users_excel: Yup.mixed().required('Only xls, xlsx file format is allowed'),
  users_excel: Yup.mixed()
      .required('Please select a file')
      .test('type', "Only xls, xlsx file format is allowed", (value) => {
          if (value) {
              let fileType = value[0].name.split('.').pop();
              return (fileType === 'xlsx' || fileType === 'xls');
          }
      })
});

class UploadUsers extends Component {

  constructor(props) {
      super(props);
      this.state = {
        theInputKey : Math.random().toString(36),
        resmessage : '',
        reserror: false,
        batch_no: ''
      };
    }

    handleFormSubmit = (values, { resetForm }) => {
    
        const formData = new FormData();
        let encryption = new Encryption();
        let randomString = Math.random().toString(36);
        let bcmaster_id = encryption.decrypt(sessionStorage.getItem('bcmaster_id'));

        const { selectedFile, selectedFileName } = this.state;
        formData.append('users_excel', selectedFile);
        formData.append('fileName', selectedFileName);
        formData.append('bcmaster_id', bcmaster_id);

        this.props.loadingStart();
        axios
            .post("admin/portal-users-excel-upload", formData)
            .then(res => {
                if (!res.data.error) {
                    this.setState({
                        reserror: res.data.error,
                        theInputKey: randomString
                    })
                    swal(res.data.msg);
                }
                else if(res.data.error && res.data.data.is_empty) 
                {
                    swal(res.data.msg);
                } else {
                    this.setState({
                        resmessage: res.data.msg,
                        reserror: res.data.error,
                        theInputKey: randomString,
                        batch_no: res.data.data.batch_no
                    })
                }
                resetForm();
                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            });
    }

    downloadErrorFile = () => {
        const { batch_no } = this.state;
        const url = `${process.env.REACT_APP_API_URL}/ksb-group-excel/error-file/${batch_no}`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }

    downloadSampleFile = () => {
        const url = `${process.env.REACT_APP_API_URL}/admin/get-sample-users-sheet`;
        this.props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        this.props.loadingStop();
    }

    fileUpload = async (uploadFile, setFieldValue, setFieldTouched) => {

        if (uploadFile[0] && uploadFile[0].name !== "") {
            let selectedFileSize = uploadFile[0].size;
            setFieldTouched("fileSize")
            setFieldValue("fileSize", selectedFileSize);
            let selectedFile = uploadFile[0];
            let selectedFileName = uploadFile[0].name;
            setFieldTouched("users_excel")
            setFieldValue("users_excel", uploadFile);

            this.setState({
                selectedFile,
                selectedFileName,
                resmessage : '',
                reserror: false,
            })
        }
    }

    render() {
    const { reserror, resmessage } = this.state;
      return(
        <BaseComponent>
              <div className="container-fluid">
                  <div className="row">
                        <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                            <SideNav />
                        </div>
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                          <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                          <section className="contBox m-b-45 tickedTable">
                              <div className="boxpd">
                                  <button className="policy m-b-10" onClick={this.downloadSampleFile} style={{ float: 'left' }}>Download user details sheet</button>
                                  <Formik initialValues={initialValues}
                                      onSubmit={this.handleFormSubmit}
                                      validationSchema={bcUsersFileUploadValidation}>
                                      {({ errors, setFieldValue, setFieldTouched }) => {
                                          return (
                                              <Form>
                                                  <div className="row formSection">
                                                      <label className="col-md-4">Upload the users file:</label>
                                                      <div className="col-md-4">
                                                          <input type="file" key={this.state.theInputKey || ''} name="users_excel"
                                                              onChange={(e) => {
                                                                  if (e.target.files.length > 0) {
                                                                      this.fileUpload(e.target.files, setFieldValue, setFieldTouched)
                                                                  }
                                                              }}
                                                          />
                                                          {errors.users_excel ? (
                                                              <span className="errorMsg">{errors.users_excel}</span>
                                                          ) : null}
                                                      </div>
                                                      <div className="cntrbtn">
                                                          <Button className={`btnPrimary`} type="submit" >
                                                              Upload
                                                          </Button>
                                                      </div>
                                                  </div>
                                              </Form>
                                          );
                                      }}
                                  </Formik>
                                  {reserror ? (
                                        <>
                                            {resmessage ? <span className="errorMsg" style={{ textAlign: 'right' }}>{resmessage}</span> : null}
                                            <button className="policy m-l-20 bg-danger" onClick={this.downloadErrorFile} style={{ float: 'right' }}>Download the error uplaoded file</button>
                                        </>
                                    ) : null}
                              </div>
                            </section>
                          <Footer />
                      </div>
                  </div>
              </div>
        </BaseComponent>
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

export default connect( mapStateToProps, mapDispatchToProps)(UploadUsers);