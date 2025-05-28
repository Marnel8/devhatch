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

interface ApplicationApprovedEmailProps {
  applicantName: string;
  jobTitle: string;
  jobProject: string;
  adminName: string;
}

export function ApplicationApprovedEmail({
  applicantName = 'Student',
  jobTitle = 'Position',
  jobProject = 'Project',
  adminName = 'DevHatch Team'
}: ApplicationApprovedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Congratulations! You've been selected for {jobTitle} at DevHatch</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>DevHatch OJT Portal</Heading>
            <Text style={subheading}>Batangas State University</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>🎉 Congratulations!</Heading>
            
            <Text style={text}>Hi {applicantName},</Text>
            
            <Text style={text}>
              We're thrilled to inform you that you have been <strong>selected</strong> for the{' '}
              <strong>{jobTitle}</strong> position in the <strong>{jobProject}</strong> project at DevHatch!
            </Text>

            <Section style={successBox}>
              <Heading style={successHeading}>Welcome to the DevHatch Team!</Heading>
              <Text style={successText}>
                Your application impressed us, and we're excited to have you join our innovative projects 
                at the BatStateU DevOps Office.
              </Text>
            </Section>

            <Section style={nextStepsBox}>
              <Heading style={nextStepsHeading}>📋 Next Steps</Heading>
              <Text style={nextStepsText}>
                <strong>1. Onboarding Process</strong><br />
                We'll contact you within the next 2-3 business days with onboarding details and your start date.
                <br /><br />
                
                <strong>2. Documentation</strong><br />
                Please prepare the following documents:<br />
                • Valid student ID<br />
                • Letter of recommendation from your department<br />
                • Medical clearance (if required)<br />
                • Emergency contact information
                <br /><br />
                
                <strong>3. Orientation</strong><br />
                You'll attend an orientation session where you'll meet your team, learn about the project, 
                and get familiar with our development environment.
              </Text>
            </Section>

            <Section style={welcomeBox}>
              <Text style={welcomeText}>
                💡 <strong>What to Expect:</strong><br />
                • Hands-on experience with cutting-edge technology<br />
                • Mentorship from experienced developers<br />
                • Opportunity to contribute to real-world projects<br />
                • Skill development and career growth<br />
                • Collaborative and innovative work environment
              </Text>
            </Section>

            <Text style={text}>
              If you have any questions or need clarification about anything, 
              please don't hesitate to reach out to us.
            </Text>

            <Text style={text}>
              Once again, congratulations on this achievement. We look forward to working with you!
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Best regards,<br />
              {adminName}<br />
              DevHatch OJT Portal<br />
              Batangas State University<br />
              <br />
              📧 devops@g.batstate-u.edu.ph<br />
              📍 3rd Floor, SteerHub Building, BatStateU
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
  fontSize: '28px',
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

const successBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #059669',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const successHeading = {
  color: '#059669',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const successText = {
  color: '#166534',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
};

const nextStepsBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const nextStepsHeading = {
  color: '#92400e',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const nextStepsText = {
  color: '#92400e',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const welcomeBox = {
  backgroundColor: '#eff6ff',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const welcomeText = {
  color: '#1e40af',
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