import { List } from "@raycast/api";

import { TimerType, TimerStateEnum } from "./types";

import { useTimers } from "./hooks";

import { Timer } from "./components";

export default function Command() {
  const { isLoading, filter, filteredTimers, setState } = useTimers();

  const handleChangeFilter = (value: TimerStateEnum) => {
    setState((prevState) => ({ ...prevState, filter: value }));
  };

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by State"
          value={filter}
          onChange={(newValue) =>
            handleChangeFilter(newValue as TimerStateEnum)
          }
        >
          {Object.values(TimerStateEnum).map((value) => (
            <List.Dropdown.Item key={value} title={value} value={value} />
          ))}
        </List.Dropdown>
      }
      isLoading={isLoading}
      isShowingDetail
    >
      {filteredTimers.map((timer: TimerType) => (
        <Timer key={timer.id} timer={timer} />
      ))}
    </List>
  );
}
