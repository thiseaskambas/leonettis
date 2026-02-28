import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const TO_EMAIL = process.env.CONTACT_EMAIL_TO ?? '';

interface ContactPayload {
  salutation?: string;
  firstName: string;
  lastName: string;
  contactPreference: 'email' | 'phone';
  email?: string;
  countryCode?: string;
  phone?: string;
  message?: string;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string): boolean {
  return /^[\d\s\-().]{6,20}$/.test(value);
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: ContactPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    salutation,
    firstName,
    lastName,
    contactPreference,
    email,
    countryCode,
    phone,
    message,
  } = body;

  const errors: Record<string, string> = {};

  if (!firstName?.trim()) errors.firstName = 'First name is required';
  if (!lastName?.trim()) errors.lastName = 'Last name is required';

  if (contactPreference === 'email') {
    if (!email?.trim()) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email.trim())) {
      errors.email = 'Invalid email address';
    }
  } else if (contactPreference === 'phone') {
    if (!phone?.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!isValidPhone(phone.trim())) {
      errors.phone = 'Invalid phone number';
    }
  } else {
    errors.contactPreference = 'Contact preference is required';
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const salutationStr = salutation ? `${salutation} ` : '';
  const contactInfo =
    contactPreference === 'email'
      ? `Email: ${email}`
      : `Phone: ${countryCode ?? ''} ${phone}`;

  const htmlBody = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${salutationStr}${firstName} ${lastName}</p>
    <p><strong>Contact:</strong> ${contactInfo}</p>
    ${message ? `<p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br/>')}</p>` : ''}
  `.trim();

  const textBody = [
    'New Contact Form Submission',
    `Name: ${salutationStr}${firstName} ${lastName}`,
    `Contact: ${contactInfo}`,
    message ? `\nMessage:\n${message}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    const { error } = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: [TO_EMAIL],
      replyTo: contactPreference === 'email' && email ? email : undefined,
      subject: `New contact: ${salutationStr}${firstName} ${lastName}`,
      html: htmlBody,
      text: textBody,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: 'Email delivery failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
