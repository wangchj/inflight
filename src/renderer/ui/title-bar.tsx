import { useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';

/**
 * The app title bar UI component.
 */
export default function TitleBar() {
  const project = useSelector((state: RootState) => state.project);

  return (
    <div
      className="app-drag"
      style={{
        height: '2rem',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: 'var(--mantine-color-gray-1)',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >{project.name}</div>
  )
}
