import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';


class BrandTable extends Component {
    props={};
    constructor(props){
        super(props);

        this.props=props;
    };
    setModelName = (id) => {
        console.log("AAAAAAAA======>",id)
        this.props.selectBrandFunc(id)
       // this.props.selectBrandFunc(id)
    }
    

    setTables=(brandList)=>{
        const {selectBrandFunc} = this.props;
      //  const products = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		let rowContents = [];
        const contents = brandList && brandList.reduce((acc, p, i) => {
            if(p.name != "Others"){
                rowContents.push(<td key={i} onClick = {e=>this.setModelName(p.id)}> 
                    {p.image ?
                    <img src={`${process.env.REACT_APP_PAYMENT_URL}/core/public/image/car_brand_image/`+p.image} alt={p.name} />:
                    <img src={require('../../assets/images/car.svg')} alt="" />                                                
                    } 
                </td>);
                if (i % 5 === 4) {
                    acc.push(<tr key={i}>{rowContents}</tr>);
                    rowContents = [];
                }
                
               
                return acc;
            }
            else {
                rowContents.push(<td key={i} onClick = {e=>this.props.otherBrandFunc()}>
                {p.image ?
                    <img src={`${process.env.REACT_APP_PAYMENT_URL}/core/public/image/car_brand_image/`+p.image} alt={p.name} />:
                    <img src={require('../../assets/images/car.svg')} alt="" />                                                
                    } 
                </td> )
                if (i % 5 === 4) {
                    acc.push(<tr key={i}>{rowContents}</tr>);
                    rowContents = [];
                }
                              
                return acc;
            }
            
            },[])
        contents.push(<tr className="text-center">{rowContents}</tr>);
            
        return contents;    

    }




    render() {
        let stat = false;
        const {brandList,selectBrandFunc} = this.props;
        return (
            
            <>
               <Row>
                <Col sm={12}>
                        <div className="brand-table">
                            <table>
                                <tbody>
                                 {this.setTables(brandList)} 
                                 {/* <tr><td Colspan='5' onClick = {e=>this.props.otherBrandFunc()}>OTHER</td></tr>                                                                            */}
                                </tbody>
                            </table>
                        </div>
                        </Col>
                     </Row>           
            </>
        );
    }
}

export default BrandTable;