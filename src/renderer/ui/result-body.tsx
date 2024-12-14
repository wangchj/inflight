import { Box, SegmentedControl, Stack } from '@mantine/core';
import { RequestResult } from "types/request-result";
import Monaco from "./monaco";
import { useState } from 'react';

/**
 * Maps content-type to Monaco language.
 */
const languageMap = new Map([
  ['application/json', 'json']
]);

export default function ResultBody({requestResult}: {requestResult: RequestResult}) {
  const hasPrettyData = !!requestResult.response.prettyData;
  const [pretty, setPretty] = useState<boolean>(hasPrettyData);
  const contentType = requestResult.response.headers?.['content-type'];
  const data = requestResult.response.data;

  if (!data) {
    return <div>The response does not contain data.</div>
  }

  return (
    <Stack style={{width: '100%', height: '100%'}}>
      <Box>
        <SegmentedControl
          data={['Pretty', 'Raw']}
          value={pretty ? 'Pretty' : 'Raw'}
          onChange={value => setPretty(value === 'Pretty')}
          readOnly={!hasPrettyData}
        />
      </Box>

      <div style={{flexGrow: 1}}>
        <Monaco
          language={languageMap.get(contentType)}
          value={pretty && hasPrettyData ? requestResult.response.prettyData : data}
          options={{
            readOnly: true,
            minimap: {enabled: false},
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </Stack>
  )
}
