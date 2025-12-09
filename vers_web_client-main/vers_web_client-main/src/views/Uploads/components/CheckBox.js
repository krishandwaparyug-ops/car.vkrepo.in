import React, { memo } from "react";
import CustomContextMenu from "./ContextMenu";

const CheckBox = () => {
  return (
    <CustomContextMenu>
      <input autoComplete="off" type="checkbox" checked></input>
    </CustomContextMenu>
  );
};

export default memo(CheckBox);
