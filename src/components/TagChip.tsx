import { Show, splitProps, type Accessor, type Component } from "solid-js";
import { Check } from "lucide-solid";
import type { JSX } from "solid-js";

type TagButtonVariant = "filter" | "select";

interface TagButtonProps
  extends Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class" | "children" | "type"> {
  label: string;
  variant?: TagButtonVariant;
  active?: boolean | Accessor<boolean>;
  showCheck?: boolean;
  class?: string;
  type?: JSX.ButtonHTMLAttributes<HTMLButtonElement>["type"];
}

const variantStyles: Record<
  TagButtonVariant,
  { base: string; active: string; inactive: string; showCheck: boolean }
> = {
  filter: {
    base: "flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none",
    active: "border-blue-600 bg-blue-100 text-blue-800 shadow-inner",
    inactive: "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:text-blue-700",
    showCheck: true,
  },
  select: {
    base: "rounded-full border px-3 py-1 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
    active: "border-blue-200 bg-blue-100 text-blue-700",
    inactive: "border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:text-blue-600",
    showCheck: false,
  },
};

export const TagButton: Component<TagButtonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "label",
    "variant",
    "active",
    "showCheck",
    "class",
    "type",
  ]);

  const variant = () => local.variant ?? "filter";
  const styles = () => variantStyles[variant()];
  const isActive = () => {
    const value = local.active;
    if (typeof value === "function") {
      return (value as Accessor<boolean>)();
    }
    return Boolean(value);
  };
  const shouldShowCheck = () => local.showCheck ?? styles().showCheck;

  return (
    <button
      type={local.type ?? "button"}
      class={`${styles().base} ${isActive() ? styles().active : styles().inactive} ${
        local.class ?? ""
      }`.trim()}
      aria-pressed={isActive() ? "true" : "false"}
      data-active={isActive() ? "true" : "false"}
      {...others}
    >
      <Show when={shouldShowCheck() && isActive()}>
        <Check size={14} />
      </Show>
      {local.label}
    </button>
  );
};

interface TagBadgeProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "class" | "children"> {
  label: string;
  class?: string;
}

export const TagBadge: Component<TagBadgeProps> = (props) => {
  const [local, others] = splitProps(props, ["label", "class"]);

  return (
    <span
      class={`rounded-full bg-blue-50 px-2 py-0.5 text-[0.65rem] font-medium text-blue-600 ${
        local.class ?? ""
      }`.trim()}
      {...others}
    >
      {local.label}
    </span>
  );
};

export default TagButton;
