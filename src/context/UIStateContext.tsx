import { createContext, useContext, type JSX } from "solid-js";
import { createStore } from "solid-js/store";
import type { AppUIState } from "../types/uiState";

const defaultState: AppUIState = {
  header: { title: "", visible: true },
  bottomNav: { tabs: [], visible: false },
  fab: { visible: false },
};

type UIStateContextType = [
  AppUIState,
  {
    setHeader: (data: Partial<AppUIState["header"]>) => void;
    setBottomNav: (data: Partial<AppUIState["bottomNav"]>) => void;
    setFab: (data: Partial<AppUIState["fab"]>) => void;
    reset: () => void;
  },
];

const UIStateContext = createContext<UIStateContextType>();

export function UIStateProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<AppUIState>(defaultState);

  const setHeader = (data: Partial<AppUIState["header"]>) =>
    setState("header", (prev) => ({ ...prev, ...data }));

  const setBottomNav = (data: Partial<AppUIState["bottomNav"]>) =>
    setState("bottomNav", (prev) => ({ ...prev, ...data }));

  const setFab = (data: Partial<AppUIState["fab"]>) =>
    setState("fab", (prev) => ({ ...prev, ...data }));

  const reset = () => setState(defaultState);

  return (
    <UIStateContext.Provider value={[state, { setHeader, setBottomNav, setFab, reset }]}>
      {props.children}
    </UIStateContext.Provider>
  );
}

export const useUIState = () => {
  const ctx = useContext(UIStateContext);
  if (!ctx) throw new Error("useUIState must be used within UIStateProvider");
  return ctx;
};
