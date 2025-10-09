import { createContext, useContext, type JSX } from "solid-js";
import { createStore } from "solid-js/store";
import type { AppUIState } from "../types/uiState";

const defaultState: AppUIState = {
  header: { title: "", visible: true },
  bottomNav: { tabs: [], visible: false },
  fab: { visible: false },
};

type SetterFn<T> = T | ((prev: T) => T);

type UIStateContextType = [
  AppUIState,
  {
    setHeader: (data: SetterFn<Partial<AppUIState["header"]>>) => void;
    setBottomNav: (data: SetterFn<Partial<AppUIState["bottomNav"]>>) => void;
    setFab: (data: SetterFn<Partial<AppUIState["fab"]>>) => void;
    reset: () => void;
  },
];

const UIStateContext = createContext<UIStateContextType>();

export function UIStateProvider(props: { children: JSX.Element }) {
  const [state, setState] = createStore<AppUIState>(defaultState);

  const setHeader = (data: SetterFn<Partial<AppUIState["header"]>>) =>
    setState("header", (prev) => {
      if (typeof data === "function") {
        // コールバック形式: 前の状態を使って更新
        const updates = data(prev);
        return { ...prev, ...updates };
      } else {
        // オブジェクト形式: 含まれないプロパティはundefinedに
        return {
          title: data.title ?? prev.title,
          shortTitle: data.shortTitle,
          customContent: data.customContent,
          visible: data.visible ?? prev.visible,
        };
      }
    });

  const setBottomNav = (data: SetterFn<Partial<AppUIState["bottomNav"]>>) =>
    setState("bottomNav", (prev) => {
      if (typeof data === "function") {
        const updates = data(prev);
        return { ...prev, ...updates };
      } else {
        return {
          tabs: data.tabs ?? prev.tabs,
          visible: data.visible ?? prev.visible,
        };
      }
    });

  const setFab = (data: SetterFn<Partial<AppUIState["fab"]>>) =>
    setState("fab", (prev) => {
      if (typeof data === "function") {
        const updates = data(prev);
        return { ...prev, ...updates };
      } else {
        return {
          icon: data.icon,
          onClick: data.onClick,
          visible: data.visible ?? prev.visible,
        };
      }
    });

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
