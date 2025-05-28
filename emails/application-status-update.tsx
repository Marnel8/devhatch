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

interface ApplicationStatusUpdateEmailProps {
  applicantName: string;
  jobTitle: string;
  status: string;
  adminName: string;
}

export function ApplicationStatusUpdateEmail({
  applicantName = 'Student',
  jobTitle = 'Position',
  status = 'updated',
  adminName = 'DevHatch Team'
}: ApplicationStatusUpdateEmailProps) {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Your application is currently being reviewed by our team.';
      case 'for_review':
        return 'Your application has been moved to the review stage.';
      default:
        return `Your application status has been updated to: ${status}.`;
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Application Status Update - {jobTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>DevHatch OJT Portal</Heading>
            <Text style={subheading}>Batangas State University</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>Application Status Update</Heading>
            
            <Text style={text}>Hi {applicantName},</Text>
            
            <Text style={text}>
              We wanted to update you on your application for the <strong>{jobTitle}</strong> position at DevHatch.
            </Text>

            <Section style={statusBox}>
              <Text style={statusText}>
                {getStatusMessage(status)}
              </Text>
            </Section>

            <Text style={text}>
              If you have any questions about your application, please don't hesitate to contact us.
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Best regards,<br />
              {adminName}<br />
              DevHatch OJT Portal<br />
              Batangas State University
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

const statusBox = {
  backgroundColor: '#f3f4f6',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const statusText = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  textAlign: 'center' as const,
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