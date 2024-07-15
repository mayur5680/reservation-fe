import React, { useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ENVIRONMENT_VARIABLES from "../../../../../environment.config";
import "./style.scss";
import { handleUpdatedBy } from "../../../../../utils/userAccess";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

let moment = require("moment-timezone");
var reader = new FileReader();

const daysofweek = [
  {
    code: 0,
    day: "Sunday",
    isChecked: false,
  },
  {
    code: 1,
    day: "Monday",
    isChecked: false,
  },
  {
    code: 2,
    day: "Tuesday",
    isChecked: false,
  },
  {
    code: 3,
    day: "Wednesday",
    isChecked: false,
  },
  {
    code: 4,
    day: "Thursday",
    isChecked: false,
  },
  {
    code: 5,
    day: "Friday",
    isChecked: false,
  },
  {
    code: 6,
    day: "Saturday",
    isChecked: false,
  },
];

const EditPreOrder = (props) => {
  const {
    open,
    handleClosEditPreOrder,
    handleEditSavePreOrder,
    selectedPreOrder,
    mealTypes,
  } = props;

  const [preOrderData, setPreOrderData] = useState({
    sectionId: selectedPreOrder.sectionId,
    name: selectedPreOrder.name,
    dailyMaxQty: selectedPreOrder.dailyMaxQty,
    price: selectedPreOrder.price,
    bookingMaxQty: selectedPreOrder.bookingMaxQty,
    originalPrice: selectedPreOrder.originalPrice,
    description: selectedPreOrder.description,
    isActive: selectedPreOrder.isActive,
    image: selectedPreOrder.image,
    startDate: selectedPreOrder.startDate,
    endDate: selectedPreOrder.endDate,
    leadTime: selectedPreOrder.leadTime,
    repeatOn: daysofweek.map((day) => ({
      ...day,
      isChecked: selectedPreOrder.repeatOn.includes(day.day),
    })),
  });
  const [error, setError] = useState(null);

  const [imageDisplay, setImageDisplay] = useState(
    `${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${selectedPreOrder.image}`
  );

  useEffect(() => {
    if (selectedPreOrder) {
      const updatedRepeatOn = preOrderData.repeatOn.map((day) => ({
        ...day,
        isChecked: selectedPreOrder.repeatOn.includes(day.day),
      }));

      const filterDay = updatedRepeatOn.filter((day) => day.isChecked);

      setPreOrderData((prevData) => ({
        ...prevData,

        repeatOn: updatedRepeatOn,
        filterDays: filterDay,
      }));
    }
  }, [selectedPreOrder]);

  const handleChange = (event) => {
    const field = event.target.name;
    let commonData = { ...preOrderData };
    commonData[field] = event.target.value;
    return setPreOrderData(commonData);
  };

  const handleEditPreOrder = () => {
    const filterWeekOfDay = preOrderData.repeatOn
      .filter((day) => day.isChecked)
      .map((day) => day.day);
    handleEditSavePreOrder(
      {
        ...preOrderData,
        repeatOn: filterWeekOfDay,
      },
      props.selectedPreOrder.id
    );
    handleClosEditPreOrder();
  };

  const handleImageUpload = (event) => {
    setPreOrderData({
      ...preOrderData,
      image: event.target.files[0],
    });
    reader.readAsDataURL(event.target.files[0]);
  };

  reader.onload = function (e) {
    setImageDisplay(e.target.result);
  };

  const handleChangeStartDate = (date) => {
    setPreOrderData({
      ...preOrderData,
      startDate: date,
    });
  };

  const handleChangeEndDate = (date) => {
    setPreOrderData({
      ...preOrderData,
      endDate: date,
    });
  };

  const handleRepeatOnFilter = (e) => {
    const value = e.target.value[e.target.value.length - 1];
    let tempData = [...preOrderData.repeatOn];

    tempData[value].isChecked = !tempData[value].isChecked;

    let filterDay = tempData
      .filter((day) => day.isChecked)
      .map((day) => day.day);

    setPreOrderData((prevData) => ({
      ...prevData,
      repeatOn: tempData,
      filterDays: filterDay,
    }));
  };

  const errorMessage = useMemo(() => {
    switch (error) {
      case "maxDate":
      case "minDate": {
        return "Date should be greater than Start Date";
      }

      default: {
        return "";
      }
    }
  }, [error]);
  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClosEditPreOrder}>
        <ValidatorForm
          onSubmit={() => handleEditPreOrder()}
          autoComplete="off"
          className="popup-layout"
        >
          <Box className="popup-header">
            <DialogTitle>Update Pre Order Item</DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>Status</Typography>
              <Switch
                name="status"
                checked={preOrderData.isActive}
                onClick={() =>
                  setPreOrderData({
                    ...preOrderData,
                    isActive: !preOrderData.isActive,
                  })
                }
              />
            </Stack>
          </Box>
          <DialogContent sx={{ width: "600px" }} className="popup-body">
            <div className="popup-input-box w-50">
              <Typography>Meal Type</Typography>
              <FormControl>
                <Select
                  size="small"
                  value={preOrderData.sectionId}
                  name="sectionId"
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  onChange={handleChange}
                >
                  {mealTypes.map((mealType, index) => (
                    <MenuItem key={index} value={mealType.id}>
                      {mealType.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="popup-input-box w-50">
              <Typography>Item Name</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="text"
                name="name"
                value={preOrderData.name}
                placeholder="Enter Item Name"
                sx={{ marginTop: 0 }}
                validators={["required"]}
                onChange={handleChange}
                errorMessages={["Item Name is required"]}
              />
            </div>
            <div className="popup-input-box w-50">
              <Typography>Day Max Pax</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="number"
                name="dailyMaxQty"
                value={preOrderData.dailyMaxQty}
                placeholder="Enter Day Max Pax"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
                errorMessages={[
                  "Day Max Pax is required",
                  "Day Max Pax should be more than 0",
                ]}
              />
            </div>
            <div className="popup-input-box w-50">
              <Typography>Booking Max Pax</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="number"
                name="bookingMaxQty"
                value={preOrderData.bookingMaxQty}
                placeholder="Enter Booking Max Pax"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
                errorMessages={[
                  "Booking Max Pax is required",
                  "Booking Max Pax should be more than 0",
                ]}
              />
            </div>
            <div className="popup-input-box w-50">
              <Typography>Unit Price</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="number"
                name="originalPrice"
                value={preOrderData.originalPrice}
                placeholder="Enter Unit Price"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
                errorMessages={[
                  "Unit Price is required",
                  "Unit Price should be more than 0",
                ]}
              />
            </div>
            <div className="popup-input-box w-50">
              <Typography>Deposit Amount</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="number"
                name="price"
                value={preOrderData.price}
                placeholder="Enter Deposit Amount"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
                errorMessages={[
                  "Deposit Amount is required",
                  "Deposit Amount should be more than 0",
                ]}
              />
            </div>
            <div className="popup-input-box w-50 p-10 date-picker1">
              <Typography>Start Date</Typography>
              {preOrderData.startDate && (
                <LocalizationProvider dateAdapter={AdapterDayjs} size="small">
                  <DesktopDatePicker
                    disablePast
                    className="w-100"
                    value={preOrderData.startDate}
                    onChange={(newValue) => {
                      handleChangeStartDate(new Date(newValue));
                    }}
                    inputFormat="DD-MM-YYYY"
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              )}
            </div>

            <div className="popup-input-box w-50 p-10 date-picker1">
              <Typography>End Date</Typography>
              {preOrderData.endDate && (
                <LocalizationProvider dateAdapter={AdapterDayjs} size="small">
                  <DesktopDatePicker
                    minDate={preOrderData.startDate}
                    className="w-100"
                    disablePast
                    value={preOrderData.endDate}
                    onChange={(newValue) => {
                      handleChangeEndDate(new Date(newValue));
                    }}
                    inputFormat="DD-MM-YYYY"
                    renderInput={(params) => (
                      <TextField helperText={errorMessage} {...params} />
                    )}
                    onError={(newError) => setError(newError)}
                  />
                </LocalizationProvider>
              )}
            </div>
            <div className="popup-input-box w-50">
              <Typography>Day Of Week</Typography>
              <FormControl fullWidth size="small" sx={{ width: "160px" }}>
                <Select
                  multiple
                  size="small"
                  value={preOrderData.repeatOn}
                  name="repeatOn"
                  inputProps={{ "aria-label": "Without label" }}
                  onChange={handleRepeatOnFilter}
                  renderValue={(selected) => {
                    selected = preOrderData.repeatOn.filter(
                      (data) => data.isChecked === true
                    );
                    const renderData = selected.map((user) => user.day);
                    return renderData.join(", ");
                  }}
                >
                  {preOrderData.repeatOn.map((data, index) => (
                    <MenuItem key={index} value={data.code}>
                      <ListItemIcon>
                        <Checkbox checked={data.isChecked} />
                      </ListItemIcon>
                      <ListItemText primary={data.day} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <div className="popup-input-box w-50">
              <Typography>Lead Time(Minutes)</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="text"
                name="leadTime"
                value={preOrderData.leadTime}
                placeholder="Enter Lead Time"
                sx={{ marginTop: 0 }}
                validators={["required"]}
                onChange={handleChange}
                errorMessages={[
                  "Lead Time is required",
                  "Lead Time should be more than 0",
                ]}
              />
            </div>

            <div className="popup-input-box w-100">
              <Typography>Description</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="text"
                name="description"
                value={preOrderData.description}
                multiline
                rows={4}
                placeholder="Enter Description"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
              />
            </div>
            <div className="popup-input-box w-50">
              <Typography>Upload Image</Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                {preOrderData.image && (
                  <img
                    className="product-image"
                    src={imageDisplay}
                    alt="demo"
                  />
                )}
                <Button variant="contained" component="label">
                  Upload
                  <input
                    name="image"
                    accept="image/*"
                    hidden
                    type="file"
                    onChange={(event) => handleImageUpload(event)}
                  />
                </Button>
              </Stack>
            </div>
            <div className="popup-input-box w-50 info">
              <DialogContentText>
                Created by :{props.selectedPreOrder.createdBy}
              </DialogContentText>
              <DialogContentText>
                Created date :
                {props.selectedPreOrder.createdAt
                  ? moment(props.selectedPreOrder.createdAt).format(
                      "DD-MM-YYYY hh:mm A"
                    )
                  : "N/A"}
              </DialogContentText>
              <DialogContentText>
                Updated by:{handleUpdatedBy(props.selectedPreOrder.updatedBy)}
              </DialogContentText>
              <DialogContentText>
                Updated date :
                {props.selectedPreOrder.updatedAt
                  ? moment(props.selectedPreOrder.updatedAt).format(
                      "DD-MM-YYYY hh:mm A"
                    )
                  : "N/A"}
              </DialogContentText>
            </div>
          </DialogContent>
          <DialogActions className="primary-btn popup-btn gap">
            <Button variant="outlined" onClick={handleClosEditPreOrder}>
              <CloseOutlinedIcon /> Close
            </Button>
            <Button type="submit" variant="contained">
              <SaveOutlinedIcon /> SAVE
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    </React.Fragment>
  );
};
export default EditPreOrder;
