import React, { Component, Fragment } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
// import { HiRefresh } from "react-icons/hi";
import {
  Row,
  Col,
  Modal,
  Button,
  FormGroup,
  OverlayTrigger,
  Tooltip,
  Container,
  Card,
  Dropdown,
} from "react-bootstrap";
// import Calendar from "react-calendar";
// import Collapsible from "react-collapsible";
// import BackContinueButton from "../common/button/BackContinueButton";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker-cssmodules.min.css";
import { Formik, Field, Form, FieldArray } from "formik";
import BaseComponent from "../BaseComponent";
import SideNav from "../common/side-nav/SideNav";
import Footer from "../common/footer/Footer";
import { Link, withRouter } from "react-router-dom";
import { loaderStart, loaderStop } from "../../store/actions/loader";
import { connect } from "react-redux";
import axios from "../../shared/axios";
// import Encryption from "../../shared/payload-encryption";
// import * as Yup from "yup";
// import swal from "sweetalert";
import { useState } from "react"
import Encryption from '../../shared/payload-encryption';
import moment from "moment";
// var Component = React.Component;
// import "./style.css";
// import Autosuggest from "react-autosuggest";

const initialValues = {
  start_date: new Date(),
  end_date: new Date(),
  report_range: 1,
  report_chart: '',
};

const option = {
  title: {
    display: true,
    // text: 'Line chart'
  },
  scales: {
    // yAxes: [
    //   {
    //     ticks: {
    //       min: 0,
    //       max: 100,
    //       stepSize: 10,
    //     },
    //   },
    // ],
  },
};

class Dashboard extends Component {
  state = {
    chartData: {},
    update_data: [],
    posts: [],
    search_flag: 1,
    flag: 1
  };

  handleSubmit = (values) => {
    console.log("start_date------ ", values.start_date);
    console.log("end_date------ ", values.end_date);
    console.log("bcmaster_id------ ", values.bcmaster_id);
    console.log("bc_agent_id------ ", values.bc_agent_id);
    const formData = new FormData();
    let encryption = new Encryption();

    if(sessionStorage.getItem('csc_id')) {
        formData.append('bcmaster_id', '5');
        formData.append('user_id',sessionStorage.getItem('csc_id') ? sessionStorage.getItem('csc_id') : "");
        formData.append('agent_name',sessionStorage.getItem('agent_name') ? sessionStorage.getItem('agent_name') : "");
        // formData.append('product_id',pr);
            formData.append('page_name', `Dashboard`);
    }else{
        let bc_data = sessionStorage.getItem('bcLoginData') ? sessionStorage.getItem('bcLoginData') : "";
        if(bc_data) {
            bc_data = JSON.parse(encryption.decrypt(bc_data));

            formData.append('bcmaster_id', bc_data ? bc_data.agent_id : "");
            formData.append('bc_token', bc_data ? bc_data.token : "");
            formData.append('user_id', bc_data ? bc_data.user_info.data.user.username : "");
            // formData.append('product_id',productId);
            formData.append('page_name', `Dashboard`);
        }

    }
    formData.append(
      "start_date",
      moment(values.start_date).format("YYYY-MM-DD")
    );
    formData.append("end_date", moment(values.end_date).format("YYYY-MM-DD"));
    // formData.append('bcmaster_id', '1');
    this.props.loadingStart();

    axios
      .post(`policy-master`, formData)
      .then((res) => {
        let rawData = res.data.data;
        // console.log("chart data------->", chartData);
        // console.log("rawdata------>", rawData);
        this.fetchChartData(rawData, 1);
        this.setState({
          rawData: rawData,
        });
        this.props.loadingStop()
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };  

  handleChangeChart = (value) => {
    if (value == "1") {
      this.setState({ flag: 1 });
    } else if (value == "2") {
      this.setState({ flag: 2 });
  };
}

  fetchChartData = (rawData) => {
    let motor_policy_count = 0;
    let health_policy_count = 0;
    let motor_premium_count = 0;
    let health_premium_count = 0;
    let maxMotor = rawData.motor.length;
    let maxHealth = rawData.health.length;

    for (var i = 0; i < maxMotor; i++) {
      motor_policy_count =
        parseInt(rawData.motor[i].totalPolicyCount) + motor_policy_count;
      motor_premium_count =
        parseInt(rawData.motor[i].totalPremium) + motor_premium_count;
    }

    for (var i = 0; i < maxHealth; i++) {
      health_policy_count =
        parseInt(rawData.health[i].totalPolicyCount) + health_policy_count;
      health_premium_count =
        parseInt(rawData.health[i].totalPremium) + health_premium_count;
    }

    let total_policy_count =
      parseInt(motor_policy_count) + parseInt(health_policy_count);

    let total_premium_count =
      parseInt(motor_premium_count) + parseInt(health_premium_count);
    
    let chartData = {};
    const { flag } = this.state;
    console.log("flag-----",flag)
    if (flag == 1) {
      chartData = {
        labels: ["Motor", "Health", "Total"],
        datasets: [
          {
            label: `GWP: ${total_premium_count}`,
            data: [
              motor_premium_count,
              health_premium_count,
              total_premium_count,
            ],
            backgroundColor: "#833471",
          },
        ],
      };
    } else {
      chartData = {
        labels: ["Motor", "Health", "Total"],
        datasets: [
          {
            label: `NOP: ${total_policy_count}`,
            data: [motor_policy_count, health_policy_count, total_policy_count],
            backgroundColor: "#833471",
          },
        ],
      };
    }
    this.setState({ chartData });
  };

  fetchNotification = () => {
    axios
      .get(`notifications`)
      .then((res) => {
        let Data = res.data.data;
        this.setState({
          update_data: Data,
        });
      })
      .catch((err) => {
        this.props.loadingStop();
      });
  };

  handleChange = (value) => {
    if (value == "1") {
      this.setState({ search_flag: 1 });
    } else if (value == "2") {
      this.setState({ search_flag: 2 });
    } else if (value == "3") {
      this.setState({ search_flag: 3 });
    } else {
      this.setState({ search_flag: 4 });
    }
  };

  handleDateChange = (startDate, setFieldTouched, setFieldValue) => {
    const { search_flag } = this.state;
    // var Date = new Date()

    if (search_flag == 1) {
      let start_date = startDate;
      let end_date = startDate;
      console.log("start_date------",start_date)
      
      // todayHighlight(true),
      setFieldTouched("start_date");
      setFieldValue("start_date", start_date);
      setFieldTouched("end_date");
      setFieldValue("end_date", end_date);
    } else if (search_flag == 2) {
      let start_date = startDate;
      let end_date = new Date(moment(start_date).add(6, "day"));

      setFieldTouched("start_date");
      setFieldValue("start_date", start_date);
      setFieldTouched("end_date");
      setFieldValue("end_date", end_date);
    } else if (search_flag == 3) {
      let start_date = startDate;
      let end_date = new Date(moment(start_date).add(29, "day"));

      setFieldTouched("start_date");
      setFieldValue("start_date", start_date);
      setFieldTouched("end_date");
      setFieldValue("end_date", end_date);
    } else {
      let currentYear = new Date().getFullYear();
      let start_date = new Date(`${currentYear} ${startDate} 01`);
      let end_date = new Date(
        start_date.getFullYear(),
        start_date.getMonth() + 1,
        0
      );
      // console.log("start date---------",start_date)
      // console.log("end date---------",end_date)

      setFieldTouched("start_date");
      setFieldValue("start_date", start_date);
      setFieldTouched("end_date");
      setFieldValue("end_date", end_date);
    }
  };

  componentDidMount() {
    this.fetchNotification();
  }

  render() {
    // const {update_data} = this.state

    // let newInitialValues = Object.assign()
    const { chartData, rawData, update_data, search_flag, report_chart, flag } = this.state;
    console.log("Stateflag------",flag)
    // console.log("raw-data----------",rawData)
    let healthList =
      rawData && rawData.health && rawData.health.length > 0
        ? rawData.health
        : [];
    let motorList =
      rawData && rawData.motor && rawData.motor.length > 0 ? rawData.motor : [];

    const health_List =
      healthList && healthList.length > 0
        ? healthList.map((listing, qIndex) => (
            // listing && listing.map((benefit, bIndex) => (
            <tr>
              <td>{listing.name}</td>
              <td>{listing.totalPolicyCount}</td>
              <td>₹{listing.totalPremium}</td>
            </tr>
          ))
        : null;

    const motor_List =
      motorList && motorList.length > 0
        ? motorList.map((listing_motor, qIndex) => (
            // listing && listing.map((benefit, bIndex) => (
            <tr>
              <td>{listing_motor.name}</td>
              <td>{listing_motor.totalPolicyCount}</td>
              <td>₹{listing_motor.totalPremium}</td>
            </tr>
          ))
        : null;

    const notificationData =
      update_data && update_data.length > 0
        ? update_data.map(
            (id, qIndex) => (
              // id.description &&
              // id.description.map((benefit, bIndex) => (
              <div>
                <div className="container">
                  <Row>
                    <Col sm={12} md={12}>
                      <FormGroup>
                        <h8>• {id.description}</h8>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </div>
            )
            // )
            // )
          )
        : null;

    return (
      <>
        <BaseComponent>
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-2 col-xl-2 pd-l-0">
                <SideNav />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-10 col-xl-10 infobox">
                <h4 className="text-center mt-3 mb-3">
                  SBI General Insurance Company Limited
                </h4>
                <section className="brand m-b-25">
                  <h4 className="text-center mt-3 mb-3">Dashboard</h4>
                  <Formik
                    initialValues={initialValues}
                    onSubmit={this.handleSubmit}
                    // validationSchema={ComprehensiveValidation}
                  >
                    {({
                      values,
                      errors,
                      todayHighlight,
                      setFieldValue,
                      setFieldTouched,
                      isValid,
                      isSubmitting,
                      touched,
                    }) => {
                      console.log("values-dashboard-------------> ", values);
                      return (
                        <Form>
                          <Container fluid>
                            <Row
                              className="show-grid contentTopPan"
                              xs={2}
                              md={4}
                              lg={6}
                              mb={3}
                            >
                              <Col sm={12} md={12} lg={12}>
                                <div className="border-cardbody-dash">
                                  <Col sm={12} md={12} lg={6}>
                                    <Card
                                      style={
                                        ({ width: "30rem" },
                                        { height: "30rem" })
                                      }
                                    >
                                      <Card.Header className="card-header-custom">
                                        <h6>
                                          <strong>Business Achievement</strong>
                                          <Button
                                            type="submit"
                                            className="ml-4"
                                          >
                                            Fetch
                                            {/* {<HiRefresh />} */}
                                          </Button>
                                        </h6>
                                      </Card.Header>
                                      <Card.Body>
                                        <Card.Title>
                                          <Row>
                                            <Col sm={6} md={5} lg={5}>
                                              <FormGroup className="dashboard-date">
                                                <div className="formSection">
                                                  <Field
                                                    name="report_range"
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value={values.report_range}
                                                    onChange={(e) => {
                                                      setFieldTouched("report_range");
                                                      setFieldValue("report_range",e.target.value);
                                                      this.handleChange(e.target.value);
                                                    }}
                                                  >
                                                    <option value="1">Daily</option>
                                                    <option value="2">Weekly</option>
                                                    <option value="3">Monthly (date range)</option>
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
                                              <FormGroup className="dashboard-date">
                                                <div className="formSection">
                                                  <Field
                                                    name="report_chart"
                                                    component="select"
                                                    autoComplete="off"
                                                    className="formGrp inputfs12"
                                                    value={values.report_chart}
                                                    onChange={(e) => {
                                                      setFieldTouched(
                                                        "report_chart"
                                                      );
                                                      setFieldValue(
                                                        "report_chart"
                                                      );
                                                      this.handleChangeChart(e.target.value)
                                                      this.fetchChartData(
                                                        rawData,
                                                        e.target.value
                                                      );
                                                    }}
                                                  >
                                                    <option value="1">GWP</option>
                                                    <option value="2">NOP</option>
                                                  </Field>
                                                  {errors.report_chart &&
                                                  touched.report_chart ? (
                                                    <span className="errorMsg">
                                                      {errors.report_chart}
                                                    </span>
                                                  ) : null}
                                                </div>
                                              </FormGroup>
                                            </Col>
                                            {/* {values.report_range != "" ? ( */}
                                              <Col sm={6} md={5} lg={6}>
                                                <FormGroup className="dashboard-date">
                                                  {values.report_range !=
                                                  "4" ? (
                                                    <DatePicker
                                                      name="start_date"
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
                                                        this.handleDateChange(
                                                          val,
                                                          setFieldTouched,
                                                          setFieldValue
                                                        );
                                                      }}
                                                    />
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
                                                          this.handleDateChange(e.target.value,
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
                                                      {errors.report_month &&
                                                      touched.report_month ? (
                                                        <span className="errorMsg">
                                                          {errors.report_month}
                                                        </span>
                                                      ) : null}
                                                    </div>
                                                  )}
                                                </FormGroup>
                                              </Col>
                                            {/* ) : null} */}
                                          </Row>
                                        </Card.Title>
                                        <Card.Text>
                                          <Bar
                                            data={this.state.chartData}
                                            options={option}
                                          />
                                        </Card.Text>
                                      </Card.Body>
                                    </Card>
                                  </Col>

                                  <Col sm={12} md={12} lg={6}>
                                    <Card
                                      style={
                                        ({ width: "30rem" },
                                        { height: "30rem" })
                                      }
                                    >
                                      <Card.Header className="card-header-custom">
                                        <h6 className="mt-1 mb-4">
                                          <strong>Product Summary</strong>
                                        </h6>
                                      </Card.Header>
                                      <Card.Body className="scrollable">
                                        <Card.Text>
                                        <table className="table table-bordered" style={({width: "27rem"})}>
                                         <thead>
                                            <tr>
                                              <th>Product</th>
                                              <th>NOP</th>
                                              <th>GWP</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                          {health_List}
                                          {motor_List}
                                          </tbody>
                                         </table>
                                        </Card.Text>
                                      </Card.Body>
                                    </Card>
                                  </Col>
                                </div>
                              </Col>
                              <Col sm={12} md={12} lg={12}>
                                <Card
                                  border="info"
                                  style={
                                    ({ width: "30rem" }, { height: "10rem" })
                                  }
                                >
                                  <Card.Header className="card-header-custom">
                                    <h6 className="mt-1 mb-4">
                                      <strong>Updates and notification</strong>
                                    </h6>
                                  </Card.Header>
                                  <Card.Body className="scrollable">
                                    <Card.Text>{notificationData}</Card.Text>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>
                          </Container>
                        </Form>
                      );
                    }}
                  </Formik>
                </section>
                <Footer />
              </div>
            </div>
          </div>
        </BaseComponent>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loading: state.loader.loading,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadingStart: () => dispatch(loaderStart()),
    loadingStop: () => dispatch(loaderStop()),
  };
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Dashboard)
);
