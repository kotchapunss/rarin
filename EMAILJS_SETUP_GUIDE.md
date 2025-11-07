# EmailJS Setup Guide for Rarin Venue Booking System

## Step-by-Step Setup Instructions

### 1. Create EmailJS Account
1. Go to [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click "Sign Up" and create a free account
3. Verify your email address

### 2. Add Email Service
1. In the EmailJS dashboard, go to **"Email Services"**
2. Click **"Add New Service"**
3. Choose **"Gmail"** (recommended)
4. Connect your Gmail account (`rarin.mail@gmail.com`)
5. Set Service ID to: `service_rarin` (or copy the generated ID)

### 3. Create Email Template
1. Go to **"Email Templates"** in the dashboard
2. Click **"Create New Template"**
3. Set Template ID to: `template_rarin_booking` (or copy the generated ID)

#### 3.1 Email Template Settings:
- **Template Name**: `Rarin Booking Request`
- **Subject**: `New Booking Request - {{service_type}} - {{customer_email}}`
- **From Name**: `Rarin Venue System`
- **From Email**: `rarin.mail@gmail.com`
- **To Email**: `{{to_email}}` (this will be rarin.mail@gmail.com)

#### 3.2 Template HTML Content:
Copy and paste this HTML into the template editor:

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #B8846B; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .booking-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .price { color: #B8846B; font-weight: bold; font-size: 18px; }
        .footer { background-color: #f5f5f5; padding: 10px; text-align: center; font-size: 12px; }
        .raw-data { background-color: #f0f0f0; padding: 10px; font-family: monospace; white-space: pre-line; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🏛️ Rarin Riverside - New Booking Request</h1>
    </div>
    
    <div class="content">
        <h2>📋 Customer Information</h2>
        <div class="booking-details">
            <p><strong>📧 Email:</strong> {{customer_email}}</p>
            <p><strong>📞 Phone:</strong> {{customer_phone}}</p>
            <p><strong>💬 Line ID:</strong> {{customer_line_id}}</p>
            <p><strong>📅 Preferred Event Date:</strong> {{event_date}}</p>
        </div>

        <h2>🎉 Booking Details</h2>
        <div class="booking-details">
            <p><strong>Service Type:</strong> {{service_type}}</p>
            <p><strong>Package:</strong> {{package_name}}</p>
            <p><strong>Number of Guests:</strong> {{guest_count}} people</p>
            <p><strong>Day Type:</strong> {{day_type}}</p>
            <p><strong>Time Period:</strong> {{period}}</p>
            <p class="price"><strong>💰 Total Price: {{total_price}}</strong></p>
        </div>

        <h2>📝 Special Requests</h2>
        <div class="booking-details">
            <p>{{special_request}}</p>
        </div>

        <h2>📄 Complete Details</h2>
        <div class="raw-data">{{email_body}}</div>

        <h2>� Technical Data</h2>
        <div class="booking-details">
            <p><strong>Booking Summary:</strong></p>
            <pre style="background: #f8f8f8; padding: 10px; border-radius: 5px; font-size: 11px;">{{booking_summary}}</pre>
        </div>

        <div style="margin-top: 30px; padding: 15px; background-color: #e8f4f8; border-radius: 5px;">
            <p><strong>⚡ Quick Actions:</strong></p>
            <p>1. Review customer details and requirements</p>
            <p>2. Check for PDF attachment below</p>
            <p>3. Contact customer within 24 hours</p>
            <p>4. Confirm booking details and availability</p>
        </div>
    </div>

    <div class="footer">
        <p>🏛️ Rarin Riverside Venue | 📧 rarin.mail@gmail.com | ☎️ 02-946-5625</p>
        <p>Generated automatically by Rarin Booking System</p>
    </div>
</body>
</html>
```

#### 3.3 Alternative: Manual PDF Attachment Methods

**Since EmailJS subscription limits automatic attachments, here are manual alternatives:**

#### **Option 1: Inline PDF Data in Email Body**
Add this to your EmailJS template HTML (safest method):

```html
<div style="margin-top: 20px; padding: 15px; background-color: #ffe6e6; border-radius: 5px;">
    <h3>📎 PDF Quote Data</h3>
    {{#if pdf_attachment}}
    <p>✅ <strong>PDF Quote Generated:</strong> {{pdf_filename}}</p>
    <p><strong>Download Link:</strong></p>
    <div style="background: #f0f0f0; padding: 10px; border-radius: 5px; font-size: 10px; word-break: break-all;">
        <p><strong>Copy this data and save as .pdf file:</strong></p>
        <textarea readonly style="width: 100%; height: 100px; font-family: monospace;">data:application/pdf;base64,{{pdf_attachment}}</textarea>
        <p><em>Instructions: Copy the entire text above, paste into a new browser tab's address bar, and it will download the PDF.</em></p>
    </div>
    {{else}}
    <p>❌ No PDF generated</p>
    {{/if}}
</div>
```

#### **Option 2: Cloud Storage Link Method**
Update your code to upload PDF to a temporary cloud service:

```javascript
// Add this function to BookingConfirmation.jsx
const uploadPDFToTempStorage = async (pdfBlob) => {
  try {
    // Using a free service like file.io (auto-deletes after 1 download)
    const formData = new FormData();
    formData.append('file', pdfBlob, 'booking-quote.pdf');
    
    const response = await fetch('https://file.io', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    return result.link; // Returns downloadable URL
  } catch (error) {
    console.error('PDF upload failed:', error);
    return null;
  }
};

// Then in your email data:
const pdfDownloadLink = await uploadPDFToTempStorage(pdfBlob);
if (pdfDownloadLink) {
  emailData.pdf_download_link = pdfDownloadLink;
}
```

#### **Option 3: Google Drive Integration**
Set up automatic Google Drive upload:

```javascript
// Add Google Drive API integration
const uploadToGoogleDrive = async (pdfBlob, fileName) => {
  // Requires Google Drive API setup
  // PDF gets uploaded to a shared folder
  // Returns shareable link
};
```

#### **Option 4: Simple Base64 Display in Email**
Most reliable for EmailJS free tier:

```html
<!-- Add to your EmailJS template -->
<div style="margin-top: 20px;">
    <h3>� PDF Quote Content</h3>
    {{#if pdf_attachment}}
    <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
        <p><strong>PDF File:</strong> {{pdf_filename}}</p>
        <p><strong>Size:</strong> {{pdf_attachment.length}} characters (base64)</p>
        
        <details>
            <summary style="cursor: pointer; font-weight: bold;">📋 Click to view PDF data (for manual download)</summary>
            <div style="margin-top: 10px; padding: 10px; background: white; border: 1px solid #ddd; border-radius: 3px;">
                <p><strong>Copy this entire text and save as "quote.pdf.txt", then rename to "quote.pdf":</strong></p>
                <textarea readonly style="width: 100%; height: 150px; font-family: monospace; font-size: 8px;">{{pdf_attachment}}</textarea>
                <p><em>Or copy and paste into: data:application/pdf;base64,[paste here] in browser address bar</em></p>
            </div>
        </details>
    </div>
    {{else}}
    <p>❌ No PDF data available</p>
    {{/if}}
</div>
```

### 4. Configure Template Variables
Make sure these variables are available in your template:

#### Required Variables:
- `to_email` - Recipient email (rarin.mail@gmail.com)
- `to_name` - Recipient name ("Rarin Team")
- `from_name` - Customer email
- `customer_email` - Customer email address
- `customer_phone` - Customer phone number
- `customer_line_id` - Customer Line ID
- `event_date` - Preferred event date
- `special_request` - Special requests
- `service_type` - Type of service (งานแต่งงาน/งานอีเวนต์/ถ่ายภาพ)
- `package_name` - Selected package name
- `guest_count` - Number of guests
- `day_type` - Day type (วันธรรมดา/วันหยุดสุดสัปดาห์)
- `period` - Time period
- `total_price` - Total price
- `booking_summary` - JSON booking data
- `email_body` - Formatted email body
- `pdf_attachment` - Base64 PDF data
- `pdf_filename` - PDF file name

### 5. Get API Credentials
1. Go to **"Account"** → **"API Keys"**
2. Copy your **Public Key**
3. Go back to **"Email Services"** and copy your **Service ID**
4. Go to **"Email Templates"** and copy your **Template ID**

### 6. Update Configuration File
Update the `emailjs-config.js` file with your actual credentials:

```javascript
export const EMAILJS_CONFIG = {
  serviceId: 'your_actual_service_id',        // From step 2
  templateId: 'your_actual_template_id',      // From step 3  
  publicKey: 'your_actual_public_key',        // From step 5
  targetEmail: 'rarin.mail@gmail.com'
};
```

### 7. Test the Setup
1. Save your configuration
2. Test the booking form on your website
3. Check if emails are received at `rarin.mail@gmail.com`
4. Verify PDF attachments work correctly

### 8. Gmail Security Settings (Important!)
For Gmail to work with EmailJS:

#### Method 1: App Password (Recommended)
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings → Security
   - 2-Step Verification → App passwords
   - Generate password for "EmailJS" or "Mail"
   - Use this 16-character password in EmailJS Gmail service setup (NOT your regular Gmail password)

#### Method 2: OAuth2 Setup (Alternative)
If App Password doesn't work, use OAuth2:

1. **In EmailJS Dashboard**:
   - Go to Email Services
   - Edit your Gmail service
   - Click "Connect Account" 
   - Choose "OAuth2" instead of "App Password"
   - Follow the authentication flow

2. **Grant Required Scopes**:
   - When connecting, make sure to grant these permissions:
   - ✅ Read, compose, send, and permanently delete emails
   - ✅ Manage drafts and send emails
   - ✅ Full Gmail access

#### Method 3: Less Secure App Access (Not Recommended)
Only if above methods fail:
1. Go to Google Account → Security
2. Enable "Less secure app access" (temporarily)
3. Test EmailJS connection
4. Disable after confirming it works
5. Switch back to App Password method

### 🚨 **Fixing "412 Gmail_API: Request had insufficient authentication scopes" Error:**

This specific error means Gmail doesn't have the right permissions. Here's how to fix it:

#### Step 1: Disconnect and Reconnect Gmail Service
1. In EmailJS dashboard → Email Services
2. Delete your existing Gmail service
3. Add new Gmail service
4. During setup, choose **"OAuth2"** method
5. Click "Connect Account"
6. **IMPORTANT**: When Google asks for permissions, click "Advanced" → "Go to EmailJS (unsafe)" if needed
7. Grant ALL requested permissions (don't skip any)

#### Step 2: Required Gmail API Scopes
Make sure EmailJS gets these scopes:
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/gmail.compose`
- `https://mail.google.com/` (full Gmail access)

#### Step 3: Alternative - Use SMTP Instead
If OAuth2 continues to fail:
1. In EmailJS, choose "Other" service instead of Gmail
2. Use these SMTP settings:
   - **SMTP Server**: `smtp.gmail.com`
   - **Port**: `587`
   - **Security**: `TLS`
   - **Username**: `rarin.mail@gmail.com`
   - **Password**: Your App Password (16 characters)

#### Step 4: Verify Service Settings
In your EmailJS Gmail service, confirm:
- ✅ Service is "Connected" (green status)
- ✅ Test email works from EmailJS dashboard
- ✅ From email is set to `rarin.mail@gmail.com`

### 9. Troubleshooting Tips

#### Common Issues:

**🔥 "412 Gmail_API: Request had insufficient authentication scopes"**
- **Solution**: Reconnect Gmail service using OAuth2 method
- Delete existing service → Add new service → Choose OAuth2
- Grant ALL permissions when Google asks
- Alternative: Use SMTP method with App Password

**"Unauthorized" error**
- Check Gmail app password setup
- Verify 2FA is enabled on Gmail
- Try OAuth2 connection method

**"Template not found" error**
- Verify Template ID matches exactly (case-sensitive)
- Check template is published/active

**"Service not found" error**
- Verify Service ID matches exactly
- Ensure service shows as "Connected" in dashboard

**"PDF not attached" error**
- Check base64 encoding in code
- Verify PDF generation doesn't fail
- Check file size (EmailJS has 50KB limit for attachments)

#### Testing Tips:
- Use EmailJS dashboard test feature first
- Check browser console for error messages
- Verify all template variables are being sent
- Test with small PDF files first

### 10. Production Checklist
- ✅ Gmail service connected and tested
- ✅ Email template created with all variables
- ✅ API keys copied to config file
- ✅ PDF attachment working
- ✅ Email delivery tested
- ✅ All booking data appears correctly in email

## Support
- EmailJS Documentation: https://www.emailjs.com/docs/
- EmailJS FAQ: https://www.emailjs.com/faq/
- For issues: Check EmailJS dashboard logs

---
*Last updated: November 8, 2025*