import {
  Box,
  Button,
  Group,
  SegmentedControl,
  Select,
  Stack,
  TextInput,
  Title
} from "@mantine/core";
import { Request } from "types/request"

interface RequestConfigProps {
  request: Request;
}
export default function RequestConfig({request}: RequestConfigProps) {
  return (
    <div>
      <Title order={3}>Headers</Title>
      {JSON.stringify(request.headers)}

      <Title order={3}>Body</Title>

      {request.body}
    </div>
  )
}
