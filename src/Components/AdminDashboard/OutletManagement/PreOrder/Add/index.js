import React, { useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  Typography,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { useState } from "react";
import Checkbox from "@mui/material/Checkbox";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

import "./style.scss";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { daysOfWeek } from "../../../../../utils/dayOfWeek";
import { isEmpty } from "lodash";

var reader = new FileReader();

const AddPreOrder = (props) => {
  const [isImageUpload, setIsImageUpload] = useState(false);
  const { open, handleClosePreOrder, handleSavePreOrder } = props;
  const [error, setError] = useState(null);
  const [preOrderData, setPreOrderData] = useState({
    sectionId: props.mealTypes,
    name: "",
    dailyMaxQty: "",
    price: 0,
    bookingMaxQty: "",
    description: "",
    image: null,
    originalPrice: 0,
    startDate: new Date(
      new Date().toLocaleString("en-US", {
        timeZone: props.timezone,
      })
    ),
    endDate: new Date(
      new Date().toLocaleString("en-US", {
        timeZone: props.timezone,
      })
    ),
    leadTime: 0,
    repeatOn: [],
  });

  const [imageDisplay, setImageDisplay] = useState(null);

  const handleChange = (event) => {
    const field = event.target.name;
    let commonData = { ...preOrderData };
    commonData[field] = event.target.value;
    return setPreOrderData(commonData);
  };

  const handleFilter = (e) => {
    const value = e.target.value[e.target.value.length - 1];
    let tempData = preOrderData.sectionId.map((data) =>
      data.id === value ? { ...data, isChecked: !data.isChecked } : data
    );
    setPreOrderData({ ...preOrderData, sectionId: tempData });
  };

  const handleAddPreOrder = () => {
    if (isImageUpload) {
      handleSavePreOrder(preOrderData);
      handleClosePreOrder();
    }
  };

  const handleImageUpload = (event) => {
    setPreOrderData({
      ...preOrderData,
      image: event.target.files[0],
    });
    setIsImageUpload(true);
    reader.readAsDataURL(event.target.files[0]);
  };

  reader.onload = function (e) {
    setImageDisplay(e.target.result);
  };

  const handleRepeatOnChange = (event) => {
    const {
      target: { value },
    } = event;
    setPreOrderData({
      ...preOrderData,
      repeatOn: typeof value === "string" ? value.split(",") : value,
    });
  };

  const checkIsEmpty = (sectionId) => {
    return (
      isEmpty(preOrderData.repeatOn) ||
      !isImageUpload ||
      isEmpty(sectionId.filter((meal) => meal.isChecked === true))
    );
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
      <Dialog open={open} onClose={handleClosePreOrder}>
        <ValidatorForm
          onSubmit={() => error === null && handleAddPreOrder()}
          autoComplete="off"
          className="popup-layout"
        >
          <Box className="popup-header">
            <DialogTitle>Add Pre Order Item</DialogTitle>
          </Box>
          <DialogContent sx={{ width: "600px" }} className="popup-body">
            <div className="popup-input-box w-50">
              <Typography>Meal Type</Typography>
              {props.mealTypes && (
                <FormControl size="small" sx={{ width: 450 }}>
                  <Select
                    multiple
                    value={preOrderData.sectionId}
                    name="sectionId"
                    required={true}
                    onChange={handleFilter}
                    renderValue={(selected) => {
                      selected = preOrderData.sectionId.filter(
                        (data) => data.isChecked === true
                      );
                      const renderData = selected.map((user) => user.name);
                      return renderData.join(", ");
                    }}
                  >
                    {preOrderData.sectionId.map((mealType) => (
                      <MenuItem key={mealType.id} value={mealType.id}>
                        <ListItemIcon>
                          <Checkbox checked={mealType.isChecked} />
                        </ListItemIcon>
                        <ListItemText primary={mealType.name} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
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
            <div className="popup-input-box w-50 date-picker">
              <Typography>Start Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs} size="small">
                <DesktopDatePicker
                  disablePast
                  value={preOrderData.startDate}
                  onChange={(newValue) => {
                    setPreOrderData({
                      ...preOrderData,
                      startDate: new Date(newValue),
                    });
                  }}
                  inputFormat="DD-MM-YYYY"
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
            </div>

            <div className="popup-input-box w-50 date-picker">
              <Typography>End Date</Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs} size="small">
                <DesktopDatePicker
                  disablePast
                  minDate={preOrderData.startDate}
                  value={preOrderData.endDate}
                  onChange={(newValue) => {
                    setPreOrderData({
                      ...preOrderData,
                      endDate: new Date(newValue),
                    });
                  }}
                  inputFormat="DD-MM-YYYY"
                  renderInput={(params) => (
                    <TextField helperText={errorMessage} {...params} />
                  )}
                  onError={(newError) => setError(newError)}
                />
              </LocalizationProvider>
            </div>

            <div className="popup-input-box w-50">
              <Typography> Day Of Week</Typography>
              <FormControl size="small" sx={{ width: 450 }}>
                <Select
                  multiple
                  size="small"
                  inputProps={{ "aria-label": "Without label" }}
                  value={preOrderData.repeatOn}
                  name="repeatOn"
                  onChange={handleRepeatOnChange}
                  renderValue={(selected) => selected.join(", ")}
                >
                  {daysOfWeek?.map((day) => (
                    <MenuItem key={day.code} value={day.day}>
                      <Checkbox
                        checked={preOrderData.repeatOn.indexOf(day.day) > -1}
                      />
                      <ListItemText primary={day.day} />
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
                ]}              />
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
                <div className="primary-btn popup-btn">
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
                </div>
              </Stack>
              {!isImageUpload && <p className="danger">Image Is Required</p>}
            </div>
          </DialogContent>
          <DialogActions className="primary-btn popup-btn gap">
            <Button variant="outlined" onClick={handleClosePreOrder}>
              <CloseOutlinedIcon /> Close
            </Button>
            <Button
              disabled={checkIsEmpty(preOrderData.sectionId)}
              type="submit"
              variant="contained"
            >
              <AddOutlinedIcon /> Add
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    </React.Fragment>
  );
};
export default AddPreOrder;
