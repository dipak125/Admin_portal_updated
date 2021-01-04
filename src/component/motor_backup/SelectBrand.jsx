import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import { Row, Col, Modal, Button, FormGroup } from 'react-bootstrap';
import BrandTable from '../common/BrandTable';
import BaseComponent from '.././BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from "../../shared/axios";
import { withRouter } from 'react-router-dom';
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import swal from 'sweetalert';
import DatePicker from "react-datepicker";
import ScrollArea from 'react-scrollbar';



const initialValues = {
    selectedBrandId: '',
    selectedBrandName: '',
    selectedModelId: '',
    selectedModelName: '',
    selectedVarientId: ''

};

const vehicleValidation = Yup.object().shape({
    selectedBrandId: Yup.string().required("Please enter the brand name"),
    selectedModelId: Yup.string().required("Please enter the model name"),
    // selectedVarientId : Yup.string().required("Please enter the varient name"),
})


class SelectBrand extends Component {

    constructor(props) {
        super(props);

        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = {
            show: false,
            brandList: [],
            motorInsurance: {},
            selectedBrandId: '',
            selectedBrandName: '',
            selectedModelId: '',
            selectedModelName: '',
            selectedBrandDetails: {},
            brandModelList: [],
            selectedVarientId: '',
            varientmodel: []
        };
    }

    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }

    changePlaceHoldClassAdd(e) {
        let element = e.target.parentElement;
        element.classList.add('active');
    }

    changePlaceHoldClassRemove(e) {
        let element = e.target.parentElement;
        e.target.value.length === 0 && element.classList.remove('active');
    }

    componentDidMount() {
        this.callFetchBrands();
        this.fetchData();

    }

    callFetchBrands = async () => {
        const result = await this.getBrands();
    }

    getBrands = () => {
        const { productId } = this.props.match.params
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("aaasssssss======>", productId)
                axios.get(`vehicle/brands`)
                    .then(res => {
                        console.log("aaaaaabbbbbirssssss========>", res.data.data.list)
                        let brandList = res && res.data.data.list ? res.data.data.list : []
                        this.setState({
                            brandList
                        })
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    })
            }
                , 2000)
        })
    }

    fetchData = () => {
        const { productId } = this.props.match.params
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
                let motorInsurance = res.data.data.policyHolder.motorinsurance

                this.setState({
                    motorInsurance
                })

            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
    }





    fetchVarient = (model_id) => {
        /// const {productId } = this.props.match.params
        /// let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id"):0;
        axios.get(`brand-model/${model_id}`)
            .then(res => {
                //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
                let varientmodel = res.data.data.varientmodel
                this.setState({
                    varientmodel
                })

            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })
    }

    registration = (productId) => {
        this.props.history.push(`/Registration/${productId}`);
    }



    setBrandName = (brand_id) => {
        console.log('POP=================>', brand_id)
        axios.get(`vehicle/brand/${brand_id}`).then(res => {
            //console.log("aaaaaabbbbbir========>",response.data.data.policyHolder.request_data.family_members)
            let selectedBrandDetails = res.data && res.data.data.brand ? res.data.data.brand : {};
            let brandModelList = res.data && res.data.data.brand ? res.data.data.brandModel : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true
            })


        })
            .catch(function (error) {
                // handle error
                console.log(error);
            })

        //this.handleShow()

    }

    handleSubmit = (values) => {
        const { productId } = this.props.match.params
        this.props.history.push(`/OtherComprehensive/${productId}`);
    }


    render() {
        const { brandList, varientmodel, motorInsurance, selectedBrandDetails, brandModelList, selectedBrandId, selectedModelId, selectedVarientId } = this.state
        const { productId } = this.props.match.params
        const newInitialValues = Object.assign(initialValues, {
            selectedBrandId: selectedBrandId ? selectedBrandId : '',
            selectedModelId: selectedModelId ? selectedModelId : '',
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: selectedVarientId ? selectedVarientId : '',

        })


        console.log("BRAND ssss ID====>", selectedBrandDetails);
        //console.log("MODEL ID====>",selectedModelId);
        return (
            <>
                <BaseComponent>
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                                <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>

                                <Formik initialValues={newInitialValues}
                                    onSubmit={this.handleSubmit}
                                // validationSchema={vehicleValidation}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                        console.log("aaaaaa=GHHH====>", values)
                                        return (
                                            <Form>
                                                <section className="brand">
                                                    <div className="brand-bg">
                                                        <div className="d-flex justify-content-left">
                                                            <div className="brandhead">
                                                                <h4>Please select  your car brand </h4>
                                                                <p>Lets start with your car details</p>
                                                            </div>
                                                        </div>

                                                        <Row>
                                                            <Col sm={12} md={9}>
                                                                <BrandTable brandList={brandList && brandList.length > 0 ? brandList : []} selectBrandFunc={this.setBrandName} />

                                                                <Row>
                                                                    <Col sm={12} md={5} lg={5}>
                                                                        <FormGroup>
                                                                            <div className="fs-18">
                                                                                First Purchase/Registration Date
                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={3}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name='fPurchaseDate'
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    className="formGrp"
                                                                                    value={values.fPurchaseDate}
                                                                                >
                                                                                    <option value="">Select Year</option>
                                                                                    <option value="male">2020</option>
                                                                                    <option value="female">2019</option>
                                                                                    <option value="female">2018</option>
                                                                                    <option value="female">2017</option>
                                                                                    <option value="female">2016</option>
                                                                                    <option value="female">2015</option>
                                                                                    <option value="female">2014</option>
                                                                                    <option value="female">2013</option>
                                                                                    <option value="female">2012</option>
                                                                                    <option value="female">2011</option>
                                                                                    <option value="female">2010</option>
                                                                                    <option value="female">2009</option>
                                                                                </Field>
                                                                                {errors.fPurchaseDate && touched.fPurchaseDate ? (
                                                                                    <span className="errorMsg">{errors.fPurchaseDate}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={3} lg={3}>
                                                                        <FormGroup>
                                                                            <div className="formSection">
                                                                                <Field
                                                                                    name='fPurchaseMnt'
                                                                                    component="select"
                                                                                    autoComplete="off"
                                                                                    className="formGrp"
                                                                                    value={values.fPurchaseMnt}
                                                                                >
                                                                                    <option value="">Select Month</option>
                                                                                    <option value="male">January</option>
                                                                                    <option value="female">February</option>
                                                                                    <option value="female">March</option>
                                                                                    <option value="female">April</option>
                                                                                    <option value="female">May</option>
                                                                                    <option value="female">June</option>
                                                                                    <option value="female">July</option>
                                                                                    <option value="female">August</option>
                                                                                    <option value="female">September</option>
                                                                                    <option value="female">October</option>
                                                                                    <option value="female">November</option>
                                                                                    <option value="female">December</option>
                                                                                </Field>
                                                                                {errors.fPurchaseMnt && touched.fPurchaseMnt ? (
                                                                                    <span className="errorMsg">{errors.gender}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>

                                                                <Row className="m-b-25">
                                                                    <Col sm={12} md={5} lg={5}>
                                                                        <FormGroup>
                                                                            <div className="fs-18">
                                                                                Registration City
                                                         </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                    <Col sm={12} md={6} lg={6}>
                                                                        <FormGroup>
                                                                            <div className="insurerName">
                                                                                <Field
                                                                                    name="Registration City"
                                                                                    type="text"
                                                                                    placeholder="Registration City"
                                                                                    autoComplete="off"
                                                                                    onFocus={e => this.changePlaceHoldClassAdd(e)}
                                                                                    onBlur={e => this.changePlaceHoldClassRemove(e)}
                                                                                />
                                                                                {errors.eia_account_no && touched.eia_account_no ? (
                                                                                    <span className="errorMsg">{errors.eia_account_no}</span>
                                                                                ) : null}
                                                                            </div>
                                                                        </FormGroup>
                                                                    </Col>
                                                                </Row>

                                                                

                                                                <div className="d-flex justify-content-left resmb">
                                                                    <button className="backBtn" onClick={this.registration.bind(this, productId)}>Back</button>
                                                                    <button className="proceedBtn" type="submit" >Continue</button>
                                                                </div>

                                                                {/*<FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="selectedBrandId"
                                                        component="select"
                                                        className="formGrp"                                                       
                                                        onChange={e => {      
                                                            console.log("aaaaaaa========>",e.target.value)                                                                                                                  
                                                            setFieldValue('selectedBrandId', e.target.value);
                                                            
                                                            this.setBrandName(e.target.value);
                                                            this.setState({
                                                                selectedBrandId:e.target.value
                                                            })
                                                        }}
                                                        value = {values.selectedBrandId}
                                                    >
                                                       <option value="">Select Brand</option>
                                                       {brandList && brandList.map((v,i)=>
                                                            <option value={v.id}>{v.name}</option>
                                                       )}
                                                    </Field>     
                                                    {errors.selectedBrandId  ? (
                                                    <span className="errorMsg">{errors.selectedBrandId}</span>
                                                ) : null}                   
                                                </div>
                                                    </FormGroup> */}

                                                                {/*  <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="selectedModelId"
                                                        component="select"
                                                        autoComplete="off"                                                                        
                                                        className="formGrp"
                                                        onChange={(e) => {
                                                            setFieldValue(`selectedModelId`, e.target.value);
                                                            this.fetchVarient(e.target.value)
                                                           // this.setBrandName(e.target.value);
                                                            //this.showEIAText(1);
                                                            this.setState({
                                                                selectedModelId:e.target.value
                                                            })
                                                        }}
                                                        value = {values.selectedModelId}
                                                    >
                                                        <option value="">Select Model</option>
                                                        {brandModelList && brandModelList.length > 0 ? brandModelList.map((v,i)=>
                                                            <option value={v.id}>{v.name}</option>
                                                        ):''}
                                                        
                                                        
                                                    </Field>     
                                                    {errors.selectedModelId  ? (
                                                    <span className="errorMsg">{errors.selectedModelId}</span>
                                                ) : null}                   
                                                </div>
                                            </FormGroup>
                                            {varientmodel && varientmodel.length>0 ?            
                                            <FormGroup>
                                                <div className="formSection">
                                                    <Field
                                                        name="selectedVarientId"
                                                        component="select"
                                                        autoComplete="off"                                                                        
                                                        className="formGrp"
                                                        onChange={(e) => {
                                                            setFieldValue(`selectedVarientId`, e.target.value);
                                                           // this.setBrandName(e.target.value);
                                                            //this.showEIAText(1);
                                                            this.setState({
                                                                selectedVarientId:e.target.value
                                                            })
                                                        }}
                                                        value = {values.selectedVarientId}
                                                    >
                                                        <option value="">Select Model</option>
                                                        {varientmodel && varientmodel.length > 0 ? varientmodel.map((v,i)=>
                                                            <option value={v.id}>{v.varient+'-'+v.body_style}</option>
                                                        ):''}
                                                        
                                                        
                                                    </Field>     
                                                    {errors.selectedVarientId  ? (
                                                    <span className="errorMsg">{errors.selectedVarientId}</span>
                                                ) : null}                   
                                                </div>
                                            </FormGroup>:''}
                                                
                                                    */}
                                                            </Col>

                                                            <Col sm={12} md={3}>
                                                                <div className="regisBox">
                                                                <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                   
                                                                            <div className="txtRegistr resmb-15">Registration No.<br/>
                                                        {motorInsurance && motorInsurance.registration_no}</div>
                                                                       
                                                                           <div> <button className="rgistrBtn" onClick={this.registration.bind(this, productId)}>Edit</button></div>
                                                                            </div>
                                                                      

                                                                    
                                                                        <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                            <div className="txtRegistr resmb-15">Car Brand
                                                           - {selectedBrandDetails && selectedBrandDetails.name}</div>
                                                                        
                                                           <div> <button className="rgistrBtn">Edit</button></div>
                                                                            </div>
                                                                       
                                                                        <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                            <div className="txtRegistr">Car Model<br />
                                                                                <strong>4S CHAMPION</strong></div>
                                                                        
                                                                                <div> <button className="rgistrBtn">Edit</button></div>
                                                                            </div>
                                                                     
                                                                        <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                            <div className="txtRegistr">Fuel Type<br />
                                                                                <strong>PETROL </strong></div>
                                                                       
                                                                </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </section>


                                            </Form>
                                        );
                                    }}
                                </Formik>
                            </div>

                        </div>
                    </div>
                </BaseComponent>

                <Modal className="customModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead">
                        <div className="cntrbody">
                            <h3>Select Model </h3>
                            <img src={require('../../assets/images/image-02.svg')} alt="" /></div>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="modalForm">
                            <FormGroup>
                                <div className="main">
                                    <input
                                        name="search"
                                        type="search"
                                        className="srchimg"
                                        placeholder="Search your variant "
                                        onFocus={e => this.changePlaceHoldClassAdd(e)}
                                        onBlur={e => this.changePlaceHoldClassRemove(e)}
                                    />
                                </div>
                            </FormGroup>

                            <ScrollArea
                                speed={0.8}
                                className="area"
                                contentClassName="content"
                                horizontal={false}
                            >
                                <div className="brdrbottom">
                                    <div className="d-flex justify-content-between">
                                        <div className="modalboxInfo">Accord
                                        <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                        </div>
                                        <div>
                                            <label className="customCheckBox formGrp formGrp">
                                                <input type="checkbox"
                                                    name="family[Self][check]"
                                                    className="user-self"
                                                    id="family[Self][check]"
                                                    value="1"
                                                    aria-invalid="false" />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="brdrbottom">
                                    <div className="d-flex justify-content-between">
                                        <div className="modalboxInfo">Honda City
                                        <span className="grey ml-5">1.2 E MT 1198CC</span>
                                        </div>
                                        <div>
                                            <label className="customCheckBox formGrp formGrp">
                                                <input type="checkbox"
                                                    name="family[Self][check]"
                                                    className="user-self"
                                                    id="family[Self][check]"
                                                    value="1"
                                                    aria-invalid="false" />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="brdrbottom">
                                    <div className="d-flex justify-content-between">
                                        <div className="modalboxInfo">NEON
                                        <span className="grey ml-5">1.2 EX MT 1198CC</span>
                                        </div>
                                        <div>
                                            <label className="customCheckBox formGrp formGrp">
                                                <input type="checkbox"
                                                    name="family[Self][check]"
                                                    className="user-self"
                                                    id="family[Self][check]"
                                                    value="1"
                                                    aria-invalid="false" />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="brdrbottom">
                                    <div className="d-flex justify-content-between">
                                        <div className="modalboxInfo">BRIO
                                        <span className="grey ml-5">1.2 S AT 1198CC</span>
                                        </div>
                                        <div>
                                            <label className="customCheckBox formGrp formGrp">
                                                <input type="checkbox"
                                                    name="family[Self][check]"
                                                    className="user-self"
                                                    id="family[Self][check]"
                                                    value="1"
                                                    aria-invalid="false" />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="brdrbottom">
                                    <div className="d-flex justify-content-between">
                                        <div className="modalboxInfo">Accord
                                        <span className="grey ml-5">1.2 E I-VTEC 1198CC</span>
                                        </div>
                                        <div>
                                            <label className="customCheckBox formGrp formGrp">
                                                <input type="checkbox"
                                                    name="family[Self][check]"
                                                    className="user-self"
                                                    id="family[Self][check]"
                                                    value="1"
                                                    aria-invalid="false" />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="brdrbottom">
                                    <div className="d-flex justify-content-between">
                                        <div className="modalboxInfo">Honda City
                                        <span className="grey ml-5">1.2 E MT 1198CC</span>
                                        </div>
                                        <div>
                                            <label className="customCheckBox formGrp formGrp">
                                                <input type="checkbox"
                                                    name="family[Self][check]"
                                                    className="user-self"
                                                    id="family[Self][check]"
                                                    value="1"
                                                    aria-invalid="false" />
                                                <span className="checkmark mL-0"></span>
                                                <span className="error-message"></span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                        <button className="proceedBtn" href={'#'}>Continue</button>
                    </Modal.Body>
                </Modal>
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectBrand));