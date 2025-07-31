import { VariableNode, $createVariableNode, $isVariableNode } from './VariableNode';
import { $createTextNode, $isTextNode, TextNode, LexicalEditor, LexicalNode } from 'lexical';

// This function can be used to register the node with the editor
export function registerVariableNode(editor: LexicalEditor): void {
  if (!editor.hasNodes([VariableNode])) {
    editor.registerNodeTransform(VariableNode, (node: LexicalNode) => {
      // Any transformations needed for the variable node
    });
  }
}

// Helper function to convert matching text to variable nodes
export function textNodeTransform(node: TextNode): void {
  if (!$isTextNode(node) || $isVariableNode(node)) {
    return;
  }

  const text = node.getTextContent();
  const regex = /\{\{([^}]*)\}\}/g;
  let match: RegExpExecArray | null;
  const nodes: LexicalNode[] = [];
  let lastIndex = 0;

  console.log('------transform', node, text, match);
  // while ((match = regex.exec(text)) !== null) {
  //   const matchIndex = match.index;
  //   const matchLength = match[0].length;

  //   if (matchIndex > lastIndex) {
  //     nodes.push($createTextNode(text.slice(lastIndex, matchIndex)));
  //   }

  //   nodes.push($createVariableNode(match[0]));
  //   lastIndex = matchIndex + matchLength;
  // }

  // if (lastIndex < text.length) {
  //   nodes.push($createTextNode(text.slice(lastIndex)));
  // }

  // if (nodes.length > 0) {
  //   node.replace(nodes[0]);
  //   let currentNode = nodes[0];
  //   for (let i = 1; i < nodes.length; i++) {
  //     currentNode.insertAfter(nodes[i]);
  //     currentNode = nodes[i];
  //   }
  // }
}
