/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { TextValidator, ValidatorForm } from "react-material-ui-form-validator";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import PercentIcon from "@mui/icons-material/Percent";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import { useSelector } from "react-redux";
import _ from "lodash";

import ConfirmationPopUp from "../../../../../CommonComponent/ConfirmationPopUp";
import {
  ActionType,
  handlePermission,
  Modules,
} from "../../../../../utils/userAccess";
import "./style.scss";

const EditPromo = (props) => {
  const {
    open,
    handleEditCloseTimingPromo,
    handleEditSaveTimingPromo,
    selectedpromo,
  } = props;
  const [error, setError] = useState(null);

  const [openUpdateStatus, setOpenUpdateStatus] = useState(false);

  const repeatOn = [
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
  const [promoData, setPromoData] = useState(null);

  const permission = useSelector((state) => state.hotelReducer.permission);

  useEffect(() => {
    if (selectedpromo) {
      const filterWeekOfDay = repeatOn.map((weekDay) => {
        weekDay.isChecked = false;
        if (selectedpromo.repeatOn.find((day) => day === weekDay.day))
          weekDay.isChecked = true;
        return weekDay;
      });

      let filterDay = filterWeekOfDay.filter(
        (filter) => filter.isChecked === true
      );

      setPromoData({
        name: selectedpromo?.name,
        discountAmount: selectedpromo?.discountAmount,
        noOfPerson: selectedpromo?.noOfPerson,
        startDate: selectedpromo.startDate,
        endDate: selectedpromo.endDate,
        openingTime: selectedpromo.openingTime,
        closingTime: selectedpromo.closingTime,
        tc: selectedpromo?.tc,
        isCampaignActive: selectedpromo?.isCampaignActive,
        repeatOn: filterWeekOfDay,
        filterDays: filterDay,
      });
    }
  }, [selectedpromo]);

  const handleChange = (event) => {
    const field = event.target.name;
    let commonData = { ...promoData };
    commonData[field] = event.target.value;
    return setPromoData(commonData);
  };

  const handleEditTimingPromo = () => {
    let filterWeekOfDay = promoData.repeatOn.map((weekofDay) => {
      if (weekofDay.isChecked === true) {
        return weekofDay.day;
      } else {
        return null;
      }
    });
    filterWeekOfDay = _.compact(filterWeekOfDay);
    handleEditSaveTimingPromo(
      { ...promoData, repeatOn: filterWeekOfDay },
      selectedpromo?.dbId
    );
    handleEditCloseTimingPromo();
  };

  const handeChangeStatus = () => {
    setPromoData({
      ...promoData,
      isCampaignActive: !promoData.isCampaignActive,
    });
    setOpenUpdateStatus(promoData.isCampaignActive);
  };

  const handleCloseUpdateStatus = () => {
    setPromoData({
      ...promoData,
      isCampaignActive: !promoData.isCampaignActive,
    });
    setOpenUpdateStatus(false);
  };

  const handleFilter = (e) => {
    const value = e.target.value[e.target.value.length - 1];

    let tempData = promoData.repeatOn.map((data) =>
      data.code === value ? { ...data, isChecked: !data.isChecked } : data
    );

    let filterDay = tempData.filter((filter) => filter.isChecked === true);

    setPromoData({
      ...promoData,
      repeatOn: tempData,
      filterDays: filterDay,
    });
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
      {openUpdateStatus && (
        <ConfirmationPopUp
          open={openUpdateStatus}
          handleClose={handleCloseUpdateStatus}
          message="Confirm To Update Status"
          data={{ ...promoData }}
          handleUpdate={handleEditTimingPromo}
        />
      )}

      {promoData && permission && (
        <Dialog open={open} onClose={handleEditCloseTimingPromo}>
          <ValidatorForm
            onSubmit={() => error === null && handleEditTimingPromo()}
            autoComplete="off"
            className="popup-layout"
          >
            <Box className="popup-header">
              <DialogTitle>{promoData.name}</DialogTitle>
            </Box>
            <DialogContent sx={{ width: "600px" }} className="popup-body">
              <div className="popup-input-box w-50 date-picker">
                <Typography>Start Date</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs} size="small">
                  <DesktopDatePicker
                    disablePast
                    value={promoData.startDate}
                    onChange={(newValue) => {
                      setPromoData({
                        ...promoData,
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
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DesktopDatePicker
                    minDate={promoData.startDate}
                    disablePast
                    value={promoData.endDate}
                    onChange={(newValue) => {
                      setPromoData({
                        ...promoData,
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
              <div className="popup-input-box w-50 date-picker">
                <Typography>Start Time</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MobileTimePicker
                    value={promoData.openingTime}
                    onChange={(newValue) => {
                      setPromoData({
                        ...promoData,
                        openingTime: new Date(newValue),
                      });
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
              <div className="popup-input-box w-50 justify-end date-picker">
                <Typography>End Time</Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <MobileTimePicker
                    value={promoData.closingTime}
                    onChange={(newValue) => {
                      setPromoData({
                        ...promoData,
                        closingTime: new Date(newValue),
                      });
                    }}
                    renderInput={(params) => <TextField {...params} />}
                  />
                </LocalizationProvider>
              </div>
              <div className="popup-input-box w-50">
                <Typography>Discount Amount</Typography>
                <TextValidator
                  size="small"
                  fullWidth
                  margin="normal"
                  type="number"
                  name="discountAmount"
                  value={promoData.discountAmount}
                  placeholder="Enter Discount Amount"
                  sx={{ marginTop: 0 }}
                  onChange={handleChange}
                  validators={["required", "minNumber:0"]}
                  errorMessages={[
                    "Discount Amount is required",
                    "Discount Amount should be more than 0",
                  ]}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <PercentIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </div>
              <div className="popup-input-box w-50">
                <Typography>Pax</Typography>
                <TextValidator
                  size="small"
                  fullWidth
                  margin="normal"
                  type="number"
                  name="noOfPerson"
                  value={promoData.noOfPerson}
                  placeholder="Enter Pax"
                  sx={{ marginTop: 0 }}
                  onChange={handleChange}
                  validators={["required", "minNumber:0"]}
                  errorMessages={[
                    "Pax is required",
                    "Pax should be more than 0",
                  ]}
                />
              </div>
              <div className="popup-input-box w-100">
                <Typography>Repeat</Typography>
                <FormControl fullWidth size="small" sx={{ width: "160px" }}>
                  <Select
                    multiple
                    size="small"
                    value={promoData.repeatOn}
                    name="repeatOn"
                    inputProps={{ "aria-label": "Without label" }}
                    onChange={handleFilter}
                    renderValue={(selected) => {
                      selected = promoData.repeatOn.filter(
                        (data) => data.isChecked === true
                      );
                      const renderData = selected.map((user) => user.day);
                      return renderData.join(", ");
                    }}
                  >
                    {promoData.repeatOn.map((data, index) => (
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
              <div className="popup-input-box w-100">
                <Typography>Terms and Conditions</Typography>
                <TextValidator
                  fullWidth
                  size="small"
                  margin="normal"
                  type="text"
                  name="tc"
                  value={promoData.tc}
                  placeholder="Enter Terms and Conditions"
                  sx={{ marginTop: 0 }}
                  multiline
                  rows={4}
                  onChange={handleChange}
                />
              </div>
              {handlePermission(
                permission.permission,
                Modules.TIMINGPROMO,
                ActionType.delete
              ) && (
                <div className="w-100 p-0">
                  <FormControlLabel
                    sx={{ justifyContent: "flex-end", display: "flex" }}
                    label="End Campaign"
                    control={
                      <Checkbox
                        sx={{ padding: "0" }}
                        checked={!promoData.isCampaignActive}
                        onChange={handeChangeStatus}
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                  />
                </div>
              )}
            </DialogContent>

            <DialogActions className="primary-btn popup-btn">
              <Button variant="outlined" onClick={handleEditCloseTimingPromo}>
                <CloseOutlinedIcon /> Close
              </Button>
              <Button
                disabled={
                  handlePermission(
                    permission.permission,
                    Modules.TIMINGPROMO,
                    ActionType.update,
                    true
                  ) || promoData.filterDays.length < 1
                }
                type="submit"
                variant="contained"
              >
                <AddOutlinedIcon /> Save
              </Button>
            </DialogActions>
          </ValidatorForm>
        </Dialog>
      )}
    </React.Fragment>
  );
};

export default EditPromo;