import { Loader } from '@mantine/core';

export default function PageLoading() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <Loader size={50} />
    </div>
  )
}
