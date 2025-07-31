import React, { useEffect, useRef, useState } from 'react';

interface AnchorElementPosition {
  left: number;
  top: number;
  height: number;
}

interface VariableSuggestionsProps {
  anchorElement: AnchorElementPosition;
  variables: string[];
  filterText: string;
  onSelectVariable: (variable: string) => void;
  onClose: () => void;
}

const VariableSuggestions: React.FC<VariableSuggestionsProps> = ({ 
  anchorElement, 
  variables, 
  filterText, 
  onSelectVariable, 
  onClose 
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter variables based on input
  const filteredVariables = variables.filter(variable => 
    variable.toLowerCase().includes(filterText.toLowerCase())
  );

  useEffect(() => {
    // Reset selected index when filter changes
    setSelectedIndex(0);
  }, [filterText]);

  useEffect(() => {
    // Handle keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!filteredVariables.length) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex < filteredVariables.length - 1 ? prevIndex + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prevIndex) => 
            prevIndex > 0 ? prevIndex - 1 : filteredVariables.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredVariables[selectedIndex]) {
            onSelectVariable(filteredVariables[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [filteredVariables, selectedIndex, onSelectVariable, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!filteredVariables.length) {
    return null;
  }

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${anchorElement.left}px`,
    top: `${anchorElement.top + 5}px`,
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 1000,
    maxHeight: '200px',
    overflowY: 'auto',
    width: '200px',
  };

  return (
    <div ref={containerRef} style={style}>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {filteredVariables.map((variable, index) => (
          <li
            key={variable}
            onClick={() => onSelectVariable(variable)}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              backgroundColor: index === selectedIndex ? '#e6f7ff' : 'transparent',
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            {variable}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VariableSuggestions;
