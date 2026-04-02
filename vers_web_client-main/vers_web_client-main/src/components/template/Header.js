import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import useAuth from "./../../utils/hooks/useAuth";

const Header = (props) => {
  const { headerStart, headerEnd } = props;
  const { signOut } = useAuth();

  const links = [
    { to: "/", label: "Home" },
    { to: "/upload", label: "Upload" },
    { to: "/office", label: "Office" },
    { to: "/vehicles", label: "Search" },
    { to: "/user", label: "User" },
    { to: "/file-info", label: "File Info" },
    { to: "/details", label: "Details" },
    { to: "/code", label: "Code & Device ID" },
    { to: "/testing", label: "Test APIs" },
  ];

  return (
    <header className="mb-3 rounded-2xl border border-[#dbe5f4] bg-white/90 px-3 py-2 shadow-[0_14px_32px_rgba(17,34,64,0.1)] backdrop-blur-sm">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center justify-between gap-3">
          <div className="brand-heading text-[17px] font-semibold text-[#1d3f72]">
            Kartika Control Center
          </div>
          <div className="header-action header-action-start">{headerStart}</div>
        </div>

        <ul className="m-0 flex flex-wrap items-center gap-2 p-0 text-[13px] font-semibold text-[#1a365f]">
          {links.map((item) => (
            <li key={item.to}>
              <NavLink
                className={({ isActive }) =>
                  `inline-flex min-h-[34px] items-center rounded-lg border px-3 py-1.5 transition ${
                    isActive
                      ? "border-[#1f6feb] bg-[#1f6feb] text-white shadow-[0_8px_18px_rgba(31,111,235,0.25)]"
                      : "border-[#d6e2f4] bg-[#f9fbff] text-[#1b3558] hover:bg-[#eef4ff]"
                  }`
                }
                to={item.to}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-end gap-2">
          <div className="header-action header-action-end">{headerEnd}</div>
          <button
            className="min-h-[34px] cursor-pointer border border-[#f5c2c2] bg-[#fff1f1] px-3 text-sm font-semibold text-[#b42318] hover:bg-[#ffe3e3]"
            onClick={signOut}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  headerStart: PropTypes.node,
  headerEnd: PropTypes.node,
  container: PropTypes.bool,
};

export default Header;
