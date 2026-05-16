import { renderHook, act } from "@testing-library/react";
import useDetailToggle from "../hooks/useDetailToggle";

describe("useDetailToggle", () => {
  it("defaults to false", () => {
    const { result } = renderHook(() => useDetailToggle());
    expect(result.current.isShowingDetail).toBe(false);
  });

  it("respects initialState", () => {
    const { result } = renderHook(() => useDetailToggle(true));
    expect(result.current.isShowingDetail).toBe(true);
  });

  it("toggles from false to true", () => {
    const { result } = renderHook(() => useDetailToggle());
    act(() => result.current.toggleDetail());
    expect(result.current.isShowingDetail).toBe(true);
  });

  it("toggles back to false on second call", () => {
    const { result } = renderHook(() => useDetailToggle());
    act(() => result.current.toggleDetail());
    act(() => result.current.toggleDetail());
    expect(result.current.isShowingDetail).toBe(false);
  });
});
