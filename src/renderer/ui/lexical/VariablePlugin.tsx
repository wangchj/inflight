import React, { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { TextNode } from 'lexical';
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
  inputId: string;
}

interface AnchorElementPosition {
  left: number;
  top: number;
  height: number;
}

export const INSERT_VARIABLE_COMMAND: LexicalCommand<string> = createCommand('INSERT_VARIABLE_COMMAND');

export default function VariablePlugin({ variables = [], inputId }: VariablePluginProps): JSX.Element {
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
      // Listen for typing events
      editor.registerTextContentListener((text: string) => {

        console.log('------------text content listener', text);

        // Check if we're currently showing suggestions
        if (showSuggestions) {
          // Update the variable text being typed
          const match = text.match(/\{\{([^}]*)$/);
          if (match) {
            setVariableText(match[1]);
          } else {
            setShowSuggestions(false);
          }
        }
      }),

      // Handle keydown events
      editor.registerCommand<KeyboardEvent>(
        KEY_DOWN_COMMAND,
        (event) => {
          const { key } = event;

          console.log('------------key down command', event);

          // Handle variable start
          if (key === '{' && event.repeat) {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
              return false;
            }

            const lastChar = editor.getEditorState().read(() => {
              const anchor = selection.anchor;
              if (anchor.offset === 0) {
                return null;
              }
              const textNode = anchor.getNode();
              if (!textNode || !textNode.getTextContent) {
                return null;
              }
              const textContent = textNode.getTextContent();
              return textContent[anchor.offset - 1];
            });

            if (lastChar === '{') {
              event.preventDefault();

              // Insert the closing brackets and position cursor in the middle
              editor.update(() => {
                const selection = $getSelection();
                if (!$isRangeSelection(selection)) {
                  return;
                }

                selection.insertText('}}');
                // selection.moveBackward(2);

                // Show variable suggestions
                const domSelection = window.getSelection();
                if (domSelection && domSelection.anchorNode) {
                  const rect = domSelection.getRangeAt(0).getBoundingClientRect();
                  setAnchorElement({
                    left: rect.left,
                    top: rect.bottom,
                    height: rect.height
                  });
                  setShowSuggestions(true);
                  setVariableText('');
                }
              });

              return true;
            }
          }

          // Handle variable selection from suggestions
          if (showSuggestions) {
            if (key === 'Escape') {
              setShowSuggestions(false);
              return true;
            }

            if (key === 'ArrowDown' || key === 'ArrowUp' || key === 'Enter') {
              // These will be handled by the suggestions component
              event.preventDefault();
              return true;
            }
          }

          return false;
        },
        COMMAND_PRIORITY_EDITOR
      ),

      // Register command to insert variable
      editor.registerCommand<string>(
        INSERT_VARIABLE_COMMAND,
        (variableName) => {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
              return false;
            }

            const variableNode = $createVariableNode(`{{${variableName}}}`);
            selection.insertNodes([variableNode]);
          });
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      )
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
