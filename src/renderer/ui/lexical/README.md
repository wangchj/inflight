# Lexical Variable Plugin (TypeScript)

This plugin for `@lexical/react` allows users to insert variables with the format `{{name}}` into a Lexical editor. It provides auto-completion and a suggestion dropdown for available variables.

## Features

- Auto-completes `}}` when user types `{{`
- Places cursor between the braces after auto-completion
- Shows a dropdown of available variables
- Allows keyboard navigation through variable suggestions
- Styles variables with custom formatting (background color)
- Supports filtering variables as user types
- Fully typed with TypeScript
- Works with PlainTextPlugin for simple editing needs

## Installation

1. Copy the following files into your project:
   - `VariableNode.ts`
   - `VariablePlugin.tsx`
   - `VariableUtils.ts`
   - `VariableSuggestions.tsx`

2. Install required dependencies if not already installed:
```bash
npm install @lexical/react lexical react react-dom
```

## Usage

1. Register the `VariableNode` in your Lexical editor configuration:

```tsx
const initialConfig = {
  // ...other config
  nodes: [
    // ...other nodes
    VariableNode
  ],
};
```

2. Add the `VariablePlugin` to your editor:

```tsx
import { VariableNode } from './VariableNode';
import VariablePlugin from './VariablePlugin';
import { registerVariableNode } from './VariableUtils';

// Define your available variables
const AVAILABLE_VARIABLES: string[] = [
  'firstName',
  'lastName',
  'email',
  // ...more variables
];

function MyEditor(): JSX.Element {
  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* Use PlainTextPlugin for simple text editing */}
      <PlainTextPlugin
        contentEditable={<ContentEditable className="editor-input" />}
        placeholder={<Placeholder />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <VariablePlugin variables={AVAILABLE_VARIABLES} />
    </LexicalComposer>
  );
}
```

3. Initialize the plugin and register transformations:

```tsx
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
```

## How It Works

1. When a user types `{{`, the plugin automatically inserts `}}` and positions the cursor between them.
2. A dropdown appears showing available variables that match what the user is typing.
3. The user can navigate the dropdown using arrow keys and select a variable with Enter.
4. When a variable is selected, it replaces the `{{}}` with the full variable node.
5. Variables are styled with a background color to make them stand out.

## Type Definitions

The plugin includes full TypeScript definitions:

- `VariableNode` extends Lexical's `TextNode` with proper type definitions
- React components use proper prop interfaces
- All utility functions are properly typed

## PlainTextPlugin vs RichTextPlugin

This plugin works with both:

- **PlainTextPlugin**: Use this for simple text editing without formatting needs
- **RichTextPlugin**: Use this if you need rich text formatting (bold, italic, etc.)

The example implementation uses PlainTextPlugin for simplicity, but you can easily switch to RichTextPlugin if needed.

## Customization

You can customize the appearance of variables by modifying the `createDOM` method in `VariableNode.ts` or by adding CSS styles targeting the variable nodes.

## License

MIT
