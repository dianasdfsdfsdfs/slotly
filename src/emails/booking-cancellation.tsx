import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components"

type Props = {
  customerName: string
  businessName: string
  serviceName: string
  whenText: string
}

const main: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "24px 0",
}
const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "32px",
  maxWidth: "480px",
  margin: "0 auto",
}
const h1: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 600,
  color: "#0a0a0b",
  margin: "0 0 8px",
}
const muted: React.CSSProperties = {
  fontSize: "14px",
  color: "#71717a",
  lineHeight: "20px",
  margin: "0 0 24px",
}
const rowLabel: React.CSSProperties = {
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "#a1a1aa",
  margin: "0",
}
const rowValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#0a0a0b",
  fontWeight: 500,
  margin: "2px 0 14px",
}

export function BookingCancellationEmail({
  customerName,
  businessName,
  serviceName,
  whenText,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Your booking at {businessName} was cancelled</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Booking cancelled</Heading>
          <Text style={muted}>
            Hi {customerName}, your appointment at{" "}
            <strong>{businessName}</strong> has been cancelled.
          </Text>
          <Section>
            <Text style={rowLabel}>Service</Text>
            <Text style={rowValue}>{serviceName}</Text>
            <Text style={rowLabel}>Was scheduled for</Text>
            <Text style={rowValue}>{whenText}</Text>
          </Section>
          <Hr />
          <Text style={muted}>
            Changed your mind? You can book again anytime on Slotly.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default BookingCancellationEmail
