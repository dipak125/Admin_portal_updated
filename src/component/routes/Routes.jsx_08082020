import React, { Component } from 'react';
import { Route, Switch, BrowserRouter,Redirect, withRouter, HashRouter } from "react-router-dom";
import { Formik, Field, Form } from "formik";

import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { authValidate } from "../../store/actions/auth";
import { PrivateRoute } from "../../shared/private-route";
import Loader from "react-loader-spinner";

import LogIn from "../common/login/LogIn";

import Registration from '../motor/Registration';
// import SelectBrand from '../motor/SelectBrand';
import VehicleDetails from '../motor/VehicleDetails';
import AdditionalDetails from '../motor/AdditionalDetails';
import OtherComprehensive from '../motor/OtherComprehensive';
import Premium from '../motor/Premium';
// import ThankYou_motor from '../motor/ThankYou';

// import TwoWheelerRegistration from '../two-wheeler/TwoWheelerRegistration';
import TwoWheelerSelectBrand from '../two-wheeler/TwoWheelerSelectBrand';
import TwoWheelerVehicleDetails from '../two-wheeler/TwoWheelerVehicleDetails';
import TwoWheelerPolicyPremiumDetails from '../two-wheeler/TwoWheelerPolicyPremiumDetails';
import TwoWheelerOtherComprehensive from '../two-wheeler/TwoWheelerOtherComprehensive';
import TwoWheelerVerify from '../two-wheeler/TwoWheelerVerify';
import TwoWheelerAdditionalDetails from '../two-wheeler/TwoWheelerAdditionalDetails';
// import TwoWheelerThankYou_motor from '../two-wheeler/TwoWheelerThankYou';

import TwoWheelerSelectBrandTP from '../two-wheeler-tp/TwoWheelerSelectBrandTP';
import TwoWheelerVehicleDetailsTP from '../two-wheeler-tp/TwoWheelerVehicleDetailsTP';
import TwoWheelerPolicyPremiumDetailsTP from '../two-wheeler-tp/TwoWheelerPolicyPremiumDetailsTP';
import TwoWheelerOtherComprehensiveTP from '../two-wheeler-tp/TwoWheelerOtherComprehensiveTP';
import TwoWheelerVerifyTP from '../two-wheeler-tp/TwoWheelerVerifyTP';
import TwoWheelerAdditionalDetailsTP from '../two-wheeler-tp/TwoWheelerAdditionalDetailsTP';
// import TwoWheelerThankYou_motorTP from '../two-wheeler-tp/TwoWheelerThankYouTP';

import UnderMaintenance from '../UnderMaintenance';

// import CreateTicket from '../Support/CreateTicket';

const componentLoader = () => {
    return (
        <div style={{ height: "540px" }}>
            <div className="loading">
                <Loader type="Oval" color="#000000" height="50" width="50" />
            </div>
        </div>
    )
}
const loadingContent = componentLoader();

const Products = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../products/Products.jsx"),
    loading: () => loadingContent
});

const Health = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/InformationYourself.jsx"),
    loading: () => loadingContent
});
const MedicalDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/MedicalDetails.jsx"),
    loading: () => loadingContent
});
const SelectDuration = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/SelectDuration.jsx"),
    loading: () => loadingContent
});
const Address = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/Address.jsx"),
    loading: () => loadingContent
});
const NomineeDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/NomineeDetails.jsx"),
    loading: () => loadingContent
});
const PolicyDetails = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/PolicyDetails.jsx"),
    loading: () => loadingContent
});
const ThankYou = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../health/ThankYou.jsx"),
    loading: () => loadingContent
});
// const PolicySummery = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/PolicySummery.jsx"),
//     loading: () => loadingContent
// });



const SelectBrand = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../motor/SelectBrand.jsx"),
    loading: () => loadingContent
});


class Routes extends Component {
    render() {
        this.props.onAuthPersist();
        return (
            <>
                <HashRouter>
                    <Switch>
                        <Route exact path="/login" component={LogIn} />                        
                        <PrivateRoute exact path="/Products" component={Products} />
                        <PrivateRoute exact path="/Health/:productId" component={Health} />
                        <PrivateRoute exact path="/MedicalDetails/:productId" component={MedicalDetails} />
                        <PrivateRoute exact path="/SelectDuration/:productId" component={SelectDuration} />
                        <PrivateRoute exact path="/Address/:productId" component={Address} />    
                        <PrivateRoute exact path="/NomineeDetails/:productId" component={NomineeDetails} /> 
                        <PrivateRoute exact path="/PolicyDetails/:productId" component={PolicyDetails} />
                        {/* <PrivateRoute exact path="/PolicySummery/:productId" component={PolicySummery} />                  */}
                        <PrivateRoute exact path="/ThankYou/:policyId" component={ThankYou} />
                    
                        
                        <PrivateRoute exact path="/Registration/:productId" component={Registration} />                    
                        <PrivateRoute exact path="/Select-brand/:productId" component={SelectBrand} />
                        <PrivateRoute exact path="/VehicleDetails/:productId" component={VehicleDetails} />
                        <PrivateRoute exact path="/OtherComprehensive/:productId" component={OtherComprehensive} />
                        <PrivateRoute exact path="/Additional_details/:productId" component={AdditionalDetails} />
                        <PrivateRoute exact path="/Premium/:productId" component={Premium} />
                        {/* <PrivateRoute exact path="/ThankYou_motor/:policyId" component={ThankYou_motor} /> */}

                        {/************ TwoWheeler ******************/}
                        {/* <PrivateRoute exact path="/two_wheeler_Registration/:productId" component={TwoWheelerRegistration} />                     */}
                        <PrivateRoute exact path="/two_wheeler_Select-brand/:productId" component={TwoWheelerSelectBrand} />
                        <PrivateRoute exact path="/two_wheeler_Vehicle_details/:productId" component={TwoWheelerVehicleDetails} />
                        <PrivateRoute exact path="/two_wheeler_OtherComprehensive/:productId" component={TwoWheelerOtherComprehensive} />
                        <PrivateRoute exact path="/two_wheeler_verify/:productId" component={TwoWheelerVerify} />
                        <PrivateRoute exact path="/two_wheeler_additional_details/:productId" component={TwoWheelerAdditionalDetails} />  
                        <PrivateRoute exact path="/two_wheeler_policy_premium_details/:productId" component={TwoWheelerPolicyPremiumDetails} />
                        {/* <PrivateRoute exact path="/two_wheeler_ThankYou_motor/:policyId" component={TwoWheelerThankYou_motor} /> */}

                        {/************ TwoWheelerTP ******************/}
                        <PrivateRoute exact path="/two_wheeler_Select-brandTP/:productId" component={TwoWheelerSelectBrandTP} />
                        <PrivateRoute exact path="/two_wheeler_Vehicle_detailsTP/:productId" component={TwoWheelerVehicleDetailsTP} />
                        <PrivateRoute exact path="/two_wheeler_OtherComprehensiveTP/:productId" component={TwoWheelerOtherComprehensiveTP} />
                        <PrivateRoute exact path="/two_wheeler_verifyTP/:productId" component={TwoWheelerVerifyTP} />
                        <PrivateRoute exact path="/two_wheeler_additional_detailsTP/:productId" component={TwoWheelerAdditionalDetailsTP} />  
                        <PrivateRoute exact path="/two_wheeler_policy_premium_detailsTP/:productId" component={TwoWheelerPolicyPremiumDetailsTP} />
                        {/* <PrivateRoute exact path="/two_wheeler_ThankYou_motorTP/:policyId" component={TwoWheelerThankYou_motorTP} /> */}

                        {/************ Support ******************/}
                        {/* <PrivateRoute exact path="/create-ticket" component={CreateTicket} /> */}
                        
                        <PrivateRoute exact path="/UnderMaintenance" component={UnderMaintenance} />
                        <Redirect from="/" to="/Products" />
                    </Switch>
                </HashRouter>
            </>
        )
    }
}


const mapStateToProps = (state) => {
    return {
        token: state.auth.token
    }
  
  }
  
  const mapDispatchToProps = dispatch => {
    return {
        onAuthPersist: () => dispatch(authValidate())
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(Routes);




