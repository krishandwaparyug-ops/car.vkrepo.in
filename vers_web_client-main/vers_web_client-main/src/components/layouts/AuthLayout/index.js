import React from "react";
import Views from "../../../views";

const AuthLayout = (props) => {
  return (
    <div className="auth-shell flex flex-auto flex-col h-[100vh]">
      <Views {...props} />
    </div>
  );
};

export default AuthLayout;
