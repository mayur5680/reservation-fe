/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
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
  Typography,
} from "@mui/material";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import { useState } from "react";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";

import ENVIRONMENT_VARIABLES from "../../../../../environment.config";
import "./style.scss";
import { handleUpdatedBy } from "../../../../../utils/userAccess";

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

const EditDiningOption = (props) => {
  const {
    open,
    handleClosEditDiningOption,
    handleEditSaveDiningOption,
    selectedDiningOption,
  } = props;

  const [diningOptionData, setDiningOptionData] = useState({
    name: selectedDiningOption.name,
    price: selectedDiningOption.price,
    dailyMaxQty: selectedDiningOption.dailyMaxQty,
    bookingMaxQty: selectedDiningOption.bookingMaxQty,
    description: selectedDiningOption.description,
    isActive: selectedDiningOption.isActive,
    image: selectedDiningOption.image,
    originalPrice: selectedDiningOption.originalPrice,
    repeatOn: daysofweek.map((day) => ({
      ...day,
      isChecked: selectedDiningOption.repeatOn.includes(day.day),
    })),
    blockTime: selectedDiningOption.blockTime,
    leadTime: selectedDiningOption.leadTime,
    overridePrivateRoom: selectedDiningOption.overridePrivateRoom,
  });
  const [isImageLoad, setIsImageLoad] = useState(false);
  const [imageDisplay, setImageDisplay] = useState(
    `${ENVIRONMENT_VARIABLES.Base_IMAGE_URL}${selectedDiningOption.image}`
  );

  useEffect(() => {
    if (selectedDiningOption) {
      const updatedRepeatOn = diningOptionData.repeatOn.map((day) => ({
        ...day,
        isChecked: selectedDiningOption.repeatOn.includes(day.day),
      }));

      const filterDay = updatedRepeatOn.filter((day) => day.isChecked);

      setDiningOptionData((prevData) => ({
        ...prevData,

        repeatOn: updatedRepeatOn,
        filterDays: filterDay,
      }));
    }
  }, [selectedDiningOption]);

  const handleChange = (event) => {
    const field = event.target.name;
    let commonData = { ...diningOptionData };
    commonData[field] = event.target.value;
    return setDiningOptionData(commonData);
  };

  const handleOpenEditDiningOption = () => {
    const filterWeekOfDay = diningOptionData.repeatOn
      .filter((day) => day.isChecked)
      .map((day) => day.day);

    handleEditSaveDiningOption(
      {
        ...diningOptionData,
        repeatOn: filterWeekOfDay,
      },
      props.selectedDiningOption.id
    );

    handleClosEditDiningOption();
  };

  const handleImageUpload = (event) => {
    if (
      event.target.files[0].type === "image/jpeg" ||
      event.target.files[0].type === "image/png"
    ) {
      setDiningOptionData({
        ...diningOptionData,
        image: event.target.files[0],
      });
      reader.readAsDataURL(event.target.files[0]);
      setIsImageLoad(false);
    } else {
      setIsImageLoad(true);
    }
  };

  const handleRepeatOnFilter = (e) => {
    const value = e.target.value[e.target.value.length - 1];
    let tempData = [...diningOptionData.repeatOn];

    tempData[value].isChecked = !tempData[value].isChecked;

    let filterDay = tempData
      .filter((day) => day.isChecked)
      .map((day) => day.day);

    setDiningOptionData((prevData) => ({
      ...prevData,
      repeatOn: tempData,
      filterDays: filterDay,
    }));
  };

  reader.onload = function (e) {
    setImageDisplay(e.target.result);
  };

  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClosEditDiningOption}>
        <ValidatorForm
          onSubmit={() => handleOpenEditDiningOption()}
          autoComplete="off"
          className="popup-layout"
        >
          <Box className="popup-header">
            <DialogTitle>Update Dining Option</DialogTitle>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>Status</Typography>
              <Switch
                name="status"
                checked={diningOptionData.isActive}
                onClick={() =>
                  setDiningOptionData({
                    ...diningOptionData,
                    isActive: !diningOptionData.isActive,
                  })
                }
              />
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography>overridePrivateRoom</Typography>
              <Switch
                name="isPrivateRoom"
                checked={diningOptionData.overridePrivateRoom}
                onClick={() =>
                  setDiningOptionData({
                    ...diningOptionData,
                    overridePrivateRoom: !diningOptionData.overridePrivateRoom,
                  })
                }
              />
            </Stack>
          </Box>
          <DialogContent sx={{ width: "600px" }} className="popup-body">
            <div className="popup-input-box w-50">
              <Typography>Item Name</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="text"
                name="name"
                value={diningOptionData.name}
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
                value={diningOptionData.dailyMaxQty}
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
                value={diningOptionData.bookingMaxQty}
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
              <Typography>Price</Typography>
              <TextValidator
                fullWidth
                size="small"
                margin="normal"
                type="number"
                name="originalPrice"
                value={diningOptionData.originalPrice}
                placeholder="Enter Price"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
                errorMessages={[
                  "Price is required",
                  "Price should be more than 0",
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
                value={diningOptionData.price}
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

            <div className="popup-input-box w-50">
              <Typography>Block Time (In Minutes)</Typography>
              <TextValidator
                fullWidth
                size="small"
                type="number"
                name="blockTime"
                value={diningOptionData.blockTime}
                placeholder="Enter Block Time"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
                errorMessages={[
                  "Block Time is required",
                  "Block Time should be more than 0",
                ]}
              />
            </div>

            <div className="popup-input-box w-50">
              <Typography>Day Of Week</Typography>
              <FormControl fullWidth size="small" sx={{ width: "160px" }}>
                <Select
                  multiple
                  size="small"
                  value={diningOptionData.repeatOn}
                  name="repeatOn"
                  inputProps={{ "aria-label": "Without label" }}
                  onChange={handleRepeatOnFilter}
                  renderValue={(selected) => {
                    selected = diningOptionData.repeatOn.filter(
                      (data) => data.isChecked === true
                    );
                    const renderData = selected.map((user) => user.day);
                    return renderData.join(", ");
                  }}
                >
                  {diningOptionData.repeatOn.map((data, index) => (
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
              <Typography>Lead Time (Minutes)</Typography>
              <TextValidator
                fullWidth
                size="small"
                type="number"
                name="leadTime"
                value={diningOptionData.leadTime}
                placeholder="Enter Lead Time"
                sx={{ marginTop: 0 }}
                onChange={handleChange}
                validators={["required", "minNumber:0"]}
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
                value={diningOptionData.description}
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
                {!isImageLoad ? (
                  <img
                    className="product-image"
                    src={imageDisplay}
                    alt="demo"
                  />
                ) : (
                  ""
                )}
                <Button variant="contained" component="label">
                  Upload
                  <input
                    name="image"
                    accept=".jpeg,.jpg,.png"
                    hidden
                    type="file"
                    onChange={(event) => handleImageUpload(event)}
                  />
                </Button>
              </Stack>
              {isImageLoad && (
                <div className="dangers">This File Type Not Allowed</div>
              )}
            </div>
            <div className="popup-input-box w-50 info">
              <DialogContentText>
                Created by :{props.selectedDiningOption.createdBy}
              </DialogContentText>
              <DialogContentText>
                Created date :
                {props.selectedDiningOption.createdAt
                  ? moment(props.selectedDiningOption.createdAt).format(
                      "DD-MM-YYYY hh:mm A"
                    )
                  : "N/A"}
              </DialogContentText>
              <DialogContentText>
                Updated by:
                {handleUpdatedBy(props.selectedDiningOption.updatedBy)}
              </DialogContentText>
              <DialogContentText>
                Updated date :
                {props.selectedDiningOption.updatedAt
                  ? moment(props.selectedDiningOption.updatedAt).format(
                      "DD-MM-YYYY hh:mm A"
                    )
                  : "N/A"}
              </DialogContentText>
            </div>
          </DialogContent>
          <DialogActions className="primary-btn popup-btn gap">
            <Button variant="outlined" onClick={handleClosEditDiningOption}>
              <CloseOutlinedIcon /> Close
            </Button>
            <Button disabled={isImageLoad} type="submit" variant="contained">
              <SaveOutlinedIcon /> SAVE
            </Button>
          </DialogActions>
        </ValidatorForm>
      </Dialog>
    </React.Fragment>
  );
};
export default EditDiningOption;
