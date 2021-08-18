import React, { FC, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export interface MonacoInputProps {
  onChange?: (value?: string) => void;
  value?: string;
  setIsUpdateTemplateDisabled: (value?: boolean) => void;
}

export const MonacoInput: FC<MonacoInputProps> = ({ value, onChange, setIsUpdateTemplateDisabled }: MonacoInputProps) => {
  const editorRef = useRef();
  const [editorValue, setEditorValue] = useState('');
  const [isRefSet, setRefSet] = useState(false);
  const [shouldStopUpdating, setShouldStopUpdating] = useState(false);

  const setUpRef = (editor: any) => {
    editorRef.current = editor;
    setRefSet(true);
  };

  useEffect(() => {
    if (!value || value.length === 0 || shouldStopUpdating) return;
    // console.log(`updating value to ${value}`);
    setEditorValue(value);
  }, [value, isRefSet, shouldStopUpdating]);

  useEffect(() => {
    if (editorRef.current && (editorRef.current as any).getModel() && !shouldStopUpdating) {
      // console.log(`updating editor value to ${editorValue}`);
      const editor = editorRef.current as any;
      const previousPosition = editor.getPosition();
      editor.getModel().setValue(editorValue);
      // const currentPosition = editor.getPosition();
      // const latestPosition = editor.getModel().modifyPosition(currentPosition, editorValue.length);
      editor.setPosition(previousPosition);
      editor.focus();
      // console.log(previousPosition, currentPosition, latestPosition);
      setShouldStopUpdating(true);
    }
  }, [editorValue, shouldStopUpdating]);

  const handleChange = (val: any) => {
    setIsUpdateTemplateDisabled(false);

    setEditorValue(val);
    if (onChange) {
      onChange(val);
    }
  };

  return (
    <Editor
      options={{
        minimap: {
          enabled: false,
        },
        // lineNumbers: false,
      }}
      defaultValue={value || editorValue}
      defaultLanguage="handlebars"
      height="100px"
      onMount={setUpRef}
      onChange={(val) => handleChange(val)}
    />
  );
};
