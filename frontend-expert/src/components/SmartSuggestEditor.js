import React, { useState, useEffect } from "react";

const SuggestInput = ({ label, color, suggestions, selected, setSelected, defaultSuggestions = [], gripIcon }) => {
  const [input, setInput] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [show, setShow] = useState(false);
  const [customSuggestions, setCustomSuggestions] = useState([]);

  const isDiagnosis = label.toLowerCase() === "diagnosis";
  const isDiagnosisTest = label.toLowerCase().includes("diagnosis test");

  useEffect(() => {
    const storedCustomSuggestions = localStorage.getItem(`custom${label}`);
    if (storedCustomSuggestions) {
      setCustomSuggestions(JSON.parse(storedCustomSuggestions));
    }
  }, [label]);

  useEffect(() => {
    if (input.trim() === "") {
      setFiltered([]);
      setFiltered(defaultSuggestions);
      return;
    }
    // Combine default suggestions with custom suggestions
    const allSuggestions = [...suggestions, ...customSuggestions];
    const filteredSuggestions = allSuggestions.filter((s) => {
      const value =
        typeof s === "string"
          ? s
          : typeof s === "object" && s !== null
            ? s.name
            : "";

      return value.toLowerCase().includes(input.toLowerCase());
    });

    setFiltered(filteredSuggestions);
  }, [input, suggestions, customSuggestions]);

  const handleSelect = (item) => {
    const itemName = typeof item === "string" ? item : item.name;

    if (!selected.find((s) => s.name === itemName)) {
      setSelected([
        ...selected,
        {
          name: itemName,
          // since: "",
          // ...(isDiagnosis ? { temperature: "" } : { severity: "" }),
          // option: "",
          // ...(isDiagnosis ? { price: "" } : {}),
          ...(isDiagnosis && {
            temperature: "",
            option: "",
          }),
          // Symptoms / Complaints → severity
          ...(!isDiagnosis && !isDiagnosisTest && {
            severity: "",
            option: "",
          }),
        },
      ]);
    }

    setInput("");
    setShow(false);
  };

  const handleAddCustom = () => {
    if (input.trim() !== "") {
      // Add to selected items
      handleSelect(input.trim());

      // Update custom suggestions
      const newCustomSuggestions = [...customSuggestions, input.trim()];
      setCustomSuggestions(newCustomSuggestions);

      // Save to localStorage
      localStorage.setItem(
        `custom${label}`,
        JSON.stringify(newCustomSuggestions)
      );
    }
  };

  const handleDelete = (indexToRemove) => {
    setSelected(selected.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className='relative mb-6'>
      {/* Label */}
      <div className='section-header mb-2 flex items-center'>
        {gripIcon && (
          <div className="grip-icon-container flex items-center justify-center mr-2">
            {gripIcon}
          </div>
        )}
        {color && (
  <span
    className='mr-2 h-5 w-5 rounded-full'
    style={{ backgroundColor: color }}
  ></span>
)}

        <h3 className='text-md font-semibold'>{label}</h3>
      </div>

      {/* Selected rows */}
      <div className='mb-3 flex flex-col gap-2'>
        {selected.map((item, idx) => (
          <div
            key={idx}
            className='flex w-full items-center gap-2 rounded-md border border-gray-300 bg-white p-2'
          >
            {/* Name */}
            <div className='w-[150px] rounded-md border border-gray-400 bg-white px-3 py-1 text-sm font-medium'>
              {item.name}
            </div>

            {/* Since Dropdown */}
            {/* <select
              value={item.since}
              onChange={(e) => {
                const updated = [...selected];
                updated[idx].since = e.target.value;
                setSelected(updated);
              }}
              className='w-[100px] rounded-md border border-gray-300 px-2 py-1 text-sm'
            >
              <option value=''>Since</option>
              <option value='1 hour'>1 hour</option>
              <option value='1 day'>1 day</option>
              <option value='1 week'>1 week</option>
              <option value='1 month'>1 month</option>
              <option value='1 year'>1 year</option>
            </select> */}

            {/* Conditional Field: Severity or Body Temperature */}
            {isDiagnosis && (
              <input
                type='text'
                placeholder='Temp (°F)'
                value={item.temperature}
                onChange={(e) => {
                  const updated = [...selected];
                  updated[idx].temperature = e.target.value;
                  setSelected(updated);
                }}
                className='w-[100px] rounded-md border border-gray-300 px-2 py-1 text-sm'
              />
            )
            // : (
            //   <select
            //     value={item.severity}
            //     onChange={(e) => {
            //       const updated = [...selected];
            //       updated[idx].severity = e.target.value;
            //       setSelected(updated);
            //     }}
            //     className='w-[100px] rounded-md border border-gray-300 px-2 py-1 text-sm'
            //   >
            //     <option value=''>Severity</option>
            //     <option value='Severe'>Severe</option>
            //     <option value='Moderate'>Moderate</option>
            //     <option value='Mild'>Mild</option>
            //   </select>
            // )}

            // {/* More Options Dropdown */}
           /* {/* {isDiagnosis && (
              <select
                className='w-[130px] rounded-md border border-gray-300 px-2 py-1 text-sm'
                value={item.option}
                onChange={(e) => {
                  const updated = [...selected];
                  updated[idx].option = e.target.value;
                  setSelected(updated);
                }}
              >
                <option value=''>MORE OPTIONS</option>
                <option value='Option 1'>Option 1</option>
                <option value='Option 2'>Option 2</option>
              </select>
            )} */}

            {/* Diagnosis → Temperature */}


            {/* Diagnosis → Options */}
            {isDiagnosis && (
              <select
                className='w-[130px] rounded-md border border-gray-300 px-2 py-1 text-sm'
                value={item.option || ""}
                onChange={(e) => {
                  const updated = [...selected];
                  updated[idx].option = e.target.value;
                  setSelected(updated);
                }}
              >
                <option value=''>MORE OPTIONS</option>
                <option value='Option 1'>Option 1</option>
                <option value='Option 2'>Option 2</option>
              </select>
            )}

            {/* Symptoms / Complaints → Severity */}
            {!isDiagnosis && !isDiagnosisTest && (
              <select
                value={item.severity || ""}
                onChange={(e) => {
                  const updated = [...selected];
                  updated[idx].severity = e.target.value;
                  setSelected(updated);
                }}
                className='w-[100px] rounded-md border border-gray-300 px-2 py-1 text-sm'
              >
                <option value=''>Severity</option>
                <option value='Severe'>Severe</option>
                <option value='Moderate'>Moderate</option>
                <option value='Mild'>Mild</option>
              </select>
            )}



            {/* {isDiagnosis && (
              <input
                type='text'
                placeholder='Enter price'
                value={item.price}
                onChange={(e) => {
                  const updated = [...selected];
                  updated[idx].price = e.target.value;
                  setSelected(updated);
                }}
                className='w-[100px] rounded-md border border-gray-300 px-2 py-1 text-sm'
              />
            )} */}

            {/* Delete Button */}
            <button
              onClick={() => handleDelete(idx)}
              className='ml-1 text-sm text-red-500 hover:text-red-700'
              title='Delete'
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {/* Input field */}
      <input
        type='text'
        placeholder={`Start typing ${label}`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        className='w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm'
      />

      {/* Suggestions */}
      {show && (
        <div className='absolute z-10 mt-1 flex w-full flex-col rounded-md border border-gray-300 bg-white p-2 shadow'>
          {filtered.map((item, index) => (
            <div
              key={index}
              className='mb-1 cursor-pointer rounded-md bg-gray-200 px-4 py-1 text-sm transition hover:bg-gray-300'
              onMouseDown={() => handleSelect(item)}
            >
              {typeof item === "string" ? item : item.name}
            </div>
          ))}

          {input && ![...suggestions, ...customSuggestions].includes(input) && (
            <div
              className='cursor-pointer rounded-md bg-blue-100 px-4 py-1 text-sm transition hover:bg-blue-200'
              onMouseDown={handleAddCustom}
            >
              + Add "{input}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestInput;
