import {
  Html, Head, Body, Container, Preview,
  Section, Text, Hr, Link,
} from "@react-email/components";

interface Props {
  name: string;
  email: string;
  message: string;
}

const bg      = "#ffffff";
const surface = "#f5f5f5";
const text     = "#111111";
const dim      = "#555555";
const faint    = "#999999";
const border   = "#e5e5e5";
const font     = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function NotificationEmail({ name, email, message }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>New message from {name} via romanrobert.com</Preview>
      <Body style={{ backgroundColor: bg, margin: "0", padding: "0", fontFamily: font }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 32px" }}>

          {/* Wordmark */}
          <Text style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.2em", textTransform: "uppercase", color: text, margin: "0 0 32px 0" }}>
            Roman Robert
          </Text>

          <Hr style={{ borderColor: border, margin: "0 0 32px 0" }} />

          {/* Heading */}
          <Text style={{ fontSize: "28px", fontWeight: "600", letterSpacing: "-0.03em", color: text, margin: "0 0 8px 0", lineHeight: "1.1" }}>
            New message
          </Text>
          <Text style={{ fontSize: "13px", color: dim, margin: "0 0 32px 0" }}>
            Submitted via the contact form
          </Text>

          <Hr style={{ borderColor: border, margin: "0 0 32px 0" }} />

          {/* Sender details */}
          <Section style={{ backgroundColor: surface, borderRadius: "8px", padding: "24px" }}>
            <Text style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: faint, margin: "0 0 4px 0" }}>
              Name
            </Text>
            <Text style={{ fontSize: "15px", color: text, margin: "0 0 20px 0" }}>
              {name}
            </Text>

            <Text style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: faint, margin: "0 0 4px 0" }}>
              Email
            </Text>
            <Link href={`mailto:${email}`} style={{ fontSize: "15px", color: text, textDecoration: "underline", display: "block", marginBottom: "0" }}>
              {email}
            </Link>
          </Section>

          <Hr style={{ borderColor: border, margin: "32px 0" }} />

          {/* Message */}
          <Text style={{ fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", color: faint, margin: "0 0 12px 0" }}>
            Message
          </Text>
          <Text style={{ fontSize: "15px", color: dim, lineHeight: "1.75", margin: "0", whiteSpace: "pre-wrap" }}>
            {message}
          </Text>

          <Hr style={{ borderColor: border, margin: "32px 0 24px 0" }} />

          {/* Footer */}
          <Text style={{ fontSize: "11px", color: faint, margin: "0" }}>
            <Link href="mailto:hello@romanrobert.com" style={{ color: faint, textDecoration: "none" }}>
              hello@romanrobert.com
            </Link>
            {"  ·  "}
            <Link href="https://romanrobert.com" style={{ color: faint, textDecoration: "none" }}>
              romanrobert.com
            </Link>
          </Text>

        </Container>
      </Body>
    </Html>
  );
}
