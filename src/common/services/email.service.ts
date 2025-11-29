import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private sendgridApiKey: string;
  private fromEmail: string;
  private appUrl: string;
  private isConfigured: boolean;

  constructor(private configService: ConfigService) {
    this.sendgridApiKey =
      this.configService.get<string>('SENDGRID_API_KEY') || '';
    this.fromEmail =
      this.configService.get<string>('SENDGRID_FROM_EMAIL') ||
      'shaiqishtiaq9@gmail.com';
    this.appUrl =
      this.configService.get<string>('APP_URL') || 'http://localhost:3000';

    this.isConfigured = !!(this.sendgridApiKey && this.fromEmail);

    if (this.isConfigured) {
      sgMail.setApiKey(this.sendgridApiKey);
      this.logger.log('SendGrid email service configured');
    } else {
      this.logger.warn(
        'SendGrid not configured - password reset emails will not be sent. Configure SENDGRID_API_KEY and SENDGRID_FROM_EMAIL to enable email service.',
      );
    }
  }

  /**
   * Send password reset email with reset link
   */
  async sendPasswordResetEmail(
    email: string,
    firstName: string,
    resetToken: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Email service not configured. Password reset link for ${email}: http://localhost:3000/reset-password?token=${resetToken}`,
      );
      return;
    }

    const resetLink = `${this.appUrl}/reset-password?token=${resetToken}`;

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hi ${firstName},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        <p>Or copy and paste this link:</p>
        <p><code>${resetLink}</code></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/>Auth Practice Team</p>
      `,
      text: `
        Password Reset Request
        
        Hi ${firstName},
        
        You requested to reset your password. Use this link to reset it:
        ${resetLink}
        
        This link will expire in 1 hour.
        
        If you did not request this, please ignore this email.
        
        Best regards,
        Auth Practice Team
      `,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${email}:`,
        error,
      );
      throw new BadRequestException('Failed to send password reset email');
    }
  }

  /**
   * Send password changed confirmation email
   */
  async sendPasswordChangedEmail(
    email: string,
    firstName: string,
  ): Promise<void> {
    if (!this.isConfigured) {
      this.logger.warn(
        `Email service not configured. Password change confirmation email would be sent to ${email}`,
      );
      return;
    }

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Password Changed Successfully',
      html: `
        <h2>Password Changed</h2>
        <p>Hi ${firstName},</p>
        <p>Your password has been changed successfully.</p>
        <p>If you did not make this change, please reset your password immediately.</p>
        <p>Best regards,<br/>Auth Practice Team</p>
      `,
      text: `
        Password Changed
        
        Hi ${firstName},
        
        Your password has been changed successfully.
        
        If you did not make this change, please reset your password immediately.
        
        Best regards,
        Auth Practice Team
      `,
    };

    try {
      await sgMail.send(msg);
      this.logger.log(`Password changed confirmation email sent to ${email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password changed email to ${email}:`,
        error,
      );
      throw new BadRequestException('Failed to send password changed email');
    }
  }
}
