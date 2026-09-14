"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

const DialogWithCheckbox = ({ open, onOpenChange, areas, onSearch }) => {
  const [selectedAreas, setSelectedAreas] = useState([]);

  // Handle checkbox selection
  const handleCheckboxChange = (areaValue) => {
    setSelectedAreas((prev) =>
      prev.includes(areaValue)
        ? prev.filter((item) => item !== areaValue)
        : [...prev, areaValue]
    );
  };

  // Handle Clear All
  const handleClearAll = () => {
    setSelectedAreas([]);
  };

  // Handle Search Button Click
  const handleSearch = () => {
    onSearch(selectedAreas); // Pass selected areas to parent
    onOpenChange(false); // Close the dialog
  };

  return (
    <Dialog
      open={open}
      onOpenChange={() => onOpenChange(false)}
      className="fixed inset-0 z-60 flex items-center justify-center w-screen h-screen"
    >
      <DialogContent className="w-full max-w-[95%] mx-auto bg-surface p-6 rounded-md">
        <DialogHeader>
          <div
            style={{ width: "101%" }}
            className="flex flex-col justify-center text-center"
          >
            <DialogTitle className="text-foreground md:text-2xl text-xl">Filter by Area</DialogTitle>
            <DialogDescription className="text-xs md:text-sm mb-1 mt-1 text-foreground">
              You can search your desired location jobs. Select one or
              multiple areas from the list below.
            </DialogDescription>
          </div>
        </DialogHeader>



        {/* Checkbox List */}
        <div className="grid lg:grid-cols-6 md:grid-cols-4 sm:grid-cols-2 grid-cols-1  mt-4 max-h-[300px] overflow-y-auto">
          {areas.map((area) => (
            <label
              key={area.value}
              className="group flex items-center space-x-3 cursor-pointer mb-2"
            >
              <input
                type="checkbox"
                className="hidden peer"
                value={area.value}
                checked={selectedAreas.includes(area.value)}
                onChange={() => handleCheckboxChange(area.value)}
              />

              <span
                className="relative w-4 h-4 flex justify-center items-center bg-neutral-100 border-2 border-accent rounded-md shadow-md transition-all duration-500 peer-checked:border-accent peer-checked:bg-accent peer-hover:scale-105"
              >
                <span
                  className="absolute inset-0 bg-gradient-to-br from-accent/30/30 to-accent/10 opacity-0 peer-checked:opacity-100 rounded-md transition-all duration-500 peer-checked:animate-pulse"
                ></span>

                <svg
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  className="hidden w-5 h-5 text-ink-inverse peer-checked:block transition-transform duration-500 transform scale-50 peer-checked:scale-100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </span>

              <span className="ml-2 text-ink-soft group-hover:text-accent font-medium transition-colors duration-300">
                {area.label}
              </span>
            </label>
          ))}
        </div>


        {/* Buttons for Select All and Clear All */}

        {/* Search Button */}
        <div className="mt-4 flex justify-between mb-0">
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-neutral-300 text-foreground rounded-lg hover:bg-primary hover:text-ink-inverse transition-all"
          >
            Clear All
          </button>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-primary hover:text-ink-inverse transition-all"
          >
            Apply
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogWithCheckbox;
