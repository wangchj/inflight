import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_CRITICAL,
  KEY_ENTER_COMMAND,
  LineBreakNode,
  TextNode,
  $createTextNode
} from 'lexical';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  KEY_DOWN_COMMAND,
  LexicalCommand,
  LexicalEditor,
  createCommand
} from 'lexical';
import { mergeRegister } from '@lexical/utils';
import VariableSuggestions from './VariableSuggestions';
import { VariableNode } from './VariableNode';
import { $createVariableNode } from './VariableNode';

interface VariablePluginProps {
  variables: string[];
}

interface AnchorElementPosition {
  left: number;
  top: number;
  height: number;
}

export const INSERT_VARIABLE_COMMAND: LexicalCommand<string> = createCommand('INSERT_VARIABLE_COMMAND');

const varRegex = /{{[^{}]+}}/;

export default function VariablePlugin({ variables = [] }: VariablePluginProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [anchorElement, setAnchorElement] = useState<AnchorElementPosition | null>(null);
  const [variableText, setVariableText] = useState<string>('');

  useEffect(() => {
    if (!editor) {
      return;
    }

    // Register our custom node
    if (!editor.hasNodes([VariableNode])) {
      throw new Error('VariablePlugin: VariableNode not registered on editor');
    }

    return mergeRegister(

      // Prevent new line
      editor.registerNodeTransform(LineBreakNode, (node) => {
        node.remove();
      }),

      editor.registerNodeTransform(TextNode, (node) => {
        console.log('------------registerNodeTransform', node);

        const text = node.__text;
        const match = text.match(varRegex);

        console.log(match);

        if (match) {

        }
      }),

      editor.registerNodeTransform(VariableNode, (node) => {
        const text = node.__text;

        if (text) {
          if (!text.startsWith('{{') || !text.endsWith('}}')) {
            const textNode = $createTextNode(node.__text);
            node.replace(textNode);
          }
        }
        else {
          node.remove();
        }
      }),

      // Listen for typing events
      // editor.registerTextContentListener((text: string) => {

      //   console.log('------------text content listener', text);


      // }),

      // Handle keydown events
      // editor.registerCommand<KeyboardEvent>(
      //   KEY_DOWN_COMMAND,
      //   (event) => {
      //     const { key } = event;

      //     console.log('------------key down command', event);

      //     return false;
      //   },
      //   COMMAND_PRIORITY_EDITOR
      // ),
    );
  }, [editor, showSuggestions, variables]);

  const handleSelectVariable = (variable: string) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) {
        return;
      }

      // Delete the current {{ and any text typed so far
      // selection.deleteBackward(variableText.length + 2);

      // Create and insert the variable node
      const variableNode = $createVariableNode(`{{${variable}}}`);
      selection.insertNodes([variableNode]);
    });

    setShowSuggestions(false);
  };

  return (
    <>
      {showSuggestions && anchorElement && (
        <VariableSuggestions
          anchorElement={anchorElement}
          variables={variables}
          filterText={variableText}
          onSelectVariable={handleSelectVariable}
          onClose={() => setShowSuggestions(false)}
        />
      )}
    </>
  );
}
