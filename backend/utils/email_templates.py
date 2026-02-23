def get_reset_password_email(reset_link: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">SurePay</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Enterprise Payment Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h2 style="margin:0 0 12px;color:#1a1a2e;font-size:22px;font-weight:700;">Reset Your Password</h2>
              <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                We received a request to reset the password for your SurePay enterprise account.
                Click the button below to set a new password. This link is valid for <strong>15 minutes</strong>.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);border-radius:10px;">
                    <a href="{reset_link}"
                       style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.3px;">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <!-- Link fallback -->
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">
                If the button doesn't work, copy and paste this link into your browser:
              </p>
              <p style="margin:0 0 24px;word-break:break-all;">
                <a href="{reset_link}" style="color:#4F46E5;font-size:13px;">{reset_link}</a>
              </p>

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                      ⚠️ <strong>Didn't request this?</strong> If you didn't request a password reset,
                      you can safely ignore this email. Your password will not be changed.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">
                This email was sent by <strong>SurePay</strong> · Enterprise Payment Platform
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2025 SurePay. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def get_otp_email(otp: str, purpose: str = "verification") -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your OTP</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">SurePay</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">Enterprise Payment Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;text-align:center;">
              <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:22px;font-weight:700;">Your Verification Code</h2>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Use the code below to complete your {purpose}. It expires in <strong>5 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f0f0ff;border:2px dashed #4F46E5;border-radius:14px;padding:24px 40px;display:inline-block;margin-bottom:28px;">
                <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:16px;color:#4F46E5;font-family:'Courier New',monospace;">
                  {otp}
                </p>
              </div>

              <p style="margin:0 0 28px;color:#9ca3af;font-size:13px;">
                Do not share this code with anyone.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <!-- Warning box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#fef9c3;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;text-align:left;">
                    <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                      ⚠️ <strong>Didn't request this?</strong> If you didn't request this code,
                      please ignore this email or contact support immediately.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:24px 40px;text-align:center;">
              <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">
                This email was sent by <strong>SurePay</strong> · Enterprise Payment Platform
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2025 SurePay. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""