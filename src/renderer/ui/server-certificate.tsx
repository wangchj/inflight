import {
  Card,
  Code,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { RequestResult } from "types/request-result";


export default function ServerCertificate({requestResult}: {requestResult: RequestResult}) {
  const cert = requestResult.response.peerCertificate;

  return (
    <Stack gap="xl">
      <Card withBorder shadow="none" radius="md">
        <Card.Section>
        <Table>
          <Table.Tbody>
            <Table.Tr>
              <Table.Td w="20%"><Code color="none">Serial number</Code></Table.Td>
              <Table.Td><Code color="none">{cert.serialNumber}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Subject</Code></Table.Td>
              <Table.Td><Code color="none">{JSON.stringify(cert.subject)}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Subject alt name</Code></Table.Td>
              <Table.Td style={{overflowWrap: 'anywhere'}}><Code color="none">{cert.subjectaltname}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Issuer</Code></Table.Td>
              <Table.Td style={{overflowWrap: 'anywhere'}}><Code color="none">{JSON.stringify(cert.issuer)}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Valid from</Code></Table.Td>
              <Table.Td><Code color="none">{cert.valid_from}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Valid to</Code></Table.Td>
              <Table.Td><Code color="none">{cert.valid_to}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Bits</Code></Table.Td>
              <Table.Td><Code color="none">{cert.bits}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td style={{overflowWrap: 'anywhere'}}><Code color="none">Fingerprint</Code></Table.Td>
              <Table.Td><Code color="none">{cert.fingerprint}</Code></Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Td><Code color="none">Public key</Code></Table.Td>
              <Table.Td style={{overflowWrap: 'anywhere'}}><Code color="none">{cert.pubkey}</Code></Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
        </Card.Section>
      </Card>
    </Stack>
  )
}
