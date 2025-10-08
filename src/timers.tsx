import { List } from "@raycast/api";

import { TimerType, TimerStateEnum } from "./types";

import { useTimers, useDetailToggle } from "./hooks";

import { Timer } from "./components";

export default function Command() {
  const { isLoading, filter, filteredTimers, setFilter } = useTimers();
  const { isShowingDetail, toggleDetail } = useDetailToggle(false);

  return (
    <List
      searchBarAccessory={
        <List.Dropdown
          tooltip="Filter by State"
          value={filter}
          onChange={(newValue) => setFilter(newValue as TimerStateEnum)}
        >
          {Object.entries(TimerStateEnum).map(([key, value]) => (
            <List.Dropdown.Item key={key} title={key} value={value} />
          ))}
        </List.Dropdown>
      }
      isLoading={isLoading}
      isShowingDetail={isShowingDetail}
    >
      {filteredTimers.map((timer: TimerType) => (
        <Timer
          key={timer.id}
          timer={timer}
          isShowingDetail={isShowingDetail}
          onToggleDetail={toggleDetail}
        />
      ))}
    </List>
  );
}
