/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable array-callback-return */
import { Button, Card } from "@mui/material";
import { Box } from "@mui/system";
import { bindActionCreators } from "redux";
import { connect, useDispatch } from "react-redux";
import React, { Fragment, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { cloneDeep } from "lodash";
import RemoveIcon from "@mui/icons-material/Remove";
import ENVIRONMENT_VARIABLES from "../../../environment.config";
import * as CustomerAction from "../../../Action/Customer";
import {
  ERROR,
  INPROGRESS,
  STOPLOADER,
} from "../../../utils/Customer/Constant";
import moment from "moment-timezone";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import "./style.scss";

const ReservationStep4 = (props) => {
  const dummyDining = {
    id: -1,
    originalPrice: 0,
    price: 0,
    name: "Reservation",
    qty:
      Number(props.customerReservationData.noOfAdult) +
      Number(props.customerReservationData.noOfChild),
    privateRoom: props.customerReservationData.privateRoom,
    image: "images/defaultDining.jpeg",
    dailyTotalQtyleft: 2,
    isEnable:true
  };

  const dispatch = useDispatch();
  const [menuItem, setMenuItem] = useState([]);
  const [dinningData, setDinningData] = useState([]);
  const [privateData, setPrivateData] = useState([]);
  const [filterDining, setFilterDining] = useState(dummyDining);
  const [filterPrivate, setFilterPrivate] = useState(null);

  useEffect(() => {
    document
      .getElementsByClassName("MuiPaper-elevation")[0]
      .scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    getDiningOption();
  }, [props.customerReservationData]);

  const getDiningOption = () => {
    const data = {
      date: moment(props.customerReservationData.date, "YYYY-MM-DD").format(
        "DD-MM-YYYY"
      ),
      exactTime: props.customerReservationData.exactTime,
      noOfAdult: Number(props.customerReservationData.noOfAdult),
      noOfChild: Number(props.customerReservationData.noOfChild),
    };
    dispatch({ type: INPROGRESS });
    CustomerAction.getDiningOption(data, props.customerReservationData.outletId)
      .then((response) => {
        if (response.status === 200) {
          setDinningData([dummyDining, ...response.data.data.diningOptions]);

          if (props.customerReservationData.diningOptions) {
            setFilterDining(props.customerReservationData.diningOptions);
          }

          if (response.data.data.menu) {
            let preOrderItemList = [];

            response.data.data.menu.map((data) => {
              if (checkMealTiming(data))
                data.PreOrderItemDbModel.map((product) =>
                  preOrderItemList.push({ ...product, qty: 0 })
                );
            });

            if (props.customerReservationData.basket) {
              props.customerReservationData?.basket.map((basketProduct) => {
                const findMenuItem = preOrderItemList.find(
                  (product) => product.id === basketProduct.id
                );
                if (findMenuItem) {
                  findMenuItem.qty = basketProduct.qty;
                }
              });
            }

            setMenuItem(preOrderItemList);
          }

          if (response.data.data.privateRoom) {
            setPrivateData(response.data.data.privateRoom);
          }

          if (props.customerReservationData.privateRoom) {
            setFilterPrivate(props.customerReservationData.privateRoom);
          }

          dispatch({
            type: STOPLOADER,
          });
        }
      })
      .catch((error) => {
        if (error && error.response) {
          dispatch({
            type: ERROR,
            data: { error_msg: error.response.data.message },
          });
        } else {
          dispatch({
            type: ERROR,
            data: { error_msg: error.message.toString() },
          });
        }
      });
  };

  const checkMealTiming = (mealType) => {
    let isValidMealType = false;

    const formatedDate = moment(props.customerReservationData.date).format(
      "DD-MM-YYYY"
    );

    const requestedDateAndTime = getFormatedDateAndTime(
      formatedDate,
      props.customerReservationData.exactTime
    );

    mealType.tradingHours.map((mealTiming) => {
      const startMealTiming = getFormatedDateAndTime(
        formatedDate,
        mealTiming.openingTime
      );
      const endMealTiming = getFormatedDateAndTime(
        formatedDate,
        mealTiming.closingTime
      );

      if (
        requestedDateAndTime.isBetween(
          startMealTiming,
          endMealTiming,
          undefined,
          "[]"
        )
      ) {
        isValidMealType = true;
      }
    });
    return isValidMealType;
  };

  const getFormatedDateAndTime = (date, time) => {
    const splitHours = time.split(":");
    const formatedDate = moment(date, "DD-MM-YYYY").set({
      hour: splitHours[0],
      minute: splitHours[1],
    });
    return formatedDate;
  };

  const selectDiningOption = (diningOption) => {
    setFilterDining({
      ...diningOption,
      qty:
        Number(props.customerReservationData.noOfAdult) +
        Number(props.customerReservationData.noOfChild),
    });
  };

  const handleChangePreOrderItem = (menuId, value) => {
    let totalQty = 0;
    const tempMenuItem = cloneDeep(menuItem);
    const menu = tempMenuItem.find((menu) => menu.id === menuId);

    if (menu) {
      menu.qty += value;
      totalQty = menu.qty;
    }

    if (menu.qty < 0) {
      return null;
    }

    if (menu.qty > menu.bookingMaxQty) {
      dispatch({
        type: ERROR,
        data: {
          error_msg: `We have only ${menu.bookingMaxQty} Pax capacity of menu item`,
        },
      });
    } else if (totalQty > menu.dailyTotalQtyleft) {
      dispatch({
        type: ERROR,
        data: {
          error_msg: `Left only ${menu.dailyTotalQtyleft} Pax capacity of menu item `,
        },
      });
    } else {
      setMenuItem([...tempMenuItem]);
    }
  };

  const handleChangePrivateRoom = (selectedPrivateRoom) => {
    if (filterPrivate && filterPrivate.id === selectedPrivateRoom.id) {
      setFilterPrivate(null);
    } else {
      setFilterPrivate(selectedPrivateRoom);
    }
  };

  const handleNext = () => {
    let dinningBillAmount = 0;
    if (filterDining) {
      dinningBillAmount += filterDining.qty * filterDining.price;
    }

    menuItem.map((menu) => {
      if (menu.qty > 0) {
        dinningBillAmount += menu.qty * menu.price;
      }
    });

    if (filterPrivate) {
      dinningBillAmount += 1 * filterPrivate.price;
    }

    props.setPreOrderItemData(
      menuItem,
      filterDining,
      filterPrivate ? filterPrivate : null,
      dinningBillAmount
    );
  };

  const totalAmountData = () => {
    let amount = 0;
    if (filterDining) {
      amount += filterDining.qty * filterDining.price;
    }
    menuItem.map((menu) => {
      if (menu.qty > 0) {
        amount += menu.qty * menu.price;
      }
    });
    if (filterPrivate) {
      amount += 1 * filterPrivate.price;
    }
    return amount;
  };

  const totalOriginalAmountData = () => {
    let amount = 0;
    if (filterDining) {
      amount += filterDining.qty * filterDining.originalPrice;
    }
    menuItem.map((menu) => {
      if (menu.qty > 0) {
        amount += menu.qty * menu.originalPrice;
      }
    });
    if (filterPrivate) {
      amount += 1 * filterPrivate.originalPrice;
    }
    return amount;
  };

  const getClassname = () => {
    if (
      dinningData.length > 0 &&
      menuItem.length > 0 &&
      privateData.length < 1
    ) {
      return "m2";
    } else if (
      dinningData.length < 1 &&
      menuItem.length > 0 &&
      privateData.length > 0
    ) {
      return "m2";
    } else if (
      dinningData.length > 0 &&
      menuItem.length < 1 &&
      privateData.length > 0
    ) {
      return "m2";
    } else if (
      dinningData.length < 1 &&
      menuItem.length < 1 &&
      privateData.length > 0
    ) {
      return "m1";
    } else if (
      dinningData.length < 1 &&
      menuItem.length > 0 &&
      privateData.length < 1
    ) {
      return "m1";
    } else if (
      dinningData.length > 0 &&
      menuItem.length < 1 &&
      privateData.length < 1
    ) {
      return "m1";
    } else {
      return "";
    }
  };

  const getPrivateRoom = () => {
    if (filterDining.overridePrivateRoom) {
      return [];
    }
    return privateData;
  };

  const getDiningOptions = () => {
    const dinningDailyQtyCheck = dinningData.filter(
      (dinning) => dinning.dailyTotalQtyleft > 0
    );
    if (filterPrivate) {
      return dinningDailyQtyCheck.filter(
        (diningOption) => !diningOption.overridePrivateRoom
      );
    }
    return dinningDailyQtyCheck;
  };

  return (
    <Fragment>
      {props.reservationTimeSlot &&
        (dinningData.length > 0 ||
          menuItem.length > 0 ||
          privateData.length > 0) && (
          <div className="stepper-four">
            <div className="stepper-four-left ">
              <h1 className="stepper-header-text">Dining Options</h1>
              {getDiningOptions().length > 0 && (
                <Box
                  sx={{ width: "100%", typography: "body1" }}
                  className="main-card"
                >
                  <div className="time-header-div">Dining Options</div>

                  <div className={`dining-options ${getClassname()}`}>
                    {getDiningOptions().map((dining) => (
                      <Card
                      
                      className={`${
                        dining.id === filterDining.id ? "dining-options-inner dining-options-card active-card" : "dining-options-inner dining-options-card"
                      } ${!dining.isEnable ? "disabled-card" : ""}`}
                        onClick={() => selectDiningOption(dining)}
                        style={{ cursor: "pointer", position: "relative" }}
                      >
                        <div className="card-image1">
                          <img
                            src={`${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${dining.image}`}
                            alt="Paella dish"
                          ></img>
                          <div className="bg-div"></div>
                        </div>

                        <div className="menu-item-info">
                          <span className="menu-item-name">{dining.name}</span>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                          >
                            <span className="item-price">
                              ${dining.originalPrice}&nbsp;
                            </span>

                            <span className="item-price">/ pax</span>

                            <span className="item-detail"></span>  
                          </Box>
                         
                        </div>
                        {!dining.isEnable && (
                          <div  className="error-message">
                            <span>{dining.message}</span>
                          </div>
                        )}
                      </Card>
                    ))}
                  </div>
                </Box>
              )}

              {menuItem.length > 0 && (
                <Box
                  sx={{ width: "100%", typography: "body1" }}
                  className="main-card"
                >
                  <div className="time-header-div">Pre-Order Menu Items</div>
                  <div
                    className={`dining-options pre-oder-options ${getClassname()}`}
                  >
                    {menuItem.map((product, index) => (
                      <Card
                        className={`dining-options-card pre-oder-options-card ${!product.isEnable ? "disabled-card" : ""}`}
                        key={index}
                      >
                        <div className="card-image1 pre-oder-card-image1">
                          <img
                            className="card-images"
                            src={`${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${product.image}`}
                            alt="Paella dish"
                          />
                        </div>

                        <div className="menu-item-info pre-oder-menu-item-info">
                          <span
                            className="menu-item-name pre-oder-menu-item-name"
                            title={product.name}
                          >
                            {product.name}
                          </span>

                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "5px",
                            }}
                          >
                            <div className="card-price-qty ">
                              <span className="item-price pre-oder-item-price">
                                ${product.originalPrice}
                                <span className="pre-oder-item-details">
                                  &nbsp;|&nbsp;
                                  {product.description}
                                </span>
                              </span>

                              <Box className="item-add">
                                <Button
                                  sx={{ border: "unset" }}
                                  variant="outlined"
                                  onClick={() =>
                                    handleChangePreOrderItem(product.id, -1)
                                  }
                                >
                                  <RemoveIcon />
                                </Button>
                                <span>{product.qty}</span>
                                <Button
                                  sx={{ border: "unset" }}
                                  variant="outlined"
                                  onClick={() =>
                                    handleChangePreOrderItem(product.id, 1)
                                  }
                                >
                                  <AddIcon />
                                </Button>
                              </Box>
                            </div>
                            <span
                              className="pre-oder-item-detail item-detail"
                              style={{ width: "95%" }}
                            >
                              {product.description}
                            </span>
                          </Box>
                        </div>
                        {!product.isEnable && (
                            <div className="error-message">
                              <span>{product.message}</span>
                            </div>
                          )}
                      </Card>
                    ))}
                  </div>
                </Box>
              )}

              {getPrivateRoom().length > 0 && (
                <Box
                  sx={{ width: "100%", typography: "body1" }}
                  className="main-card"
                >
                  <div className="time-header-div">Book a Private Room</div>

                  <div
                    className={`dining-options private-room-options ${getClassname()}`}
                    style={{ height: "160px" }}
                  >
                    {getPrivateRoom().map((privateRoom, index) => (
                      <Card
                        className={`${
                          filterPrivate && privateRoom.id === filterPrivate.id
                            ? "private-room-card active-card private-room-options-card"
                            : "private-room-card private-room-options-card"
                        }`}
                        key={index}
                        onClick={() => handleChangePrivateRoom(privateRoom)}
                        style={{ cursor: "pointer", height: "130px" }}
                      >
                        <div className="card-images private-room-card-image1 ">
                          <img
                            className=""
                            src={`${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${privateRoom.image}`}
                            alt="Paella dish"
                          />
                        </div>
                        <div className="menu-item-info private-room-menu-item-info">
                          <span className="menu-item-name private-room-menu-item-name">
                            {privateRoom.name}
                          </span>
                          <span className="item-detail private-room-item-details">
                            {privateRoom.description}
                          </span>

                          <span className="item-price private-room-item-price">
                            $ {privateRoom.originalPrice}
                          </span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Box>
              )}
            </div>

            <div className="right-side">
              <div className="right-side-inner">
                <span className="restaurant-text">Selected Restaurant</span>

                <Accordion
                  className="accordion-div expandedtrue"
                  defaultExpanded
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                    className="accordion-summary"
                  >
                    <div className="restaurant-card">
                      <img
                        src={`${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${props.selectedOutlet.image}`}
                        alt="imgs"
                      />

                      <div className="restaurant-card-inner">
                        <span className="card-name">
                          Restaurant Reservation
                        </span>
                        <span className="card-pax">
                          <PeopleAltIcon />
                          <span>
                            {props.company.minPax ? props.company.minPax : 0}-
                            {props.company.maxPax ? props.company.maxPax : 0}{" "}
                            pax
                          </span>
                        </span>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      padding: "0",
                    }}
                  >
                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">Date</span>
                      <span className="restaurant-text-inner">
                        {moment(
                          props.customerReservationData.date,
                          "YYYY-MM-DD HH:mm"
                        ).format("DD-MM-YYYY")}
                      </span>
                    </div>

                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">
                        Reservation Time
                      </span>
                      <span className="restaurant-text-inner">
                        {props.customerReservationData.exactTime}
                      </span>
                    </div>

                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">
                        No. of Adult
                      </span>
                      <span className="restaurant-text-inner">
                        {props.customerReservationData.noOfAdult}
                      </span>
                    </div>
                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">
                        No. of Child
                      </span>
                      <span className="restaurant-text-inner">
                        {props.customerReservationData.noOfChild}
                      </span>
                    </div>

                    <div
                      className="operating-time"
                      style={{
                        marginTop: "20px",
                        height: "140px",
                        overflow: "auto",
                      }}
                    >
                      <div className="restaurant-info">
                        <div
                          className="restaurant-text-inner time-text-color"
                          style={{ width: "60%", alignItems: "end" }}
                        >
                          <span
                            className="restaurant-text-inner"
                            style={{
                              position: "sticky",
                              top: "0",
                              zIndex: "10",
                              backgroundColor: "#FFF1E4",
                            }}
                          >
                            Total Amount
                          </span>
                          <span
                            className="restaurant-text-inner time-text-color"
                            style={{ fontWeight: "400" }}
                          >
                            {filterDining.id !== -1 && filterDining.name}
                          </span>

                          {menuItem.map(
                            (menu) =>
                              menu.qty !== 0 && (
                                <span
                                  className="restaurant-text-inner time-text-color"
                                  style={{ fontWeight: "400" }}
                                >
                                  {menu.name}
                                </span>
                              )
                          )}

                          {filterPrivate && (
                            <span
                              className="restaurant-text-inner time-text-color"
                              style={{ fontWeight: "400" }}
                            >
                              {filterPrivate.name}
                            </span>
                          )}
                        </div>
                        <div className="restaurant-text-inner time-text-color">
                          <span
                            className="time-text"
                            style={{
                              position: "sticky",
                              top: "0",
                              zIndex: "10",
                              backgroundColor: "#FFF1E4",
                              fontWeight: "700",
                            }}
                          >
                            ${totalOriginalAmountData()}
                          </span>
                          <span className="time-text">
                            {filterDining.id !== -1 &&
                              "$" +
                                (Number(
                                  props.customerReservationData.noOfAdult
                                ) +
                                  Number(
                                    props.customerReservationData.noOfChild
                                  )) *
                                  filterDining.originalPrice}
                          </span>
                          {menuItem.map(
                            (menu) =>
                              menu.qty !== 0 && (
                                <span className="time-text">
                                  ${menu.qty * menu.originalPrice}
                                </span>
                              )
                          )}

                          {filterPrivate && (
                            <span className="time-text">
                              ${filterPrivate.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="restaurant-info">
                        <div
                          className="restaurant-text-inner time-text-color"
                          style={{ width: "60%", alignItems: "end" }}
                        >
                          <span
                            className="restaurant-text-inner"
                            style={{
                              position: "sticky",
                              top: "0",
                              zIndex: "10",
                              backgroundColor: "#FFF1E4",
                            }}
                          >
                            Total Deposit Amount Required
                          </span>
                          <span
                            className="restaurant-text-inner time-text-color"
                            style={{ fontWeight: "400" }}
                          >
                            {filterDining.id !== -1 && filterDining.name}{" "}
                            {filterDining.id !== -1 &&
                              "(" +
                                (Number(
                                  props.customerReservationData.noOfAdult
                                ) +
                                  Number(
                                    props.customerReservationData.noOfChild
                                  )) +
                                " x $" +
                                filterDining.price +
                                ")"}
                          </span>

                          {menuItem.map(
                            (menu) =>
                              menu.qty !== 0 && (
                                <span
                                  className="restaurant-text-inner time-text-color"
                                  style={{ fontWeight: "400" }}
                                >
                                  {menu.name} ({menu.qty} x ${menu.price})
                                </span>
                              )
                          )}

                          {filterPrivate && (
                            <span
                              className="restaurant-text-inner time-text-color"
                              style={{ fontWeight: "400" }}
                            >
                              {filterPrivate.name} (${filterPrivate.price})
                            </span>
                          )}
                        </div>
                        <div className="restaurant-text-inner time-text-color">
                          <span
                            className="time-text"
                            style={{
                              position: "sticky",
                              top: "0",
                              zIndex: "10",
                              backgroundColor: "#FFF1E4",
                              fontWeight: "700",
                            }}
                          >
                            ${totalAmountData()}
                          </span>
                          <span className="time-text">
                            {filterDining.id !== -1 &&
                              "$" +
                                (Number(
                                  props.customerReservationData.noOfAdult
                                ) +
                                  Number(
                                    props.customerReservationData.noOfChild
                                  )) *
                                  filterDining.price}
                          </span>
                          {menuItem.map(
                            (menu) =>
                              menu.qty !== 0 && (
                                <span className="time-text">
                                  ${menu.qty * menu.price}
                                </span>
                              )
                          )}

                          {filterPrivate && (
                            <span className="time-text">
                              ${filterPrivate.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>

                <Accordion className="accordion-div expandedfalse">
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4bh-content"
                    id="panel4bh-header"
                    className="accordion-summary"
                  >
                    <div className="restaurant-card">
                      <img
                        src={`${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${props.selectedOutlet.image}`}
                        alt="imgs"
                      />
                      <div className="restaurant-card-inner">
                        <span className="card-name">
                          Restaurant Reservation
                        </span>
                        <span className="card-pax">
                          <PeopleAltIcon />
                          <span>
                            {props.company.minPax ? props.company.minPax : 0}-
                            {props.company.maxPax ? props.company.maxPax : 0}{" "}
                            pax
                          </span>
                        </span>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      padding: "0",
                    }}
                  >
                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">Date</span>
                      <span className="restaurant-text-inner">
                        {moment(
                          props.customerReservationData.date,
                          "YYYY-MM-DD HH:mm"
                        ).format("DD-MM-YYYY")}
                      </span>
                    </div>

                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">
                        Reservation Time
                      </span>
                      <span className="restaurant-text-inner">
                        {props.customerReservationData.exactTime}
                      </span>
                    </div>

                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">
                        No. of Adult
                      </span>
                      <span className="restaurant-text-inner">
                        {props.customerReservationData.noOfAdult}
                      </span>
                    </div>
                    <div className="restaurant-info">
                      <span className="restaurant-text-inner">
                        No. of Child
                      </span>
                      <span className="restaurant-text-inner">
                        {props.customerReservationData.noOfChild}
                      </span>
                    </div>

                    <div
                      className="operating-time"
                      style={{ marginTop: "20px" }}
                    >
                      <div
                        className="restaurant-info"
                        style={{ maxHeight: "150px", overflow: "auto" }}
                      >
                        <div
                          className="restaurant-text-inner time-text-color"
                          style={{ width: "50%", alignItems: "end" }}
                        >
                          <span className="restaurant-text-inner">
                            Total Deposit Amount Required
                          </span>
                          <span
                            className="restaurant-text-inner time-text-color"
                            style={{ fontWeight: "400" }}
                          >
                            {filterDining.id !== -1 && filterDining.name}
                            {filterDining.id !== -1 &&
                              "(" +
                                (Number(
                                  props.customerReservationData.noOfAdult
                                ) +
                                  Number(
                                    props.customerReservationData.noOfChild
                                  )) +
                                " x $" +
                                filterDining.price +
                                ")"}
                          </span>

                          {menuItem.map(
                            (menu) =>
                              menu.qty !== 0 && (
                                <span
                                  className="restaurant-text-inner time-text-color"
                                  style={{ fontWeight: "400" }}
                                >
                                  {menu.name} ({menu.qty} x ${menu.price})
                                </span>
                              )
                          )}

                          {filterPrivate && (
                            <span
                              className="restaurant-text-inner time-text-color"
                              style={{ fontWeight: "400" }}
                            >
                              {filterPrivate.name} (${filterPrivate.price})
                            </span>
                          )}
                        </div>
                        <div className="restaurant-text-inner time-text-color">
                          <span
                            className="time-text"
                            style={{ fontWeight: "700" }}
                          >
                            ${totalAmountData()}
                          </span>
                          <span className="time-text">
                            {filterDining.id !== -1 &&
                              "$" +
                                (Number(
                                  props.customerReservationData.noOfAdult
                                ) +
                                  Number(
                                    props.customerReservationData.noOfChild
                                  )) *
                                  filterDining.price}
                          </span>
                          {menuItem.map(
                            (menu) =>
                              menu.qty !== 0 && (
                                <span className="time-text">
                                  ${menu.qty * menu.price}
                                </span>
                              )
                          )}

                          {filterPrivate && (
                            <span className="time-text">
                              ${filterPrivate.price}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
              </div>

              <Box className="footer-btn">
                <Button
                  variant="contained"
                  className="inner-btn"
                  color="inherit"
                  disabled={props.activeStep === 0}
                  onClick={props.handleBack}
                  sx={{ mr: 1 }}
                >
                  Back
                </Button>
                {/* <Box sx={{ flex: "1 1 auto" }} /> */}
                <Button variant="contained" onClick={handleNext} sx={{ mr: 1 }}>
                  Next
                </Button>
              </Box>
            </div>
          </div>
        )}
    </Fragment>
  );
};
const mapDispatchToProps = (dispatch) => ({
  actions: {
    customerAction: bindActionCreators(CustomerAction, dispatch),
  },
});
export default connect(null, mapDispatchToProps)(ReservationStep4);
