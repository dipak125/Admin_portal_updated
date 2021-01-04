import React, { Component } from 'react';
import BaseComponent from '../BaseComponent';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';

class ThankYouPage extends Component {
    render() {
        return (
            <>
                 <BaseComponent>
                 <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                <SideNav />
                            </div>
                            <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                 <section className="thankuBox">
                     <div className="thankuinfo">
                         <div className="text-center custtxt">
                         <img src={require('../../assets/images/like.svg')} alt="" className="m-b-30"/>
                         <p>Thank you for choosing SBI General Motor Insurance</p>
                         <p className="fs-16 m-b-30">Policy No <span className="lghtBlue"> 004500003277045</span></p>
                         <div className="d-flex justify-content-center align-items-center">
                             <button className="proposal">Eproposal Form</button>
                             <button className="policy m-l-20">Policy Copy</button>
                         </div>
                         </div>
                     </div>
                     </section>
                     <div className="dashbrd"><a href="#">Go to Dashboard</a></div>
                     {/* <Footer/> */}
                     </div>
                   </div>
                   </div>  
                     </BaseComponent>
            </>
        );
    }
}

export default ThankYouPage;