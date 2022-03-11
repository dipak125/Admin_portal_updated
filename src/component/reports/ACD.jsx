import {useState,useEffect} from "react";
import React, { Component , Fragment} from 'react';
import BaseComponent from '.././BaseComponent';
import { Row, Col, Modal, Button, FormGroup, OverlayTrigger, Tooltip } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import swal from 'sweetalert';
import SideNav from '../common/side-nav/SideNav';
import Footer from '../common/footer/Footer';
import LinkWithTooltip from "../../shared/LinkWithTooltip";
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from "react-bootstrap-table";
import axios from "../../shared/axios"
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import Encryption from '../../shared/payload-encryption';
import moment from "moment";
import Collapsible from 'react-collapsible';
import { Formik, Field, Form, FieldArray } from "formik";
import * as Yup from "yup";
import DatePicker from "react-datepicker";
import { registerLocale, setDefaultLocale } from "react-datepicker";
 import enGb from 'date-fns/locale/en-GB';
import { useRef } from "react";
 registerLocale('enGb', enGb)

 const initialValues = {
    start_date: new Date(),
    end_date: new Date(),
    report_range: 1,
    
  };
  const validationSchema = Yup.object().shape({
    // is_carloan: Yup.number().required('Please select one option')
  
    start_date: Yup.date().required("Please Select date or Month"),
    account_list:Yup.string().required("please choose account")
  });
 

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
  const Total =(value,row,index,field)=>{
      return row.prev_balance+row.credit
//    return row[index].prev_balance + row[index].credit;
  }
  const  dateFormat = (value) => {
    return moment(value).format("DD-MM-YYYY HH:mm:ss");
}

  const AvilableForamter =(value,row,index,field)=>{
      console.log("cell1",row.prev_balance + row.credit - row.debit)
    return row.prev_balance + row.credit - row.debit;
  }
  
const ACD =(props)=>{
    let path=""
    const table=useRef("table");
    const[state,setState]=useState({
      search_flag:1,
      Account_list:[],
      user_id:"",
      total:[],
      policyHolder:[],
      size:"",
      download:0
  })
    useEffect(()=>{
      const formData = new FormData();
     let encryption = new Encryption();

    
    let user_data = localStorage.getItem("users") ? JSON.parse(localStorage.getItem("users")): "";
     let user_id = user_data ? JSON.parse(encryption.decrypt(user_data.user)) :""
     //console.log("user1",encryption.decrypt(user_data))
     console.log("user1",user_id)
     formData.append("user_id",user_id.id)
    //formData.append("user_id",2)
    
    axios.post("acd/acd-accounts-admin",formData).then((res)=>{
      console.log("response", res.data.data);
      
      
      setState({
        ...state,
        Account_list:res.data.data
      })
      console.log("d",state.Account_list)
    }).catch(err=>
        console.log("err")
      )
    
      
    },[])
    
  
    const{search_flag}=state;
    const handleChange =(value,setFieldTouched,setFieldValue)=>{
     setFieldTouched("start_date");
     setFieldValue("start_date")
      if(value == 1)
      {
        setState({...state,search_flag:1});
      }
      else  if(value == 2)
      {
        setState({...state,search_flag:2});
      }
      else if(value == 3)
      {
        setState({...state,search_flag:3});
      }
      else setState({...state,search_flag:4});
    }
    const handleDateChange =(value,setFieldTouched,setFieldValue)=>{
       const{search_flag}=state;
      if(search_flag == 1)
      {
        let start_date=value;
        let end_date=value;
        console.log("check",start_date,end_date)
        setFieldTouched("start_date");
        setFieldValue("start_date",start_date);
        setFieldTouched("end_date");
        setFieldValue("end_date",end_date)
        
      }
      else if(search_flag == 2)
      {
        let start_date=value;
        let end_date=new Date(moment(start_date).add(6,"day"));
         setFieldTouched("start_date");
        setFieldValue("start_date",start_date);
        setFieldTouched("end_date");
        setFieldValue("end_date",end_date);
      }
      else if(search_flag == 3)
      {
        let start_date=value;
        let days=start_date.getMonth()+1;
        if(days == 1 || days == 3 || days == 5 || days == 7 || days == 8 || days == 10 || days == 12)
        {
          days=31
        }
        else if(days != 2)
        {
          days=30
        }
        else{
          let year=start_date.getFullYear()
          if(year%4==0)
              days=29
          else days=28
          console.log("leep",year%4,year)
        }
        console.log("no of days",days)
        let end_date=new Date(moment(start_date).add(days-1,"day"));
        setFieldTouched("start_date");
        setFieldValue("start_date",start_date);
        setFieldTouched("end_date");
        setFieldValue("end_date",end_date);
      }
      else
      {
        let currentYear = new Date().getFullYear();
        let start_date = new Date(`${currentYear} ${value} 01`);
        let end_date = new Date(
        start_date.getFullYear(),
        start_date.getMonth() + 1,
        0
      );
      setFieldTouched("start_date");
      setFieldValue("start_date",start_date);
      setFieldTouched("end_date");
      setFieldValue("end_date",end_date);
      }
    }
    
    const renderShowsTotal =(start,to,total)=>{
      console.log("render",start,to,total);
      start = start ? start : 0;
      to = to ? to : 0;
      total = total ? total : 0;

      return(
        <p
          style={{color:'blue'}}
        >
          {`From ${start} to ${to} , total is ${total}`}
        </p>
      )
    }
    const onPageChange =(page,sizePerPage)=>{
      console.log("page",page,sizePerPage)
      let starting_index=page*10-10;

     
      
      setState({
        ...state,
         policyHolder:state.total.slice(starting_index,starting_index+10),
         page:page
      })

    }
    const options = {
      
      // afterColumnFilter: this.afterColumnFilter,
      // onExportToCSV: this.onExportToCSV,
      page: parseInt(state.page ? state.page :1),  // which page you want to show as default
      sizePerPage: 10,
      paginationShowsTotal: renderShowsTotal,  // Accept bool or function
      prePage: "Prev", // Previous page button text
      nextPage: "Next", // Next page button text
      hideSizePerPage: true,
      remote: true,
      showTotal: true,
       onPageChange: onPageChange,
      

  };

  const download= async ()=>{
    
    if(path)
    { 
        const url = `${path}`;
        props.loadingStart();
        const anchortag = document.createElement('a');
        anchortag.style.display = 'none';
        anchortag.href = url;
        document.body.appendChild(anchortag);
        anchortag.click();
        props.loadingStop();
    }
    else{
      swal("Unable to download")
    }
  }
     const handleSubmit =(values)=>{
     console.log("submit",state.user_id);
     if(state.download==1)
     {
        // console.log("download",state.download)
        const formData = new FormData();
        formData.append("user_id",state.user_id)
        formData.append("from_date",moment(values.start_date).format("YYYY-MM-DD"));
        formData.append("to_date",moment(values.end_date).format("YYYY-MM-DD"))
        
        
        axios.post(`acd/acd-statement-download`,formData). then(res=>{
          // console.log("check",res.data.data.uploded_path)
          path = res.data.data.uploded_path
          
          download();

          

        }).catch(err=>{
          console.log("error")
        })
        setState({
          ...state,
          download:0
        })
     }
     else{
     const formData=new FormData();
     formData.append("user_id",state.user_id)
     formData.append("from_date",moment(values.start_date).format("YYYY-MM-DD"))
     formData.append("to_date",moment(values.end_date).format("YYYY-MM-DD"))
     console.log("account",values)
     console.log("formData",formData)
     
     axios.post("acd/acd-statement",formData).then(res=>{
       console.log("formData",res.data.data)
       setState({
           ...state,
           total:res.data.data,
            size:res.data.data.length,
            policyHolder:res.data.data.slice(0,10)
       })
     }).catch(err=>{
       console.log("err")
     })
    
      console.log("policy",state.policyHolder)
    }
     
   }
  
    return(
        <BaseComponent>
        <div className="page-wrapper">
                <div className="container-fluid">
                    <div className="row">
                           
                            <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                                    <SideNav />
                                </div>
                            
                        <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                        <h4 className="text-center mt-3 mb-3">SBI General Insurance Company Limited</h4>
                            <div className="contBox m-b-45 tickedTable">
                            <h4 className="text-center mt-3 mb-3">ACD Account report</h4>

                             <Formik 
                                initialValues={initialValues}
                                onSubmit={handleSubmit}
                                validationSchema={validationSchema}
                                >
                                {({ values, errors, setFieldValue, setFieldTouched, isValid, isSubmitting, touched,submitForm }) => {
                                    console.log("value",values)
                                    console.log("err",errors)
                                    console.log("valid",isValid)
                                    console.log("touched",touched)
                                    return(
                                       <Form>
                                        <Row>
                                          
                                        <Col sm={6} md={5} lg={5}>
                                          <FormGroup className="dashboard-date">
                                            <div className="formSection">
                                              <Field
                                                name="report_range"
                                                component="select"
                                                autoComplete="off"
                                                className="formGrp inputfs12"
                                                value={values.report_range? values.report_range:""}
                                                onChange={(e) => {
                                                  
                                                  setFieldTouched("report_range");
                                                  setFieldValue("report_range",e.target.value);
                                                  handleChange(e.target.value, setFieldValue, setFieldTouched);
                                                }}
                                              >
                                                <option value="1">Daily</option>
                                                <option value="2">Weekly</option>
                                                <option value="3">DateMonth</option>
                                                <option value="4">Monthly</option>
                                              </Field>
                                              {errors.report_range &&
                                              touched.report_range ? (
                                                <span className="errorMsg">
                                                  {errors.report_range}
                                                </span>
                                              ) : null}
                                              
                                            </div>
                                          </FormGroup>
                                          
                                        </Col>
                                          <Col sm={6} md={5} lg={6}>
                                            <FormGroup className="dashboard-date">
                                              {values.report_range !=
                                              "4" ? (
                                                <div>
                                                  <DatePicker
                                                    name="start_date"
                                                    locale="enGb"
                                                    selected={values.start_date}
                                                    dateFormat="yyyy MMM dd"
                                                    dropdownMode="select"
                                                    showMonthDropdown={search_flag == 3 ? true : false }
                                                    className="datePckr inputfs12"
                                                    startDate={values.start_date}
                                                    endDate={values.end_date}
                                                    selectsRange
                                                    disabledKeyboardNavigation
                                                    onChange={(val) => {
                                                      handleDateChange(
                                                        val,
                                                        setFieldTouched,
                                                        setFieldValue
                                                      );
                                                    }}
                                                   />
                                                  
                                                   {errors.start_date &&
                                                  touched.start_date ? (
                                                    <span className="errorMsg">
                                                      {errors.start_date}
                                                    </span>
                                                  ) : <span className="errorMsg">
                                                  {errors.start_date}
                                                </span>} 
                                                </div>                                           
                                              ) : (
                                                <div className="formSection">
                                                  <Field
                                                    name="report_month"
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value={values.report_month}
                                                    onChange={(e) => {setFieldTouched("report_month");
                                                      setFieldValue("report_month",e.target.value);
                                                      handleDateChange(e.target.value,
                                                        setFieldTouched,
                                                        setFieldValue
                                                      );
                                                    }}
                                                  >
                                                    <option value="">Select Month</option>
                                                    <option value="1">January</option>
                                                    <option value="2">February</option>
                                                    <option value="3">March</option>
                                                    <option value="4">April</option>
                                                    <option value="5">May</option>
                                                    <option value="6">June</option>
                                                    <option value="7">July</option>
                                                    <option value="8">August</option>
                                                    <option value="9">September</option>
                                                    <option value="10">October</option>
                                                    <option value="11">November</option>
                                                    <option value="12">December</option>
                                                  </Field>
                                                  {errors.start_date &&
                                                  touched.start_date ? (
                                                    <span className="errorMsg">
                                                      {errors.start_date}
                                                    </span>
                                                  ) : null}
                                                </div>
                                              )}
                                              
                                            </FormGroup>
                                            <Button type='submit' >Fetch</Button> &nbsp; &nbsp;
                                            <Button type='submit' onClick={()=> state.download=1}>Download</Button>
                                          </Col>
                                          
                                          <Col sm={6} md={5} lg={5}>
                                          <FormGroup className="dashboard-date">
                                            <div className="formSection">
                                              <Field
                                                name="account_list"
                                                component="select"
                                                autoComplete="off"
                                                className="formGrp inputfs12"
                                                value={values.account_list? values.account_list:""}
                                                onChange={(e) => {
                                                  
                                                  setFieldTouched("account_list");
                                                  setFieldValue("account_list",e.target.value);
                                                  setState({
                                                      ...state,
                                                      user_id:e.target.value
                                                  })
                                                }}
                                              >
                                                <option value="">Select account no</option>
                                                {state.Account_list && state.Account_list.map(data=>
                                                  <option value={data.user_id}>{`${data.account_number} (${data.intermediary_name})`}</option>
                                                  )}
                                                
                                                
                                              </Field>
                                              {errors.account_list &&
                                              touched.account_list ? (
                                                <span className="errorMsg">
                                                  {errors.account_list}
                                                </span>
                                              ) : null}
                                            </div>
                                          </FormGroup>
                                          
                                        </Col>
                                      </Row>
                                      
                                      </Form>
                                    )
                                }}
                                </Formik> 
                                {state.policyHolder ?
                                        <div className="customInnerTable dataTableCustom">
                                            <BootstrapTable ref={table}
                                                data={state.policyHolder}
                                                pagination={true}
                                                options={options}
                                                remote={true}
                                                fetchInfo={{ dataTotalSize: state.size }}
                                                // striped
                                                // hover
                                                wrapperClasses="reportclass"
                                            >

                                                <TableHeaderColumn width='150px' dataField="created_at" dataAlign="center"  dataFormat={dateFormat} isKey >Date</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="prev_balance" dataAlign="center" >Balance</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="credit" dataAlign="center"  >Amount Added</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="title" dataAlign="center" dataFormat={ Total} >Total</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="debit" dataAlign="center"  >Policy Amount</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="batch_no" dataAlign="center"  >Batch Code</TableHeaderColumn>
                                                <TableHeaderColumn width='100px' dataField="title" dataAlign="center" dataFormat={ AvilableForamter} >Avilable Balance</TableHeaderColumn>
                                                

                                            </BootstrapTable>
                                        </div>
                                        : null}
                               
                            </div>
                        </div>
                        
                    </div>
                </div>
                </div>
                
            </BaseComponent>
    )
}
export default connect(mapStateToProps, mapDispatchToProps)(ACD);