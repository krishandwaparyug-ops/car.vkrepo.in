import React, { cloneElement } from "react";

const Simple = ({ children, ...rest }) => {
  return (
    <div className="h-full">
      <div className="text-center">
        {children
          ? cloneElement(children, {
              contentClassName: "text-center",
              ...rest,
            })
          : null}
      </div>
    </div>
  );
};

export default Simple;
