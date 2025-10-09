import type { JSX } from "solid-js";

export interface AppUIState {
  header: {
    title: string;
    shortTitle?: string;
    customContent?: JSX.Element;
    visible: boolean;
  };
  bottomNav: {
    tabs: Array<{
      key: string;
      label: string;
      icon?: JSX.Element;
      onClick?: () => void;
    }>;
    currentTabKey?: string; // 現在選択中のタブ
    visible: boolean;
  };
  fab: {
    icon?: JSX.Element;
    onClick?: () => void;
    visible: boolean;
  };
}
