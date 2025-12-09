import React from "react";
import Views from "../../../views";

const AuthLayout = (props) => {
  return (
    <div className="flex flex-auto flex-col h-[100vh]">
      <Views {...props} />
    </div>
  );
};

export default AuthLayout;
