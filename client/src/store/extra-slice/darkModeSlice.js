import { createSlice } from '@reduxjs/toolkit';

const loadDarkModeFromLocalStorage = () => {
  const savedMode = localStorage.getItem('darkMode');
  return savedMode === 'true' ? true : false;
};

const initialState = {
  darkMode: loadDarkModeFromLocalStorage(),
};

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState,
  reducers: {
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;

      localStorage.setItem('darkMode', state.darkMode);
    },
  },
});

export const { toggleDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
