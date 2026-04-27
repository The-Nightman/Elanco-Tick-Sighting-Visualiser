"use client";

interface TimeControlsProps {
  ariaDataName: string;
  radioGroupName: string;
  state: {
    period: string;
    selectedYear: number;
  };
  setState: React.Dispatch<
    React.SetStateAction<{
      period: string;
      selectedYear: number;
    }>
  >;
}

const TimeControls = ({
  ariaDataName,
  radioGroupName,
  state,
  setState,
}: TimeControlsProps) => {
  return (
    <form id="w-fit map-controls" className="text-white">
      <fieldset className="flex flex-col text-lg gap-4">
        <div className="flex gap-[0.1rem]">
          <div className="group">
            <div className="flex h-8 px-2 items-center justify-center bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none rounded-l-md">
              <input
                type="radio"
                name={radioGroupName}
                id="periodThisYear"
                aria-label={`${ariaDataName} data from the current year`}
                className="peer hidden"
                checked={state.period === "currentYear"}
                onChange={() =>
                  setState({
                    selectedYear: new Date().getFullYear(),
                    period: "currentYear",
                  })
                }
              />
              <label htmlFor="periodThisYear" className="block cursor-pointer">
                This Year
              </label>
            </div>
          </div>
          <div className="group w-max">
            <select
              name="year select"
              id="yearSelect"
              className={`peer h-8 px-2 ${state.period === "selectedYear" ? "bg-sky-600" : "bg-neutral-600"} text-white p-1 disabled:cursor-not-allowed disabled:opacity-50`}
              aria-label={`${ariaDataName} data from a specific year`}
              aria-description="Please select a year to view"
              value={state.selectedYear}
              onClick={() => {
                setState({
                  ...state,
                  period: "selectedYear",
                });
              }}
              onChange={(e) =>
                setState({
                  period: "selectedYear",
                  selectedYear: parseInt(e.target.value, 10),
                })
              }
            >
              {Array.from(
                { length: new Date().getFullYear() - 2000 + 1 },
                (_, i) => new Date().getFullYear() - i,
              ).map((year) => (
                <option key={year} value={year} className="bg-neutral-600">
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className="group">
            <div className="flex h-8 px-2 items-center justify-center bg-neutral-600 group-[&:has(input:checked)]:bg-sky-600 text-center cursor-pointer select-none rounded-r-md">
              <input
                type="radio"
                name={radioGroupName}
                id="periodMax"
                aria-label={`${ariaDataName} data from Lifetime`}
                className="peer hidden"
                checked={state.period === "max"}
                onChange={() => setState({ ...state, period: "max" })}
              />
              <label htmlFor="periodMax" className="block cursor-pointer">
                Max
              </label>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default TimeControls;
