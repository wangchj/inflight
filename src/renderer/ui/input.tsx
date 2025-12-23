import { Text } from '@mantine/core';
import { nanoid } from '@reduxjs/toolkit';
import { encode } from 'html-entities';
import { FormEvent, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "renderer/redux/store";
import { uiSlice } from "renderer/redux/ui-slice";
import { get } from 'renderer/utils/env';
import './input.css';

interface InputProps {
  label?: string;
  descr?: string;
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}

interface History {
  /**
   * The input text value
   */
  value: string;

  /**
   * The caret position
   */
  caret: number;
}

/**
 * Max number history entries.
 */
const historyMax = 50;

export default function Input({label, descr, value, onChange} : InputProps): React.ReactElement {
  /**
   * The history stack.
   */
  const historyRef = useRef<History[]>([]);

  /**
   * The index of the current state on the history stack.
   */
  const historyIndexRef = useRef<number>(-1);

  /**
   * The milliseconds timestamp of when the value last changed. This is used to determine if a new
   * history entry should be created.
   */
  const changeTimeRef = useRef<number>(0);

  /**
   * The reference to the contenteditable element.
   */
  const edRef = useRef<HTMLDivElement>(null);

  /**
   * Determines if this input has the focus.
   */
  const focusedRef = useRef<boolean>(false);

  /**
   * React redux dispatch function.
   */
  const dispatch = useDispatch();

  /**
   * Timeout for mouse over delay.
   */
  const mouseOverTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * Timeout for mouse leave delay.
   */
  const mouseLeaveTimeoutRef = useRef<NodeJS.Timeout>();

  /**
   * The environment combine() operation count. When this updates, the variables needs to be
   * re-rendered.
   */
  const envCombineCount = useSelector((state: RootState) => state.ui).envCombineCount;

  /**
   * Renders contenteditable content when the value changes.
   */
  useEffect(() => {
    if (!edRef.current) {
      return;
    }

    updateHistory(value);

    render();
  }, [value, envCombineCount]);

  /**
   * Handles contenteditable input event.
   *
   * @param event The event object.
   */
  function onInput(event: FormEvent) {
    const target = event.target as HTMLDivElement;

    // Remove \n fixes the issue that backspace leaves a \n when all characters are removed.
    const text = target.innerText.replace('\n', '');

    if (onChange) {
      onChange(text);
    }
  }

  /**
   * Updates the history for input value change.
   *
   * @param value The new input value.
   */
  function updateHistory(value: string) {
    let history = historyRef.current;
    let historyIndex = historyIndexRef.current;
    let changeTime = changeTimeRef.current;

    // If value didn't change we don't need to update history.
    if (history.length > 0 && history[historyIndex].value === value) {
      return;
    }

    // If history index is not the top of the history stack, remove entries after the index.
    if (historyIndex < history.length - 1) {
      history.splice(historyIndex + 1);
    }

    const now = Date.now();

    if (history.length === 0 || now - changeTime > 500) {
      // Check history max entries
      if (history.length === historyMax) {
        history.shift();
      }

      history.push({
        value: value ?? '',
        caret: value ? getCaretCharacterOffset() : 0
      });

      historyIndexRef.current = history.length - 1;
    }
    else {
      const entry = history[history.length - 1];
      entry.value = value ?? '';
      entry.caret = value ? getCaretCharacterOffset() : 0;
    }

    changeTimeRef.current = now;
  }

  /**
   * Renders content-editable content elements.
   */
  function render() {
    if (!edRef.current) {
      return;
    }

    const history = historyRef.current;
    const index = historyIndexRef.current;
    const state = history[index];

    const element = edRef.current as HTMLElement;
    const nodes = highlightVariables(state.value);
    element.replaceChildren(...nodes);

    if (focusedRef.current) {
      setCaretCharacterOffset(state.caret);
    }
  }

  /**
   * Create editor DOM nodes containing variable highlights.
   *
   * @param text The text for which variable are highlighted.
   * @returns A list of DOM nodes.
   */
  function highlightVariables(text: string): Node[] {
    if (!text) {
      return [document.createTextNode('')];
    }

    /** Result nodes. */
    const res = [];

    // Regular expression to find text between {{ and }}
    const regex = /\{\{([^}]+)\}\}/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    // Iterate through all matches
    while ((match = regex.exec(text)) !== null) {
      // Create leading text node.
      if (match.index > lastIndex) {
        res.push(
          document.createTextNode(text.substring(lastIndex, match.index))
        );
      }

      // Create the variable node
      const node = document.createElement('span');
      node.id = `i${nanoid()}`;
      node.className = `input-var ${get(match[1]) ? 'input-var-blue' : 'input-var-red'}`;
      node.innerText = encode(match[0]);
      node.onmouseover = () => onMouseOver(node);
      node.onmouseleave = () => onMouseLeave();
      res.push(node);

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      res.push(document.createTextNode(text.substring(lastIndex)));
    }

    return res;
  }

  /**
   * Gets the current caret position (0-based) of the editor.
   *
   * @returns The caret position.
   */
  function getCaretCharacterOffset(): number {
    let caretOffset = 0;
    let sel = window.getSelection();

    if (sel.rangeCount > 0) {
      const range = window.getSelection().getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(edRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }

    return caretOffset;
  }

  /**
   * Set the caret position of the editor.
   *
   * @param offset The position.
   */
  function setCaretCharacterOffset(offset: number) {
    const element = edRef.current;
    const range = document.createRange();
    const sel = window.getSelection();
    let currentOffset = 0;
    let found = false;

    // Traverse the DOM to find the text node and offset corresponding to the character offset
    function traverseNodes(node: Node) {
      if (found) return; // Stop if the position is found

      if (node.nodeType === Node.TEXT_NODE) {
        const nodeLength = node.nodeValue.length;
        if (currentOffset + nodeLength >= offset) {
          range.setStart(node, offset - currentOffset);
          range.collapse(true); // Collapse the range to a single point (cursor)
          found = true;
          return;
        }
        currentOffset += nodeLength;
      } else if (node.nodeType === Node.ELEMENT_NODE && node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          traverseNodes(node.childNodes[i]);
          if (found) return;
        }
      }
    }

    traverseNodes(element);

    // If the offset is beyond the content, place the cursor at the end
    if (!found) {
      range.selectNodeContents(element);
      range.collapse(false); // Collapse to the end
    }

    sel.removeAllRanges();
    sel.addRange(range);
  }

  /**
   * Handles the event when the mouse is over a variable.
   */
  function onMouseOver(node: HTMLElement) {
    clearTimeout(mouseLeaveTimeoutRef.current);
    clearTimeout(mouseOverTimeoutRef.current);

    mouseOverTimeoutRef.current = setTimeout(() => {
      const id = node.id;
      const text = node.innerText;
      const name = text.substring(2, text.length - 2);
      dispatch(uiSlice.actions.showVarTooltip({id, name}));
    }, 500);


  }

  /**
   * Handles the event when the mouse leaves a variable.
   */
  function onMouseLeave() {
    clearTimeout(mouseOverTimeoutRef.current);
    clearTimeout(mouseLeaveTimeoutRef.current);

    mouseLeaveTimeoutRef.current = setTimeout(() => {
      dispatch(uiSlice.actions.hideVarTooltip());
    }, 300);
  }

  /**
   * Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
   * Redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
   *
   * @param event
   */
  function onKeyDown(event: React.KeyboardEvent) {
    if ((event.metaKey && event.shiftKey) && event.key === 'z') {
      event.preventDefault();
      redo();
    }
    else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault();
      redo();
    }
    else if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      undo();
    }
  }

  /**
   * Undo an input action.
   */
  function undo() {
    const history = historyRef.current;
    let index = historyIndexRef.current;

    if (index > 0) {
      historyIndexRef.current = index = --index;

      if (onChange) {
        onChange(history[index].value);
      }
    }
  }

  /**
   * Redo an input action.
   */
  function redo() {
    const history = historyRef.current;
    let index = historyIndexRef.current;

    if (index < history.length - 1) {
      historyIndexRef.current = index = ++index;

      if (onChange) {
        onChange(history[index].value);
      }
    }
  }

  /**
   * Handles input focus event.
   */
  function onFocus() {
    focusedRef.current = true;
  }

  /**
   * Handles input blur event.
   */
  function onBlur() {
    focusedRef.current = false;
  }

  return (
    <div style={{width: '100%', minWidth: '0px', maxWidth: '100%'}}>

      {label && (
        <Text size="sm" fw={500} lh="md">{label}</Text>
      )}

      {descr && (
        <Text size="xs" c="dimmed" mb="calc(var(--mantine-spacing-xs)/2)">{descr}</Text>
      )}

      <div
        className="input-container"
      >
        <div
          className="input-editor"
          ref={edRef}
          contentEditable="true"
          spellCheck="false"
          onInput={onInput}
          onKeyDown={onKeyDown}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    </div>
  )
}
