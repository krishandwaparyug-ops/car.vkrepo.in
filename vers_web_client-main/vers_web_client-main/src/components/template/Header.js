import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import useAuth from "./../../utils/hooks/useAuth";

const Header = (props) => {
  const { headerStart, headerEnd } = props;
  const { signOut } = useAuth();
  return (
    <header className="h-10 px-2 bg-blue-500 mb-2 flex justify-between">
      <div className="h-full">
        <div className="header-action header-action-start">{headerStart}</div>
        <ul className="flex h-full items-center justify-center gap-3 m-0 p-0 text-md font-semibold">
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/"
            >
              HOME
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/upload"
            >
              UPLOAD
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/office"
            >
              OFFICE
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/vehicles"
            >
              SEARCH
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/user"
            >
              USER
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/file-info"
            >
              FILE INFO
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/details"
            >
              DETAILS
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/code"
            >
              CODE & DEVICE ID
            </Link>
          </li>
          <li>
            <Link
              className="cursor-pointer p-2 pe-3 ps-3 bg-gray-50 rounded-sm hover:bg-gray-300"
              to="/testing"
            >
              TEST APIs
            </Link>
          </li>
        </ul>
        <div className="header-action header-action-end">{headerEnd}</div>
      </div>
      <button
        className="h-full cursor-pointer px-2 bg-red-500 rounded-sm text-white hover:bg-red-400"
        onClick={signOut}
      >
        OUT
      </button>
    </header>
  );
};

Header.propTypes = {
  headerStart: PropTypes.node,
  headerEnd: PropTypes.node,
  container: PropTypes.bool,
};

export default Header;
