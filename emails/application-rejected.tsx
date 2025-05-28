import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface ApplicationRejectedEmailProps {
  applicantName: string;
  jobTitle: string;
  rejectionReason: string;
  adminName: string;
}

export function ApplicationRejectedEmail({
  applicantName = 'Student',
  jobTitle = 'Position',
  rejectionReason = 'After careful consideration, we have decided to move forward with other candidates.',
  adminName = 'DevHatch Team'
}: ApplicationRejectedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Application Update - {jobTitle} at DevHatch</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>DevHatch OJT Portal</Heading>
            <Text style={subheading}>Batangas State University</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Application Update</Heading>
            
            <Text style={text}>Hi {applicantName},</Text>
            
            <Text style={text}>
              Thank you for your interest in the <strong>{jobTitle}</strong> position at DevHatch 
              and for taking the time to submit your application.
            </Text>

            <Section style={updateBox}>
              <Text style={updateText}>
                {rejectionReason}
              </Text>
            </Section>

            <Text style={text}>
              We received many qualified applications, and while your background and experience are impressive, 
              we have decided to proceed with candidates whose skills more closely match our current project requirements.
            </Text>

            <Section style={encouragementBox}>
              <Heading style={encouragementHeading}>Don't Give Up!</Heading>
              <Text style={encouragementText}>
                We encourage you to continue developing your skills and to apply for future opportunities 
                with DevHatch. We regularly post new positions and would welcome your application again.
              </Text>
            </Section>

            <Section style={feedbackBox}>
              <Heading style={feedbackHeading}>💡 Keep Growing</Heading>
              <Text style={feedbackText}>
                • Continue building your portfolio with personal projects<br />
                • Stay updated with the latest technologies in your field<br />
                • Consider contributing to open-source projects<br />
                • Keep an eye on our future job postings<br />
                • Network with professionals in the industry
              </Text>
            </Section>

            <Text style={text}>
              We appreciate the time and effort you put into your application. 
              We wish you all the best in your future endeavors and academic pursuits.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Best regards,<br />
              {adminName}<br />
              DevHatch OJT Portal<br />
              Batangas State University<br />
              <br />
              📧 devops@g.batstate-u.edu.ph
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 48px',
  backgroundColor: '#059669',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
};

const subheading = {
  fontSize: '14px',
  color: '#ffffff',
  margin: '0',
  opacity: 0.8,
};

const content = {
  padding: '48px',
};

const h1 = {
  color: '#1f2937',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
};

const updateBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fca5a5',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const updateText = {
  color: '#991b1b',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
  textAlign: 'center' as const,
  fontWeight: '500',
};

const encouragementBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #60a5fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const encouragementHeading = {
  color: '#1d4ed8',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const encouragementText = {
  color: '#1e3a8a',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const feedbackBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #4ade80',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const feedbackHeading = {
  color: '#15803d',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const feedbackText = {
  color: '#15803d',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}; 