import React, { Component } from 'react';
import { Route, Switch, BrowserRouter,Redirect, withRouter, HashRouter } from "react-router-dom";
import { Formik, Field, Form } from "formik";

import { connect } from "react-redux";
import Loadable from 'react-loadable';
import { authValidate } from "../../store/actions/auth";
import { PrivateRoute } from "../../shared/private-route";
import Loader from "react-loader-spinner";

import LogIn from "../common/login/LogIn";

// import Registration from '../motor/Registration';
// import VehicleDetails from '../motor/VehicleDetails';
// import AdditionalDetails from '../motor/AdditionalDetails';
// import OtherComprehensive from '../motor/OtherComprehensive';
// import Premium from '../motor/Premium';
// import ThankYou_motor from '../motor/ThankYou';


// import TwoWheelerRegistration from '../two-wheeler/TwoWheelerRegistration';
// import TwoWheelerSelectBrand from '../two-wheeler/TwoWheelerSelectBrand';
// import TwoWheelerVehicleDetails from '../two-wheeler/TwoWheelerVehicleDetails';
// import TwoWheelerPolicyPremiumDetails from '../two-wheeler/TwoWheelerPolicyPremiumDetails';
// import TwoWheelerOtherComprehensive from '../two-wheeler/TwoWheelerOtherComprehensive';
// import TwoWheelerVerify from '../two-wheeler/TwoWheelerVerify';
// import TwoWheelerAdditionalDetails from '../two-wheeler/TwoWheelerAdditionalDetails';
// import TwoWheelerThankYou_motor from '../two-wheeler/TwoWheelerThankYou';


import UnderMaintenance from '../UnderMaintenance';


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

const Error = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/ErrorPage.jsx"),
    loading: () => loadingContent
});

const Logout = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Logout.jsx"),
    loading: () => loadingContent
});


const Break_in = Loadable({
    // loader: () => import(/*webpackChunkName: "Products" */"../support/BreakinList.jsx"),
    loading: () => loadingContent
});

const Break_form = Loadable({
    // loader: () => import(/*webpackChunkName: "Products" */"../support/RequestForm.jsx"),
    loading: () => loadingContent
});

const PolicySearch = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/PolicySearch.jsx"),
    loading: () => loadingContent
});

const QuoteSearch = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/QuoteSearch.jsx"),
    loading: () => loadingContent
});


// const Products = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../products/Products.jsx"),
//     loading: () => loadingContent
// });

// const Documents = Loadable({
//     loader: () => import(/*webpackChunkName: "Documents" */"../products/Documents.jsx"),
//     loading: () => loadingContent
// });

// const Services = Loadable({
//     loader: () => import(/*webpackChunkName: "Documents" */"../services/Services.jsx"),
//     loading: () => loadingContent
// });

// const Supports = Loadable({
//     loader: () => import(/*webpackChunkName: "Supports" */"../support/Supports.jsx"),
//     loading: () => loadingContent
// });

// const TicketCount = Loadable({
//     loader: () => import(/*webpackChunkName: "TicketCount" */"../support/TicketCount.jsx"),
//     loading: () => loadingContent
// });

// ========== HEALTH =============================================

// const Health = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/InformationYourself.jsx"),
//     loading: () => loadingContent
// });
// const MedicalDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/MedicalDetails.jsx"),
//     loading: () => loadingContent
// });
// const SelectDuration = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/SelectDuration.jsx"),
//     loading: () => loadingContent
// });
// const Address = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/Address.jsx"),
//     loading: () => loadingContent
// });
// const NomineeDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/NomineeDetails.jsx"),
//     loading: () => loadingContent
// });
// const PolicyDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/PolicyDetails.jsx"),
//     loading: () => loadingContent
// });

// =======================================================

// const ThankYou = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/ThankYou.jsx"),
//     loading: () => loadingContent
// });
// const ThankYouCCM = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../health/ThankYouCCM.jsx"),
//     loading: () => loadingContent
// });
//============================ Motor Comprehensive=============================
// const SelectBrand = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../motor/SelectBrand.jsx"),
//     loading: () => loadingContent
// });

// =================== AROGYA TOPUP =============================== //

// const arogya_Health = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_InformationYourself"),
//     loading: () => loadingContent
// });
// const arogya_MedicalDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_MedicalDetails.jsx"),
//     loading: () => loadingContent
// });
// const arogya_SelectDuration = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_SelectDuration.jsx"),
//     loading: () => loadingContent
// });
// const arogya_Address = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_Address"),
//     loading: () => loadingContent
// });
// const arogya_NomineeDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_NomineeDetails.jsx"),
//     loading: () => loadingContent
// });
// const arogya_PolicyDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../Arogya_topUp/arogya_PolicyDetails.jsx"),
//     loading: () => loadingContent
// });

//=====================================================================================

// ========== Two-Wheeler TP =============================================

// const TwoWheelerSelectBrandTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerSelectBrandTP.jsx"),
//     loading: () => loadingContent
// });
// const TwoWheelerVehicleDetailsTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerVehicleDetailsTP.jsx"),
//     loading: () => loadingContent
// });
// const TwoWheelerPolicyPremiumDetailsTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerPolicyPremiumDetailsTP.jsx"),
//     loading: () => loadingContent
// });
// const TwoWheelerOtherComprehensiveTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerOtherComprehensiveTP.jsx"),
//     loading: () => loadingContent
// });
// const TwoWheelerVerifyTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerVerifyTP.jsx"),
//     loading: () => loadingContent
// });
// const TwoWheelerAdditionalDetailsTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../two-wheeler-tp/TwoWheelerAdditionalDetailsTP.jsx"),
//     loading: () => loadingContent
// });

// ======================== Four-Wheeler TP ========================================

// const FourWheelerSelectBrandTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerSelectBrandTP.jsx"),
//     loading: () => loadingContent
// });
// const FourWheelerVehicleDetailsTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerVehicleDetailsTP.jsx"),
//     loading: () => loadingContent
// });
// const FourWheelerPolicyPremiumDetailsTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerPolicyPremiumDetailsTP.jsx"),
//     loading: () => loadingContent
// });
// const FourWheelerOtherComprehensiveTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerOtherComprehensiveTP.jsx"),
//     loading: () => loadingContent
// });
// const FourWheelerVerifyTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerVerifyTP.jsx"),
//     loading: () => loadingContent
// });
// const FourWheelerAdditionalDetailsTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../four-wheeler-tp/FourWheelerAdditionalDetailsTP.jsx"),
//     loading: () => loadingContent
// });


// ======================== Motor GCV ========================================

// const RegistrationGCV = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV/RegistrationGCV.jsx"),
//     loading: () => loadingContent
// });
// const SelectBrandGCV = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV/SelectBrandGCV.jsx"),
//     loading: () => loadingContent
// });
// const VehicleDetailsGCV = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV/VehicleDetailsGCV.jsx"),
//     loading: () => loadingContent
// });
// const OtherComprehensiveGCV = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV/OtherComprehensiveGCV.jsx"),
//     loading: () => loadingContent
// });
// const AdditionalDetailsGCV = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV/AdditionalDetailsGCV.jsx"),
//     loading: () => loadingContent
// });
// const PremiumGCV = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV/PremiumGCV.jsx"),
//     loading: () => loadingContent
// });

// ======================== Motor GCV tp ========================================

// const RegistrationGCVTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/RegistrationGCV_TP.jsx"),
//     loading: () => loadingContent
// });
// const SelectBrandGCVTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/SelectBrandGCV_TP.jsx"),
//     loading: () => loadingContent
// });
// const VehicleDetailsGCVTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/VehicleDetailsGCV_TP.jsx"),
//     loading: () => loadingContent
// });
// const OtherComprehensiveGCVTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/OtherComprehensiveGCV_TP.jsx"),
//     loading: () => loadingContent
// });
// const AdditionalDetailsGCVTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/AdditionalDetailsGCV_TP.jsx"),
//     loading: () => loadingContent
// });
// const PremiumGCVTP = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../GCV-TP/PremiumGCV_TP.jsx"),
//     loading: () => loadingContent
// });

// ======================== SME Fire ========================================

// const RegistrationSME = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/Registration_sme.jsx"),
//     loading: () => loadingContent
// });

// const RiskDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/RiskDetails.jsx"),
//     loading: () => loadingContent
// });
// const OtherDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/OtherDetails.jsx"),
//     loading: () => loadingContent
// });
// const AdditionalDetailsSME = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/AdditionalDetails_sme.jsx"),
//     loading: () => loadingContent
// });
// const PremiumSME = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/Premium_sme.jsx"),
//     loading: () => loadingContent
// });

// const SummarySME = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../sme-fire/Summary_sme.jsx"),
//     loading: () => loadingContent
// });

// //  =================================== Landing Page ==================================

// const Dashboard = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../landing_page/Dashboard"),
//     loading: () => loadingContent
// });


// // ======================== Motor MISC-D ========================================

// const RegistrationMISCD = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/RegistrationMISCD.jsx"),
//     loading: () => loadingContent
// });
// const SelectBrandMISCD = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/SelectBrandMISCD.jsx"),
//     loading: () => loadingContent
// });
// const VehicleDetailsMISCD = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/VehicleDetailsMISCD.jsx"),
//     loading: () => loadingContent
// });
// const OtherComprehensiveMISCD = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/OtherComprehensiveMISCD.jsx"),
//     loading: () => loadingContent
// });
// const AdditionalDetailsMISCD = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/AdditionalDetailsMISCD.jsx"),
//     loading: () => loadingContent
// });
// const PremiumMISCD = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../MISC-D/PremiumMISCD.jsx"),
//     loading: () => loadingContent
// });

// ======================KSB Retail =============================================

// const Health_KSB = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/InformationYourself_KSB.jsx"),
//     loading: () => loadingContent
// });
// const PreExistingDisease_KSB = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/PreExistingDisease_KSB.jsx"),
//     loading: () => loadingContent
// });
// const SelectDuration_KSB = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/SelectDuration_KSB.jsx"),
//     loading: () => loadingContent
// });
// const Address_KSB = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/Address_KSB.jsx"),
//     loading: () => loadingContent
// });
// const NomineeDetails_KSB = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/NomineeDetails_KSB.jsx"),
//     loading: () => loadingContent
// });
// const PolicyDetails_KSB = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../KSB-retail/PolicyDetails_KSB.jsx"),
//     loading: () => loadingContent
// });

// =================== INDIVIDUAL PERSONAL ACCIDENT  =============================== //

// const AccidentSelectPlan = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_SelectPlan"),
//     loading: () => loadingContent
// });
// const AccidentAddDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_AddDetails"),
//     loading: () => loadingContent
// });
// const AccidentAdditionalDetails = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_CommunicationalDetails"),
//     loading: () => loadingContent
// });
// const IPA_Premium = Loadable({
//     loader: () => import(/*webpackChunkName: "Products" */"../IndividualPersonalAccident/IPA_Premium"),
//     loading: () => loadingContent
// });

// ====================================================================


//  ************ Vedvag Payment Gateway ******************

const VedvagGateway = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../common/Vedvag_gateway.jsx"),
    loading: () => loadingContent
});

// *************** Admin Route links ********************

const Reports = Loadable({
    loader: () => import(/*webpackChunkName: "Products" */"../reports/AdminReport"),
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
                        <Route exact path="/logout" component={Logout} /> 
                        <PrivateRoute exact path="/Error" component={Error} />

                        <PrivateRoute exact path="/Reports" component={Reports} />  
                        <Redirect from="/" to="/Reports" />
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




