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
import ScrollArea from 'react-scrollbar';
import Encryption from '../../shared/payload-encryption';
import { setData } from "../../store/actions/data";



const initialValues = {
    selectedBrandId: '',
    selectedBrandName: '',
    selectedModelId: '',
    selectedModelName: '',
    selectedVarientId: ''

};

const fuel = {
    1: 'Petrol',
    2: 'Diesel',
    3: 'CNG'
}


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
            searchitem: [],
            search: "",
            otherBrands: false,
            brandName: '',
            modelName: '',
            fuelType: '',
            vehicleDetails: [],
            pageLoad: '0',
            fastLaneData: [],
            fastlanelog: []
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
        // this.callFetchBrands();
        this.fetchData();
    }


    change = (text) => {

        this.state.searchitem = [];
        this.state.brandModelList.map((item, index) => {

            var rgxp = new RegExp(text.toUpperCase(), "g");
            if (item.name.toUpperCase().match(rgxp) && item.name.toUpperCase().match(rgxp) != null) {

                this.state.searchitem.push(item);
            }
        });

        if (this.state.searchitem && this.state.searchitem.length > 0) {
            this.setState({
                searchitem: this.state.searchitem,
                search: text

            });
        }
    }

    getBrands = () => {
        const { productId } = this.props.match.params
        const {vehicleDetails} = this.state
        let brandId = vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""
        return new Promise(resolve => {
            axios.get(`vehicle/brand-with-image`)
                .then(res => {
                    let brandList = res && res.data.data.list ? res.data.data.list : []
                    this.setState({
                        brandList,
                        otherBrands: false
                    })
                    this.props.loadingStop();
                    if(localStorage.getItem('newBrandEdit') == '1') {
                        this.setBrandName(brandId)
                    }
                    else if(localStorage.getItem('newBrandEdit') == '2') {
                        this.getOtherBrands()
                    }
                })
                .catch(err => {
                    // handle error
                    // console.log(error);
                    this.props.loadingStop();
                })
        })

    }

    getOtherBrands = () => {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        this.props.loadingStart();
        axios.get(`vehicle/brand-without-image/${policyHolder_id}`).then(res => {
            let selectedBrandDetails = res.data && res.data.data ? res.data.data : {};
            let brandModelList = res.data && res.data.data ? res.data.data.list : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: true,
                searchitem: [],
                modelName: [],
                vehicleDetails: [],
                selectedBrandId: "",
                selectedModelId: [], 
                selectedVarientId: [],
                brandName: ""
                // selectedBrandId: brand_id
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
               // console.log(error);
                this.props.loadingStop();
            })

    }

    fetchData = () => {
        const { productId } = this.props.match.params
        console.log("redux data----- ", this.props.data)
        let policyHolder_id = localStorage.getItem("policyHolder_refNo") ? localStorage.getItem("policyHolder_refNo") : 0;
        let encryption = new Encryption();
        this.props.loadingStart();
        axios.get(`policy-holder/motor/${policyHolder_id}`)
            .then(res => {
                let decryptResp = JSON.parse(encryption.decrypt(res.data));
                console.log("decrypt", decryptResp)
                let motorInsurance = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.motorinsurance : {}
                let vehicleDetails = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.vehiclebrandmodel : {};
                let fastlanelog = decryptResp.data.policyHolder ? decryptResp.data.policyHolder.fastlanelog : {};
                this.setState({
                    motorInsurance, vehicleDetails, fastlanelog
                })
                console.log("this.props.data------ ", this.props.data)
                if(this.props.data == null) {
                    this.setState({pageLoad: '1' })
                    this.getBrands();
                }             
                else {
                    
                    if( this.props.data.fastLaneData || this.props.data.brandEdit && this.props.data.brandEdit == '0' ) {
                        this.setState({pageLoad: '0', fastLaneData: this.props.data.fastLaneData})
                        // this.props.loadingStop();
                        this.handleSubmit(this.props.data.fastLaneData, '0')
                    }
                    else {
                        this.setState({pageLoad: '1' })
                        this.getBrands();
                    }
                }
               
            })
            .catch(err => {
                // handle error
                this.props.loadingStop();
            })
    }


    registration = (productId) => {
        this.props.history.push(`/Registration/${productId}`);
    }

    selectBrand = (productId) => {
        const {selectedBrandId , vehicleDetails, otherBrands} = this.state
        let brandId= selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : "")
        if(localStorage.getItem('brandEdit') == '1') {
            this.setBrandName(brandId)
        }
        else if(localStorage.getItem('brandEdit') == '2') {
            this.getOtherBrands()
        }
    }

    selectVehicle = (productId) => {
        this.props.history.push(`/Select-brand/${productId}`);
    }


    setBrandName = (brand_id) => {
        let policyHolder_id = localStorage.getItem("policyHolder_id") ? localStorage.getItem("policyHolder_id") : 0;
        const formData = new FormData();
        this.props.loadingStart();
        axios.get(`vehicle/model-with-varient/${brand_id}/${policyHolder_id}`).then(res => {
            let selectedBrandDetails = res.data && res.data.data ? res.data.data : {};
            let brandModelList = res.data && res.data.data.brand_models ? res.data.data.brand_models : [];

            this.setState({
                selectedBrandDetails,
                brandModelList,
                show: true,
                otherBrands: false,
                selectedBrandId: brand_id,
                brandName: selectedBrandDetails.name,
                searchitem: [],
                modelName: "",
                vehicleDetails: []
            })

            this.props.loadingStop();
        })
            .catch(err => {
                // handle error
                // console.log(error);
                this.props.loadingStop();
            })

    }

    setVarient = (varient, model_Id, modelName, fuelType) => {        
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            modelName: modelName,
            fuelType: fuelType
        })
    }

    setOtherVarient = (varient, model_Id, brand_Id, brandName, modelName, fuelType) => {
        // brandEdit = 1 for model, 2 for other Varient
        this.setState({
            selectedVarientId: varient,
            selectedModelId: model_Id,
            selectedBrandId: brand_Id,
            brandName: brandName,
            modelName: modelName,
            fuelType: fuelType
        })
    }

    handleSubmit = (values, pageLoad) => {
        const { productId } = this.props.match.params
        const { selectedVarientId, selectedModelId, selectedBrandId, fastlanelog } = this.state
        const formData = new FormData();
        let encryption = new Encryption();
        let post_data = {}
        pageLoad = pageLoad == '1' || pageLoad == '0' ? pageLoad : '1'
        console.log('pageLoad--- ', pageLoad)
        if(pageLoad == '1') {
             post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'brand_id': values.selectedBrandId,
                'brand_model_id': values.selectedModelId,
                'model_varient_id': values.selectedVarientId,
                'page_name': `Select-brand/${productId}`,
            }
        } else {
             post_data = {
                'policy_holder_id': localStorage.getItem('policyHolder_id'),
                'menumaster_id': 1,
                'brand_id': values.brand_id,
                'brand_model_id': values.brand_model_id,
                'model_varient_id': values.model_varient_id,
                'page_name': `Select-brand/${productId}`,
                'fastlaneLog_id': values && values.fastlaneLog_id ? values.fastlaneLog_id : fastlanelog && fastlanelog.id ? fastlanelog.id : ""
            }
        }
        console.log('post_data---fastlane--- ', post_data)
        formData.append('enc_data', encryption.encrypt(JSON.stringify(post_data)))
        this.props.loadingStart();
        axios.post('insert-brand-model-varient', formData).then(res => {
            this.props.loadingStop();
            if (res.data.error == false) {
                if(this.state.otherBrands) {
                    localStorage.setItem('brandEdit', 2)
                    localStorage.removeItem('newBrandEdit')
                }
                else {
                    localStorage.setItem('brandEdit', 1)
                    localStorage.removeItem('newBrandEdit')
                }
                this.props.history.push(`/VehicleDetails/${productId}`);
            }

        })
            .catch(err => {
                // handle error
                if(err.status == '422') {
                    swal("Please select vehicle model")
                }
                this.props.loadingStop();
            })
    }


    render() {
        const { brandList, motorInsurance, selectedBrandDetails, brandModelList, selectedBrandId, pageLoad, fastLaneData,
             selectedModelId, selectedVarientId, otherBrands, brandName, modelName, fuelType, vehicleDetails } = this.state
        const { productId } = this.props.match.params
        let newInitialValues = {}

        pageLoad == '1' ? 
         newInitialValues = Object.assign(initialValues, {
            selectedBrandId: selectedBrandId ? selectedBrandId : (vehicleDetails && vehicleDetails.vehiclebrand_id ? vehicleDetails.vehiclebrand_id : ""),
            selectedModelId:  selectedModelId ? selectedModelId : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel_id ? vehicleDetails.vehiclemodel_id : ""),
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: selectedVarientId ? selectedVarientId : (selectedBrandId ? "" :  vehicleDetails && vehicleDetails.varientmodel_id ? vehicleDetails.varientmodel_id : ""),

        }) : 
        newInitialValues = Object.assign(initialValues, {
            selectedBrandId: fastLaneData ? fastLaneData.brand_id : "",
            selectedModelId:  fastLaneData ? fastLaneData.brand_model_id : "",
            selectedBrandName: '',
            selectedModelName: '',
            selectedVarientId: fastLaneData ? fastLaneData.model_varient_id : "",

        })

        // console.log("vehicleDetails", newInitialValues)

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
                                {this.props.data && this.props.data.brandEdit && this.props.data.brandEdit == '1' || pageLoad == '1' ?
                                <Formik initialValues={newInitialValues}
                                    onSubmit={this.handleSubmit}
                                // validationSchema={vehicleValidation}
                                >
                                    {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched }) => {
                                        // console.log("aaaaaa=GHHH====>", values)
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
                                                                <BrandTable brandList={brandList && brandList.length > 0 ? brandList : []} selectBrandFunc={this.setBrandName} otherBrandFunc={this.getOtherBrands}/>



                                                                <div className="d-flex justify-content-left resmb">
                                                                    <Button className={`backBtn`} type="button" onClick={this.registration.bind(this, productId)}>
                                                                        Back
                                                                </Button>
                                                                    <Button className={`proceedBtn`} type="submit" >
                                                                        Continue
                                                                </Button>
                                                                </div>


                                                            </Col>

                                                            <Col sm={12} md={3}>
                                                                <div className="regisBox">
                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">

                                                                        <div className="txtRegistr resmb-15">Registration No.<br />
                                                                            {motorInsurance && motorInsurance.registration_no}</div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.registration.bind(this, productId)}>Edit</button></div>
                                                                    </div>



                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr resmb-15">Car Brand
                                                                            - <strong>{brandName ? brandName : (vehicleDetails && vehicleDetails.vehiclebrand && vehicleDetails.vehiclebrand.name ? vehicleDetails.vehiclebrand.name : "")}</strong>
                                                                        </div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectVehicle.bind(this, productId)}>Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">Car Model<br />
                                                                            <strong>{modelName ? modelName : (selectedBrandId ? "" : vehicleDetails && vehicleDetails.vehiclemodel && vehicleDetails.vehiclemodel.description ? vehicleDetails.vehiclemodel.description+" "+vehicleDetails.varientmodel.varient : "")}</strong></div>

                                                                        <div> <button type="button" className="rgistrBtn" onClick={this.selectBrand.bind(this, productId)}>Edit</button></div>
                                                                    </div>

                                                                    <div className="d-flex justify-content-between flex-lg-row flex-md-column m-b-25">
                                                                        <div className="txtRegistr">Fuel Type<br />
                                                                            <strong>{fuel[fuelType] ? fuel[fuelType] : (vehicleDetails && vehicleDetails.varientmodel && vehicleDetails.varientmodel.fuel_type ? fuel[vehicleDetails.varientmodel.fuel_type] : null)} </strong></div>

                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        </Row>
                                                    </div>
                                                </section>


                                            </Form>
                                        );
                                    }}
                                </Formik> : null }
                            </div>

                        </div>
                    </div>
                </BaseComponent>

                <Modal className="customModal brandModal" bsSize="md"
                    show={this.state.show}
                    onHide={this.handleClose}>
                    <Modal.Header closeButton className="custmModlHead">
                        <div className="cntrbody">
                            <h3>Select Model </h3>
                            {selectedBrandDetails.image ?
                                <img src={`${process.env.REACT_APP_PAYMENT_URL}/core/public/image/car_brand_image/` + selectedBrandDetails.image} alt={selectedBrandDetails.name} /> :
                                <img src={require('../../assets/images/car.svg')} alt="" />
                            }
                        </div>
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
                                        onChange={e => this.change(e.target.value)}
                                    />
                                </div>
                            </FormGroup>
                            {otherBrands == false ? 
                            <ScrollArea
                                speed={0.8}
                                className="area"
                                contentClassName="content"
                                horizontal={false}
                            >
                                {this.state.searchitem && this.state.searchitem.length > 0 ?

                                    (
                                        this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                            brand.varientmodel && brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                                <div key= {varientIndex} className="brdrbottom">
                                                    <label className="d-flex justify-content-between">
                                                        <div className="modalboxInfo">{brand.name}
                                                            <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                        </div>
                                                            <div className="customCheckBox formGrp formGrp">
                                                                <input type="radio"
                                                                    name="varient"
                                                                    className="user-self"
                                                                    id="varient"
                                                                    value={varient.id}
                                                                    aria-invalid="false"
                                                                    onClick={(e) =>
                                                                        this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                            varient.fuel_type)
                                                                    }
                                                                />
                                                                <span className="checkmark mL-0"></span>
                                                                <span className="error-message"></span>
                                                            </div>                                                       
                                                    </label>
                                                </div>
                                            )))
                                        ))
                                    : 
                                    (brandModelList && brandModelList.length > 0 && brandModelList.map((brand, brandIndex) => (
                                        brand.varientmodel && brand.varientmodel.length > 0 && brand.varientmodel.map((varient, varientIndex) => (
                                            
                                            <div key= {varientIndex} className="brdrbottom">
                                                <label className="d-flex justify-content-between">
                                                    <div className="modalboxInfo">{brand.name}
                                                        <span className="grey ml-5">{varient.varient + " " + varient.cc + "cc"}</span>
                                                    </div>   
                                                        <div className="customCheckBox formGrp formGrp">
                                                            <input type="radio"
                                                                name="varient"
                                                                className="user-self"
                                                                id="varient"
                                                                value={varient.id}
                                                                aria-invalid="false"
                                                                onClick={(e) =>
                                                                    this.setVarient(e.target.value, brand.id, brand.name+" "+varient.varient, 
                                                                    varient.fuel_type)
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>    
                                                </label>
                                            </div>
                                        ))
                                    ))
                                    )
                                }

                            </ScrollArea> : 
                            <ScrollArea
                            speed={0.8}
                            className="area"
                            contentClassName="content"
                            horizontal={false}
                        >
                            {this.state.searchitem && this.state.searchitem.length > 0 ?

                                (
                                    this.state.searchitem && this.state.searchitem.length > 0 && this.state.searchitem.map((brand, brandIndex) => (
                                        brand.brand_models && brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                            model.varientmodel && model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (
                                            <div key= {varientIndex} className="brdrbottom">
                                                <label className="d-flex justify-content-between">
                                                    <div className="modalboxInfo">{brand.name}
                                                        <span className="grey ml-5">{model.name+" "+varient.varient+ " "+varient.cc+"cc" }</span>
                                                    </div>        
                                                        <div className="customCheckBox formGrp formGrp">
                                                            <input type="radio"
                                                                name="varient"
                                                                className="user-self"
                                                                id="varient"
                                                                value={varient.id}
                                                                aria-invalid="false"
                                                                onClick={(e) =>
                                                                    this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                        brand.name, model.name+" "+varient.varient, varient.fuel_type )
                                                                }
                                                            />
                                                            <span className="checkmark mL-0"></span>
                                                            <span className="error-message"></span>
                                                        </div>        
                                                </label>
                                            </div>
                                        )))
                                    ))))
                                :
                                (this.state.brandModelList && this.state.brandModelList.length > 0 && this.state.brandModelList.map((brand, brandIndex) => (
                                    brand.brand_models && brand.brand_models.length > 0 && brand.brand_models.map((model, modelIndex) => (
                                        model.varientmodel && model.varientmodel.length > 0 && model.varientmodel.map((varient, varientIndex) => (

                                        <div key= {varientIndex} className="brdrbottom">
                                            <label className="d-flex justify-content-between">
                                                <div className="modalboxInfo">{brand.name}
                                                    <span className="grey ml-5">{model.name+" "+varient.varient+ " "+varient.cc+"cc"}</span>
                                                </div>
                                                    <div className="customCheckBox formGrp formGrp">
                                                        <input type="radio"
                                                            name="varient"
                                                            className="user-self"
                                                            id="varient"
                                                            value={varient.id}
                                                            aria-invalid="false"
                                                            onClick={(e) =>
                                                                this.setOtherVarient(e.target.value, model.id, model.brand_id,
                                                                    brand.name, model.name+" "+varient.varient, varient.fuel_type )
                                                            }
                                                        />
                                                        <span className="checkmark mL-0"></span>
                                                        <span className="error-message"></span>
                                                    </div>                                 
                                            </label>
                                        </div>
                                    ))))
                                ))
                                )}

                        </ScrollArea>}
                        </div>
                        {selectedVarientId ?
                            <button className="proceedBtn" href={'#'}
                                onClick={(e) =>
                                    this.handleClose()
                                }
                            >
                                Continue</button> : null}
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
const mapStateToProps = state => {
    return {
        loading: state.loader.loading,
        data: state.processData.data
    };
};

const mapDispatchToProps = dispatch => {
    return {
        loadingStart: () => dispatch(loaderStart()),
        loadingStop: () => dispatch(loaderStop()),
        setData: (data) => dispatch(setData(data))
    };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectBrand));