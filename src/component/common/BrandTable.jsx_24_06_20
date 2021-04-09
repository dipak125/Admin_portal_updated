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
            rowContents.push(<td key={i} onClick = {e=>this.setModelName(p.id)}> 
                    {p.image ?
                    <img src={'http://14.140.119.44/sbig-csc/core/public/image/car_brand_image/'+p.image} alt={p.name} />:
                    <img src={require('../../assets/images/car.svg')} alt="" />                                                
                    } 
                </td>);
                if (i % 5 === 4) {
                    acc.push(<tr>{rowContents}</tr>);
                    rowContents = [];
                }
                
               
                return acc;
            },[])
        contents.push(<tr className="text-center">{rowContents}</tr>);
            
        return contents;    

    }




    render() {
        let stat = false;
        const {brandList,selectBrandFunc} = this.props;
        console.log("Brand Listing========>",brandList)
        return (
            
            <>
               <Row>
                <Col sm={12}>
                        <div className="brand-table">
                            <table>
                                <tbody>
                                 {this.setTables(brandList)} 
                                 <tr><td Colspan='5'>OTHER</td></tr>                                                                           
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