import React, { Component } from 'react';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { setSmeRiskData,setSmeData,setSmeUpdateData,setSmeOthersDetailsData,setSmeProposerDetailsData } from "../../store/actions/sme_fire";
import { connect } from "react-redux";
import moment from "moment";
import * as Yup from 'yup';
import swal from 'sweetalert';
import Encryption from '../../shared/payload-encryption';
import { Formik, Form, Field, ErrorMessage } from 'formik';

const minDate = moment().format();
// alert(new Date(minDate));
const maxDate = moment().add(14, 'day');
const maxDateEnd = moment().add(15, 'day').calendar();


const initialValues = {
    policy_type: '1',
    pol_start_date:null
}

const vehicleRegistrationValidation = Yup.object().shape({
    pol_start_date: Yup.date().required("Please select both policy start date & time").nullable(),
    pol_end_date: Yup.date().required("Please select both policy end date & time").nullable(),
})


class Registration_sme extends Component {
    state = {
        motorInsurance:'',
        regno:'',
        length:14,
        fastlanelog: []
    }
   
     handleChange = date => {    
        // this.setState({ startDate: date });  
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }


    componentDidMount(){
        this.fetchPolicyDetails();
        console.log("product_id",this.props.match.params)

        // let encryption = new Encryption();
        // let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        // console.log('bc_data',JSON.parse(encryption.decrypt(bc_data)));
        
    }

    fetchData=()=>{
        const {productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo"):0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`sme/details/${policyHolder_id}`)
            .then(res=>{
                // let decryptResp = JSON.parse(encryption.decrypt(res.data))
                // console.log("decrypt", decryptResp)

                // let policyHolder = decryptResp.data.policyHolder.motorinsurance           
                // // let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                // this.setState({ 
                //     policyHolder
                // })
                this.props.loadingStop();
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }

    fetchPolicyDetails=()=>{
        let policy_holder_ref_no = localStorage.getItem("policy_holder_ref_no") ? localStorage.getItem("policy_holder_ref_no"):0;
        let encryption = new Encryption();

        if(this.props.policy_holder_ref_no == null && policy_holder_ref_no != ''){
            
            this.props.loadingStart();
            axios.get(`sme/details/${policy_holder_ref_no}`)
            .then(res=>{              
                let decryptResp = JSON.parse(encryption.decrypt(res.data));

                if(decryptResp.data.policyHolder.step_no > 0){

                    this.props.setData({
                        start_date:decryptResp.data.policyHolder.request_data.start_date,
                        end_date:decryptResp.data.policyHolder.request_data.end_date,
                        
                        policy_holder_id:decryptResp.data.policyHolder.id,
                        policy_holder_ref_no:policy_holder_ref_no,
                        request_data_id:decryptResp.data.policyHolder.request_data.id,
                        completed_step:decryptResp.data.policyHolder.step_no,
                        menumaster_id:decryptResp.data.policyHolder.menumaster_id
                    });

                    

                }

                if(decryptResp.data.policyHolder.step_no == 1 || decryptResp.data.policyHolder.step_no > 1){

                    let risk_arr = JSON.parse(decryptResp.data.policyHolder.smeinfo.risk_address);

                    this.props.setRiskData(
                        {
                            house_building_name:risk_arr.house_building_name,
                            block_no:risk_arr.block_no,
                            street_name:risk_arr.street_name,
                            plot_no:risk_arr.plot_no,
                            house_flat_no:risk_arr.house_flat_no,
                            pincode:decryptResp.data.policyHolder.smeinfo.pincode,
                            pincode_id:decryptResp.data.policyHolder.smeinfo.pincode_id,

                            buildings_sum_insured:decryptResp.data.policyHolder.smeinfo.buildings_sum_insured,
                            content_sum_insured:decryptResp.data.policyHolder.smeinfo.content_sum_insured,
                            stock_sum_insured:decryptResp.data.policyHolder.smeinfo.stock_sum_insured
                        }
                    );
                }

                if(decryptResp.data.policyHolder.step_no == 2 || decryptResp.data.policyHolder.step_no > 2){

                    this.props.setSmeOthersDetails({
                    
                        Commercial_consideration:decryptResp.data.policyHolder.previouspolicy.Commercial_consideration,
                        previous_start_date:decryptResp.data.policyHolder.previouspolicy.start_date,
                        previous_end_date:decryptResp.data.policyHolder.previouspolicy.end_date,
                        Previous_Policy_No:decryptResp.data.policyHolder.previouspolicy.policy_no,
                        insurance_company_id:decryptResp.data.policyHolder.previouspolicy.insurancecompany_id,
                        previous_city:decryptResp.data.policyHolder.previouspolicy.address
        
                    });

                }

                if(decryptResp.data.policyHolder.step_no == 3 || decryptResp.data.policyHolder.step_no > 3){

                    let address = '';
                    if(decryptResp.data.policyHolder.address == null){
                        
                    }else{
                        address = JSON.parse(decryptResp.data.policyHolder.address);

                        this.props.setSmeProposerDetails(
                            {
                                first_name:decryptResp.data.policyHolder.first_name,
                                last_name:decryptResp.data.policyHolder.last_name,
                                salutation_id:decryptResp.data.policyHolder.salutation_id,
                                date_of_birth:decryptResp.data.policyHolder.dob,
                                email_id:decryptResp.data.policyHolder.email_id,
                                mobile:decryptResp.data.policyHolder.mobile,
                                gender:decryptResp.data.policyHolder.gender,
                                pan_no:decryptResp.data.policyHolder.pancard,
                                gstn_no:decryptResp.data.policyHolder.gstn_no,

                                com_street_name:address.street_name,
                                com_plot_no:address.plot_no,
                                com_building_name:address.house_building_name,
                                com_block_no:address.block_no,
                                com_house_flat_no:address.house_flat_no,
                                com_pincode:decryptResp.data.policyHolder.pincode,
                                com_pincode_id:decryptResp.data.policyHolder.pincode_id
                            }
                        );
                    }
                }

                this.props.loadingStop();
            })
            .catch(err => {
                this.props.loadingStop();
            })
        }
        
    }

    handleSubmit=(values, actions)=>{
        const {productId} = this.props.match.params;
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {
            'menumaster_id': '5',
            'page_name': `Registration_SME/${productId}`,
            'vehicle_type_id': productId
        }

        if(sessionStorage.getItem('csc_id')) {
            post_data['bcmaster_id'] = '5'
            post_data['csc_id'] = sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : ""
            post_data['agent_name']= sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : ""
            post_data['product_id'] = productId
        }else{
            let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
            if(bc_data) {
                bc_data = JSON.parse(encryption.decrypt(bc_data));
                post_data['bcmaster_id'] = bc_data ? bc_data.agent_id : ""
                post_data['bc_token'] = bc_data ? bc_data.token : ""
                post_data['bc_agent_id']= bc_data ? bc_data.user_info.data.user.username : ""
                post_data['product_id'] = productId
            }
        }

        let pol_start_date = moment(values.pol_start_date).format('YYYY-MM-DD HH:mm:ss')
        let pol_end_date = moment(values.pol_end_date).format('YYYY-MM-DD hh:mm:ss')

        post_data['pol_start_date'] = pol_start_date
        post_data['pol_end_date'] = pol_end_date

        this.props.loadingStart();
        
        if(this.props.policy_holder_id != null){
            post_data['policy_holder_id'] = this.props.policy_holder_id
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))

            axios.post('sme/update-policy-info',
            formData
            ).then(res=>{
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                // console.log('decryptResp-----', decryptResp)
                if (decryptResp.error === false )
                {
                this.props.loadingStop();
                this.props.setDataUpdate({
                    start_date:values.pol_start_date,
                    end_date:values.pol_end_date
                });
                this.props.history.push(`/RiskDetails/${productId}`);
            } else {
                this.props.loadingStop();
                swal("Thank you for showing your interest for buying product.Due to some reasons, we are not able to issue the policy online.Please call 1800 22 1111");
                actions.setSubmitting(false);
            }
            }).
            catch(err=>{
                this.props.loadingStop();
                let decryptResp = JSON.parse(encryption.decrypt(err.data));
                console.log('decryptErr-----', decryptResp)
                actions.setSubmitting(false);
            })
        }else{
            formData.append('enc_data',encryption.encrypt(JSON.stringify(post_data)))
            axios.post('sme/policy-info',
            formData
            ).then(res=>{     
                let decryptResp = JSON.parse(encryption.decrypt(res.data));   
                localStorage.setItem('policy_holder_ref_no',decryptResp.data.policyHolder_refNo);
                this.props.loadingStop();
                this.props.setData({
                    start_date:values.pol_start_date,
                    end_date:values.pol_end_date,
                    
                    policy_holder_id:decryptResp.data.policyHolder_id,
                    policy_holder_ref_no:decryptResp.data.policyHolder_refNo,
                    request_data_id:decryptResp.data.request_data_id,
                    completed_step:decryptResp.data.completedStep,
                    menumaster_id:decryptResp.data.menumaster_id
                });
                this.props.history.push(`/RiskDetails/${productId}`);
            }).
            catch(err=>{
                this.props.loadingStop();
                actions.setSubmitting(false);
            })
        }
    }
    

    render() {
        const {motorInsurance} = this.state
        const newInitialValues = Object.assign(initialValues,{
            pol_start_date:this.props.start_date != null? new Date(this.props.start_date): null,
            pol_end_date:this.props.end_date != null? new Date(this.props.end_date): null
        })


        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SME Pre UW </h4>
                                <section className="brand">
                                    <div className="boxpd">
                                        <Formik initialValues={newInitialValues} 
                                        onSubmit={this.handleSubmit} 
                                        validationSchema={vehicleRegistrationValidation}
                                        >
                                        {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                            // console.log('values',values)
                                            
                                        return (
                                            <Form>    
                                                {console.log('pol_start_date',values.pol_start_date)}                                                                                
                                            <div className="d-flex justify-content-left">
                                                <div className="brandhead">
                                                </div>
                                            </div>
                                            <div className="brandhead"> 
                                                <h4 className="fs-18 m-b-30">POLICY INFORMATION</h4>
                                            </div>
                                            <Row>
                                                <Col sm={6} md={5} lg={5}>
                                                    <h6>Policy start date & time:</h6>
                                                </Col>
                                                <Col sm={6} md={11} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <DatePicker
                                                                name="pol_start_date"
                                                                minDate={new Date(minDate)}
                                                                maxDate={new Date(maxDate)}
                                                                excludeOutOfBoundsTimes
                                                                dateFormat="dd-MM-yyyy HH:mm"
                                                                // showTimeSelect
                                                                // timeFormat="p"
                                                                timeFormat="HH:mm"
                                                                // timeIntervals={15}
                                                                placeholderText="Policy Start Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                // showMonthDropdown
                                                                // showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                selected={values.pol_start_date}
                                                                onSelect={(val) => {       
                                                                    Math.floor(moment().diff(val, 'days', true)) == 0 ? val.setHours(moment().format("HH"),moment().format("mm"),0,0) : val.setHours(0, 0, 0, 0)                                                                                                            
                                                                    // setFieldTouched('pol_start_date')
                                                                    setFieldValue('pol_start_date', val)
                                                                    //console.log('here',val);
                                                                    setFieldTouched('pol_end_date')
                                                                    setFieldValue('pol_end_date', new Date(new Date(moment(val).add(364, 'day').calendar()).setHours(23, 59, 0, 0) ) );
                                                                }}                            
                                                            />
                                                            {errors.pol_start_date && touched.pol_start_date ? (
                                                                <span className="errorMsg">{errors.pol_start_date}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>
                                                </Row>
                                                <Row>
                                                <Col sm={6} md={5} lg={5}>
                                                    <h6>Policy end date & time:</h6>
                                                </Col>
                                                <Col sm={6} md={11} lg={4}>
                                                    <FormGroup>
                                                        <div className="formSection">
                                                            <DatePicker
                                                                name="pol_end_date"
                                                                minDate={new Date(values.pol_start_date)}
                                                                maxDate={new Date(maxDate)}
                                                                dateFormat="dd-MM-yyyy HH:mm"
                                                                showTimeSelect
                                                                // dateFormat="Pp"
                                                                timeFormat="HH:mm"
                                                                placeholderText="Policy End Date & Time"
                                                                peekPreviousMonth
                                                                autoComplete="off"
                                                                peekPreviousYear
                                                                disabled={true}
                                                                showMonthDropdown
                                                                showYearDropdown
                                                                dropdownMode="select"
                                                                className="datePckr inputfs12"
                                                                // selected={values.pol_end_date}    
                                                                selected={values.pol_end_date}
                                                                onChange={(val) => {                                                            
                                                                    setFieldTouched('pol_end_date')
                                                                    setFieldValue('pol_end_date', val);
                                                                }}   
                                                                                       
                                                            />
                                                            {errors.pol_end_date && touched.pol_end_date ? (
                                                                <span className="errorMsg">{errors.pol_end_date}</span>
                                                            ) : null}
                                                        </div>
                                                    </FormGroup>
                                                </Col>                                           
                                            </Row>
                                            <div className="brandhead"> 
                                                <p>&nbsp;</p>
                                            </div>
                                           
                                            <div className="cntrbtn">
                                            <Button className={`btnPrimary`} type="submit" >
                                                Go
                                            </Button>                                      
                                            </div>
                                        </Form>
                                        );
                                    }}
                                    </Formik>
                                    </div>

                                </section>
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
      loading: state.loader.loading,
      start_date: state.sme_fire.start_date,
      end_date: state.sme_fire.end_date,
      policy_holder_id: state.sme_fire.policy_holder_id,
      policy_holder_ref_no:state.sme_fire.policy_holder_ref_no,
      request_data_id:state.sme_fire.request_data_id,
      completed_step:state.sme_fire.completed_step,
      menumaster_id:state.sme_fire.menumaster_id
    };
  };
  
  const mapDispatchToProps = dispatch => {
    return {
      loadingStart: () => dispatch(loaderStart()),
      loadingStop: () => dispatch(loaderStop()),
      setData:(data) => dispatch(setSmeData(data)),
      setDataUpdate:(data) => dispatch(setSmeUpdateData(data)),
      setRiskData:(data) => dispatch(setSmeRiskData(data)),
      setSmeProposerDetails:(data) => dispatch(setSmeProposerDetailsData(data)),
      setSmeOthersDetails:(data) => dispatch(setSmeOthersDetailsData(data))
    };
  };

export default withRouter (connect( mapStateToProps, mapDispatchToProps)(Registration_sme));