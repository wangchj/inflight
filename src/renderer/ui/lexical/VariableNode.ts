import { nanoid } from '@reduxjs/toolkit';
import { TextNode, NodeKey, SerializedTextNode, LexicalNode, EditorConfig } from 'lexical';
import { store } from 'renderer/redux/store';
import { uiSlice } from 'renderer/redux/ui-slice';

export type SerializedVariableNode = SerializedTextNode;

export class VariableNode extends TextNode {
  id: string;

  constructor(text: string, key?: NodeKey ) {
    super(text, key);
    this.id = `i${nanoid(10)}`;
  }

  static getType(): string {
    return 'variable';
  }

  static clone(node: VariableNode): VariableNode {
    return new VariableNode(node.__text, node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config);
    dom.id = this.id;
    dom.style.color = 'blue';
    dom.style.backgroundColor = '#e6f7ff';
    dom.style.padding = '0 2px';
    dom.style.borderRadius = '3px';
    dom.onmouseover = event => this.onMouseOver(event);
    dom.onmouseleave = event => this.onMouseLeave(event);
    return dom;
  }

  updateDOM(prevNode: VariableNode, dom: HTMLElement, config: EditorConfig): boolean {
    return false;
  }

  isVariable(): boolean {
    return true;
  }

  exportJSON(): SerializedVariableNode {
    return {
      ...super.exportJSON(),
      type: 'variable',
      version: 1,
    };
  }

  static importJSON(serializedNode: SerializedVariableNode): VariableNode {
    // const node = $createVariableNode(serializedNode.text);
    // node.setFormat(serializedNode.format);
    // node.setDetail(serializedNode.detail);
    // node.setMode(serializedNode.mode);
    // node.setStyle(serializedNode.style);
    // return node;
    return;
  }

  onMouseOver(event: MouseEvent) {
    const text = this.__text;
    const name = text.substring(2, text.length - 2);
    store.dispatch(uiSlice.actions.showVarTooltip({id: this.id, name}));
  }

  onMouseLeave(event: MouseEvent) {
    store.dispatch(uiSlice.actions.hideVarTooltip());
  }
}

export function $createVariableNode(text: string): VariableNode {
  return new VariableNode(text);
}

export function $isVariableNode(node: LexicalNode | null | undefined): node is VariableNode {
  return node instanceof VariableNode;
}
