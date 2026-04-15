import React from "react";
import PropTypes from "prop-types";

const ThreeDotLoader = ({ label = "Loading" }) => {
  return (
    <div className="vk-loader-wrap" role="status" aria-live="polite" aria-label={label}>
      <span className="vk-loader-dot" />
      <span className="vk-loader-dot" />
      <span className="vk-loader-dot" />
    </div>
  );
};

ThreeDotLoader.propTypes = {
  label: PropTypes.string,
};

export default ThreeDotLoader;