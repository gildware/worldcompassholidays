import { createSlice } from "@reduxjs/toolkit";
import { modules } from "@/config/modules";

const initialState = {
  tabs: [
    { id: 1, name: "Tour", icon: "icon-destination" },
    { id: 2, name: "Hotel", icon: "icon-bed" },
    ...(modules.buses ? [{ id: 3, name: "Bus", icon: "icon-tickets" }] : []),
    { id: 4, name: "Car bike rental", icon: "icon-car" },
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
