import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

const CustomContextMenu = ({
  children,
  options = [],
  colIndex,
  rowIndex,
}) => {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (event) => {
      // Hide menu if clicking outside of it
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setVisible(false);
      }
    };

    // Use mousedown and contextmenu to catch clicks immediately
    if (visible) {
      document.addEventListener("mousedown", handleOutside);
      document.addEventListener("contextmenu", handleOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("contextmenu", handleOutside);
    };
  }, [visible]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent multiple menus from opening
    setVisible(true);
    setPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div onContextMenu={handleContextMenu} className="h-full w-full">
      {children}
      {visible && createPortal(
        <div
          ref={menuRef}
          className="fixed bg-white border border-gray-200 rounded-md shadow-lg z-[99999] py-1 min-w-[150px]"
          style={{ top: position.y, left: position.x }}
          onContextMenu={(e) => e.preventDefault()} // Prevent right clicking the menu itself
        >
          {options.map((menu, index) => (
            <div
              key={menu.name}
              className={`px-4 py-2 text-sm font-medium ${
                menu.disabled
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-800 hover:bg-blue-50 cursor-pointer"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!menu.disabled) {
                  menu?.onclick({ menu, optionIndex: index, rowIndex, colIndex });
                  setVisible(false);
                }
              }}
            >
              {menu.name}
            </div>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomContextMenu;
