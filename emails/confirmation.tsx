import {
  Html, Head, Body, Container, Preview,
  Section, Text, Hr, Link,
} from "@react-email/components";

interface Props {
  name: string;
}

const bg     = "#ffffff";
const text   = "#111111";
const dim    = "#555555";
const faint  = "#999999";
const border = "#e5e5e5";
const green  = "#4ade80";
const font   = "'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function ConfirmationEmail({ name }: Props) {
  return (
    <Html lang="en">
      <Head />
      <Preview>Got your message — I&apos;ll be in touch shortly.</Preview>
      <Body style={{ backgroundColor: bg, margin: "0", padding: "0", fontFamily: font }}>
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "48px 32px" }}>

          {/* Wordmark + availability dot */}
          <Section style={{ marginBottom: "32px" }}>
            <table style={{ borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: "middle", paddingRight: "8px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: green }} />
                  </td>
                  <td style={{ verticalAlign: "middle" }}>
                    <Text style={{ fontSize: "10px", fontWeight: "600", letterSpacing: "0.2em", textTransform: "uppercase", color: text, margin: "0" }}>
                      Roman Robert
                    </Text>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>

          <Hr style={{ borderColor: border, margin: "0 0 40px 0" }} />

          {/* Main message */}
          <Text style={{ fontSize: "32px", fontWeight: "600", letterSpacing: "-0.03em", color: text, margin: "0 0 32px 0", lineHeight: "1.05" }}>
            Got it, {name}.
          </Text>

          <Text style={{ fontSize: "15px", color: dim, lineHeight: "1.75", margin: "0 0 16px 0" }}>
            Thanks for reaching out. I&apos;ve received your message and will
            get back to you as soon as possible — usually within a day or two.
          </Text>

          <Text style={{ fontSize: "15px", color: dim, lineHeight: "1.75", margin: "0 0 40px 0" }}>
            In the meantime, feel free to browse my work at{" "}
            <Link href="https://romanrobert.com" style={{ color: text, textDecoration: "underline" }}>
              romanrobert.com
            </Link>
            .
          </Text>

          <Text style={{ fontSize: "15px", color: text, margin: "0" }}>
            — Roman
          </Text>

          <Hr style={{ borderColor: border, margin: "40px 0 24px 0" }} />

          {/* Footer */}
          <Text style={{ fontSize: "11px", color: faint, margin: "0" }}>
            <Link href="mailto:hello@romanrobert.com" style={{ color: faint, textDecoration: "none" }}>
              hello@romanrobert.com
            </Link>
            {"  ·  "}
            <Link href="https://www.linkedin.com/in/iromanrobert" style={{ color: faint, textDecoration: "none" }}>
              LinkedIn
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
