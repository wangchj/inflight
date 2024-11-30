import { Textarea } from "@mantine/core";
import { RequestResult } from "types/request-result";

export default function ResultBody({requestResult}: {requestResult: RequestResult}) {
  const data = requestResult.response.data;

  if (!data) {
    return <div>The response does not contain data.</div>
  }

  return (
    <Textarea
      classNames={{
        root: 'body-Textarea-root',
        wrapper: 'body-Textarea-wrapper',
        input: 'body-Textarea-input',
      }}
      value={data}
      readOnly
    />
  )
}
