import React, { Component } from 'react';
import HeaderSecond from '../common/header/HeaderSecond';
import Footer from '../common/footer/Footer';

class ThankYouPage extends Component {
    render() {
        return (
            <>
                 <HeaderSecond />
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
            </>
        );
    }
}

export default ThankYouPage;