"use client";
import { useState } from "react";
import { TabProps } from "../Tab/Tab";

interface TabGroupProps {
  children: React.ReactElement<TabProps>[];
}

const TabGroup = ({ children }: TabGroupProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="shadow-md">
      <div className="flex gap-2">
        {children.map((child, index) => (
          <button
            key={`tab-${child.props.label}-${index}`}
            onClick={() => setActiveIndex(index)}
            className={`px-4 py-2 ${activeIndex === index ? "bg-neutral-800" : "bg-neutral-600"} text-white hover:bg-neutral-700 active:bg-neutral-500 cursor-pointer`}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      <div className="bg-neutral-800">{children[activeIndex]}</div>
    </div>
  );
};

export default TabGroup;
