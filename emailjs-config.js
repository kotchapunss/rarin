// EmailJS Configuration for Rarin Venue
// To set up EmailJS for actual email sending:
// 1. Go to https://www.emailjs.com/
// 2. Create an account
// 3. Create a new email service (Gmail, Outlook, etc.)
// 4. Create a new email template
// 5. Get your credentials and update the values below

export const EMAILJS_CONFIG = {
  // Service ID - Get from EmailJS dashboard
  serviceId: 'service_8yk3ezo', // Replace with your actual service ID
  
  // Template ID - Get from EmailJS dashboard  
  templateId: 'template_y8ca0gi', // Replace with your actual template ID
  
  // Public Key - Get from EmailJS dashboard (Account → API Keys)
  publicKey: 'N0Z9CM_EdE46WDfka', // Replace with your actual public key
  
  // Target email for all bookings
  targetEmail: 'rarin.mail@gmail.com'
};

// Template variables that should be available in your EmailJS template:
// - to_email (recipient email)
// - to_name (recipient name)  
// - from_name (customer email)
// - customer_email
// - customer_phone
// - customer_line_id
// - event_date
// - special_request
// - service_type
// - package_name
// - guest_count
// - day_type
// - period
// - total_price
// - booking_summary (JSON string)
// - email_body (formatted message)
// - pdf_attachment (base64 PDF data)
// - pdf_filename (PDF file name)

/*
Example EmailJS Template HTML:
<h2>New Booking Request from Rarin Venue</h2>
<p><strong>Customer:</strong> {{customer_email}}</p>
<p><strong>Phone:</strong> {{customer_phone}}</p>
<p><strong>Line ID:</strong> {{customer_line_id}}</p>
<p><strong>Event Date:</strong> {{event_date}}</p>

<h3>Booking Details:</h3>
<p><strong>Service:</strong> {{service_type}}</p>
<p><strong>Package:</strong> {{package_name}}</p>
<p><strong>Guests:</strong> {{guest_count}} people</p>
<p><strong>Day Type:</strong> {{day_type}}</p>
<p><strong>Period:</strong> {{period}}</p>
<p><strong>Total:</strong> {{total_price}}</p>

<h3>Special Requests:</h3>
<p>{{special_request}}</p>

<h3>Full Details:</h3>
<pre>{{email_body}}</pre>

{{#if pdf_attachment}}
<p><em>PDF attachment included: {{pdf_filename}}</em></p>
{{/if}}
*/