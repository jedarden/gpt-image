## Prompt [LS4_1]

### Context
The codebase currently contains duplicate declarations of the `ImageModalProps` interface in [`frontend/components/ChatArea.tsx`](frontend/components/ChatArea.tsx), leading to potential type conflicts and maintainability issues.

### Objective
Eliminate redundant type/interface declarations and ensure a single, comprehensive definition for `ImageModalProps`.

### Focus Areas
- Remove duplicate interface declarations
- Consolidate all required properties into one interface
- Refactor usages to rely on the unified type

### Code Reference
```typescript
// First declaration
interface ImageModalProps {
  image: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}
// Second declaration (adds mask and onMaskChange)
interface ImageModalProps {
  image: string;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  mask?: string | null;
  onMaskChange?: (mask: string | null) => void;
}
```

### Requirements
- Only one `ImageModalProps` interface should exist
- All usages must be updated to use the unified interface
- Remove any dead or unused type declarations

### Expected Improvements
- Improved type safety and maintainability
- Reduced risk of type conflicts
- Cleaner, more understandable code

---

## Prompt [LS4_2]

### Context
The `useEffect` in [`frontend/App.tsx`](frontend/App.tsx) writes the entire sessions array to localStorage on every change, causing unnecessary writes and potential performance issues.

### Objective
Optimize localStorage writes and state persistence to minimize performance impact.

### Focus Areas
- Debounce or batch localStorage writes
- Only persist when meaningful changes occur
- Consider a custom hook for persistence logic

### Code Reference
```typescript
useEffect(() => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sessions));
}, [sessions]);
```

### Requirements
- Reduce frequency of localStorage writes
- Ensure no data loss or regression in session persistence
- Add tests for persistence logic

### Expected Improvements
- Improved frontend performance
- Lower resource usage on state changes
- More robust and maintainable persistence logic

---

## Prompt [LS4_3]

### Context
The `MaskEditor` overlays the mask directly on the image canvas, making mask separation, advanced editing, and exporting difficult.

### Objective
Refactor `MaskEditor` to achieve true mask layer separation and improve maintainability.

### Focus Areas
- Use separate canvases for image and mask overlay
- Ensure mask can be manipulated independently
- Facilitate robust exporting of mask and image

### Code Reference
```typescript
// Draw image as background, then overlay blue mask directly on same canvas
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
ctx.globalAlpha = 0.4;
ctx.fillStyle = "#00f";
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

### Requirements
- Implement two-canvas architecture
- Update all mask editing and exporting logic
- Add tests for mask separation and export

### Expected Improvements
- Easier mask manipulation and export
- Cleaner, more maintainable code
- Foundation for advanced mask features

---

## Prompt [LS4_4]

### Context
Mask submission and user feedback in `ChatArea` are incomplete; mask data is only sent if `maskEdited` is true, and the UI suggests mask editing is not fully supported.

### Objective
Improve mask submission workflow and user feedback in `ChatArea`.

### Focus Areas
- Ensure mask data is reliably submitted with prompts
- Clarify mask editing state and feedback in the UI
- Remove or update "mask editing coming soon" messaging

### Code Reference
```typescript
mask: maskEdited ? modalMask : undefined,
...
<div style={{ marginBottom: 12, fontWeight: 500, color: "#444" }}>
  mask editing coming soon
</div>
```

### Requirements
- Robust mask submission logic
- Clear, accurate user feedback on mask editing status
- Tests for mask submission and UI feedback

### Expected Improvements
- More reliable mask editing and submission
- Improved user experience and clarity
- Elimination of incomplete or misleading UI elements

---

## Prompt [LS4_5]

### Context
Accessibility and focus management are inconsistent across custom elements in `Sidebar`, `ChatArea`, and `MaskEditor`, with some ARIA roles and keyboard navigation present but incomplete.

### Objective
Enhance accessibility and focus management throughout the frontend.

### Focus Areas
- Ensure all interactive elements have correct ARIA roles
- Implement robust keyboard navigation and focus management
- Test with screen readers and keyboard-only navigation

### Code Reference
```typescript
<li
  tabIndex={0}
  aria-current={session.id === currentSessionId}
  onClick={() => onSelectSession(session.id)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") onSelectSession(session.id);
  }}
>
  {session.name}
</li>
```

### Requirements
- Use appropriate ARIA roles (e.g., `role="option"`)
- Move focus to modals when opened, return when closed
- Add or update tests for accessibility and focus

### Expected Improvements
- Higher accessibility scores
- Better experience for keyboard and screen reader users
- Compliance with accessibility standards

---

## Prompt [LS4_6]

### Context
Performance and maintainability can be further improved by debouncing, memoization, code-splitting, and reducing inline styles.

### Objective
Optimize performance and maintainability across the frontend codebase.

### Focus Areas
- Debounce or batch expensive operations
- Memoize derived state and computations
- Use React.lazy and Suspense for large components
- Minimize inline styles in favor of CSS classes

### Code Reference
```typescript
// Example: expensive computation or inline style usage
const derived = computeExpensive(sessions);
<div style={{ marginBottom: 12 }}>{content}</div>
```

### Requirements
- Identify and optimize performance bottlenecks
- Refactor to use memoization and code-splitting where appropriate
- Replace inline styles with CSS classes

### Expected Improvements
- Faster UI responsiveness
- Lower resource usage
- More maintainable and scalable codebase