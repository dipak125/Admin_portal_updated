import React, { Component } from 'react';

export default class HeaderSecond extends Component {
    render() {
        return (
            <>
                <section className="container-fluid headerTop d-flex justify-content-between">
                    <div className="align-self-center"><img src={require('../../../assets/images/logo.svg')} alt="" /></div>
                    <div className="align-self-center userTopRtSec">

                        <div className="align-self-center">
                            <a href="#" className="notiBell"></a>
                        </div>
                    </div>
                </section>
            </>
        )
    }
}