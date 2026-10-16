import { createSlice } from "@reduxjs/toolkit";
import { modules } from "@/config/modules";

const initialState = {
  tabs: [
    { id: 1, name: "Tour", icon: "icon-destination" },
    { id: 2, name: "Hotel", icon: "icon-bed" },
    ...(modules.buses ? [{ id: 3, name: "Bus", icon: "icon-tickets" }] : []),
    ...(modules.cars ? [{ id: 4, name: "Car rental", icon: "icon-car" }] : []),
    ...(modules.bikes ? [{ id: 5, name: "Bike rental", icon: "icon-speedometer" }] : []),
  ],
  currentTab: "Tour",
};

export const findPlaceSlice = createSlice({
  name: "find-place",
  initialState,
  reducers: {
    addCurrentTab: (state, { payload }) => {
      state.currentTab = payload;
    },
  },
});

export const { addCurrentTab } = findPlaceSlice.actions;
export default findPlaceSlice.reducer;
