import React, { useEffect } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createParagraphNode, $createTextNode, $getRoot, EditorState, LexicalNode, ParagraphNode, TextNode } from 'lexical';
import { VariableNode } from './VariableNode';
import VariablePlugin from './VariablePlugin';
import { registerVariableNode, textNodeTransform } from './VariableUtils';
import './EditorStyles.css';

// Sample list of available variables
const AVAILABLE_VARIABLES: string[] = [
  'firstName',
  'lastName',
  'email',
  'company',
  'position',
  'date',
  'address',
  'phoneNumber'
];

// interface EditorTheme {
//   paragraph: string;
//   text: {
//     base: string;
//   };
// }


interface LexInputProps {
  id: string;
  value: string;
  onChange?: (value: string) => void;
}

interface Token {
  type: 'text' | 'variable';
  value: string;
}

/**
 * Tokenizes a string into a list of text or variable tokens.
 *
 * @param value The string to parse.
 * @return A list of tokens.
 */
function tokenize(value: string): Token[] {
  const regex = /{{(.*?)}}/g;
  const result = [] as Token[];

  let lastIndex = 0;

  for (const match of value.matchAll(regex)) {
    if (match.index > lastIndex) {
      result.push({type: 'text', value: value.slice(lastIndex, match.index)});
    }
    result.push({type: 'variable', value: match[1]});
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    result.push({ type: 'text', value: value.slice(lastIndex) });
  }

  return result;
}

/**
 * Converts a token to Lexical node.
 *
 * @param token The token to convert.
 * @returns A TextNode or VariableNode.
 */
function tokenToNode(token: Token): LexicalNode {
  switch(token.type) {
    case 'text':
      return $createTextNode(token.value);

    case 'variable':
      return new VariableNode(`{{${token.value}}}`);
  }
}

export default function LexInput({id, value, onChange}: LexInputProps): JSX.Element {
  return (
    <LexicalComposer initialConfig={{
      namespace: 'LexInput',
      onError(error: Error) {
        console.error(error);
      },
      editorState: () => {
        if (value) {
          const root = $getRoot();
          const p = $createParagraphNode();
          tokenize(value)
            .map(token => tokenToNode(token))
            .filter(node => !!node)
            .forEach(node => p.append(node));
          root.append(p);
        }
      },
      nodes: [VariableNode],
      theme: {
        paragraph: 'editor-paragraph',
        text: {
          base: 'editor-text-base',
        },
      },
    }}>
      <div className="editor-container">
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          ErrorBoundary={LexicalErrorBoundary}
        />

        <OnChangePlugin
          onChange={(editorState: EditorState) => {
            // You can save the editor state here if needed
            console.log('Editor changed!', editorState);
          }}
        />

        <VariablePlugin variables={AVAILABLE_VARIABLES} inputId={id}/>
        <InitializePlugin />
      </div>
    </LexicalComposer>
  );
}

// This plugin initializes our custom node and transformations
function InitializePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register our variable node
    registerVariableNode(editor);

    // Register text transformation to convert text to variable nodes
    return editor.registerNodeTransform(TextNode, textNodeTransform);
  }, [editor]);

  return null;
}
