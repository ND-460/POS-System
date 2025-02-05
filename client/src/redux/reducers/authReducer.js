const initialState = {
  user: JSON.parse(localStorage.getItem("auth"))?.user || null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      localStorage.setItem("auth", JSON.stringify(action.payload));
      return { ...state, user: action.payload };

    case "LOGOUT_USER":
      localStorage.removeItem("auth"); // -Clear Local Storage
      return { ...state, user: null };

    default:
      return state;
  }
};

export default authReducer;
