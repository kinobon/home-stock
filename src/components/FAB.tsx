import { Show, createSignal, onMount, type Component } from "solid-js";
import { useUIState } from "../context/UIStateContext";

const FAB: Component = () => {
  const [uiState] = useUIState();
  const fab = () => uiState.fab;

  // FABの位置をローカルストレージから読み込む
  const getInitialPosition = () => {
    const saved = localStorage.getItem("fab-position");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  };

  const initialPos = getInitialPosition();
  const [position, setPosition] = createSignal<{ x: number; y: number } | null>(initialPos);
  const [isDragging, setIsDragging] = createSignal(false);
  const [hasMoved, setHasMoved] = createSignal(false);
  const [dragStart, setDragStart] = createSignal<{
    x: number;
    y: number;
    startX: number;
    startY: number;
  } | null>(null);

  let buttonRef: HTMLButtonElement | undefined;

  onMount(() => {
    // 初期位置が保存されていない場合のデフォルト位置を設定
    if (!position() && buttonRef) {
      const rect = buttonRef.getBoundingClientRect();
      const x = window.innerWidth - rect.width - 24; // right-6 (24px)
      const y = window.innerHeight - rect.height - 64 - 16; // bottom nav + margin
      setPosition({ x, y });
    }
  });

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    setIsDragging(true);
    setHasMoved(false);
    const pos = position();
    setDragStart({
      x: touch.clientX,
      y: touch.clientY,
      startX: pos?.x ?? touch.clientX,
      startY: pos?.y ?? touch.clientY,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging()) return;

    e.preventDefault(); // 常にスクロールを防止

    const touch = e.touches[0];
    if (!touch) return;

    const start = dragStart();
    if (!start || !buttonRef) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    // 5px以上動いたらドラッグとみなす
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      setHasMoved(true);
    }

    const newX = start.startX + deltaX;
    const newY = start.startY + deltaY;

    // 画面外に出ないように制限
    const rect = buttonRef.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width;
    const maxY = window.innerHeight - rect.height;

    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));

    setPosition({ x: boundedX, y: boundedY });
  };

  const handleTouchEnd = () => {
    if (isDragging()) {
      setIsDragging(false);
      // 位置をローカルストレージに保存
      if (hasMoved()) {
        const pos = position();
        if (pos) {
          localStorage.setItem("fab-position", JSON.stringify(pos));
        }
      }
    }
  };

  const handleClick = (e: MouseEvent) => {
    // ドラッグ後はクリックイベントを無視
    if (hasMoved()) {
      e.preventDefault();
      setHasMoved(false);
      return;
    }
    fab().onClick?.();
  };

  const getStyle = () => {
    const pos = position();
    if (pos) {
      return {
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        right: "auto",
        bottom: "auto",
      };
    }
    return {
      right: "1.5rem",
      bottom: "calc(4rem + env(safe-area-inset-bottom) + 1rem)",
    };
  };

  return (
    <Show when={fab().visible}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        class={`fixed z-10 flex size-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg ${
          isDragging()
            ? "scale-110 shadow-2xl"
            : "hover:bg-blue-700 hover:shadow-xl active:scale-95"
        }`}
        style={{
          ...getStyle(),
          "touch-action": "none",
          transition: isDragging() ? "none" : "all 0.2s",
        }}
        aria-label="新規追加"
      >
        {fab().icon}
      </button>
    </Show>
  );
};

export default FAB;
