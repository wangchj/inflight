import Editor, { EditorProps } from "@monaco-editor/react";

export default function Monaco(props: EditorProps) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <div
        style={{
          position:'absolute',
          top:0,
          left:0,
          right: 0,
          bottom:0,
          overflow: 'hidden',
        }}
      >
        <Editor {...props}/>
      </div>
    </div>
  )
}