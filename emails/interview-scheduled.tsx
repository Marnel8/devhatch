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

interface InterviewScheduledEmailProps {
  applicantName: string;
  jobTitle: string;
  jobProject: string;
  interviewDate: string;
  interviewTime: string;
  interviewLocation: string;
  interviewType: string;
  adminName: string;
}

export function InterviewScheduledEmail({
  applicantName = 'Student',
  jobTitle = 'Position',
  jobProject = 'Project',
  interviewDate = '',
  interviewTime = '',
  interviewLocation = '',
  interviewType = 'in_person',
  adminName = 'DevHatch Team'
}: InterviewScheduledEmailProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'TBD';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    try {
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeString;
    }
  };

  const getInterviewTypeText = (type: string) => {
    switch (type) {
      case 'online':
        return 'Online Interview';
      case 'phone':
        return 'Phone Interview';
      default:
        return 'In-Person Interview';
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Interview Scheduled - {jobTitle} at DevHatch</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={heading}>DevHatch OJT Portal</Heading>
            <Text style={subheading}>Batangas State University</Text>
          </Section>

          <Section style={content}>
            <Heading style={h1}>🎉 Interview Scheduled!</Heading>
            
            <Text style={text}>Hi {applicantName},</Text>
            
            <Text style={text}>
              Great news! We're excited to move forward with your application for the{' '}
              <strong>{jobTitle}</strong> position in the <strong>{jobProject}</strong> project.
            </Text>

            <Text style={text}>
              We've scheduled an interview with you. Here are the details:
            </Text>

            <Section style={interviewBox}>
              <Heading style={interviewHeading}>{getInterviewTypeText(interviewType)}</Heading>
              
              <div style={interviewDetails}>
                <div style={detailRow}>
                  <Text style={detailLabel}>📅 Date:</Text>
                  <Text style={detailValue}>{formatDate(interviewDate)}</Text>
                </div>
                
                <div style={detailRow}>
                  <Text style={detailLabel}>🕐 Time:</Text>
                  <Text style={detailValue}>{formatTime(interviewTime)}</Text>
                </div>
                
                <div style={detailRow}>
                  <Text style={detailLabel}>
                    {interviewType === 'online' ? '💻 Link:' : 
                     interviewType === 'phone' ? '📞 Phone:' : '📍 Location:'}
                  </Text>
                  <Text style={detailValue}>{interviewLocation || 'Details will be provided'}</Text>
                </div>
              </div>
            </Section>

            <Section style={preparationBox}>
              <Heading style={preparationHeading}>📝 Interview Preparation</Heading>
              <Text style={preparationText}>
                • Review your application and portfolio<br />
                • Prepare questions about the role and project<br />
                • {interviewType === 'online' ? 'Test your camera and microphone' : 
                   interviewType === 'phone' ? 'Ensure good phone signal' : 
                   'Arrive 10 minutes early'}<br />
                • Bring copies of your resume and any relevant work samples
              </Text>
            </Section>

            <Text style={text}>
              If you need to reschedule or have any questions, please contact us as soon as possible.
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

const interviewBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #059669',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
};

const interviewHeading = {
  color: '#059669',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const interviewDetails = {
  margin: '0',
};

const detailRow = {
  display: 'flex',
  alignItems: 'center',
  margin: '8px 0',
  gap: '8px',
};

const detailLabel = {
  color: '#374151',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
  minWidth: '80px',
};

const detailValue = {
  color: '#059669',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const preparationBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
};

const preparationHeading = {
  color: '#92400e',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const preparationText = {
  color: '#92400e',
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