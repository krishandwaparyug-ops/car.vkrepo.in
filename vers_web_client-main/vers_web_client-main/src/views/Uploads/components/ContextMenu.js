import React, { useState } from "react";
import {
  ContextMenuTrigger,
  ContextMenu,
  ContextMenuItem,
} from "rctx-contextmenu";

const CustomContextMenu = ({
  children,
  options = [],
  colIndex,
  rowIndex,
  onDeleteData,
}) => {
  const [id] = useState(
    `${colIndex}${rowIndex}${Math.random()}${new Date().getMilliseconds()}`
  );
  return (
    <>
      <ContextMenuTrigger id={`context-menu-${id}`} className="h-full">
        {children}
      </ContextMenuTrigger>
      <ContextMenu
        hideOnLeave={true}
        id={`context-menu-${id}`}
        className="!shadow-sm !p-0"
        appendTo="body"
      >
        {options.map((menu, index) => {
          return (
            <ContextMenuItem
              disabled={menu?.disabled || false}
              preventClose={true}
              disableWhileShiftPressed={true}
              key={menu.name}
              onClick={() => {
                menu?.onclick({ menu, optionIndex: index, rowIndex, colIndex });
              }}
              className="!p-1 !ps-3 !cursor-default hover:bg-slate-50"
            >
              {menu.name}
            </ContextMenuItem>
          );
        })}
      </ContextMenu>
    </>
  );
};

export default CustomContextMenu;
