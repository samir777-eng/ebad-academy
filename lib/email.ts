// Email notification system for Ebad Academy
// This is a placeholder implementation that logs emails to console
// In production, integrate with services like SendGrid, Resend, or AWS SES

type EmailTemplate = {
  subject: string;
  html: string;
  text: string;
};

type WelcomeEmailData = {
  name: string;
  email: string;
};

type BadgeEarnedEmailData = {
  name: string;
  email: string;
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
};

type LevelUnlockedEmailData = {
  name: string;
  email: string;
  levelNumber: number;
  levelName: string;
};

type InactivityReminderEmailData = {
  name: string;
  email: string;
  daysSinceLastActivity: number;
};

export async function sendEmail(
  to: string,
  template: EmailTemplate
): Promise<boolean> {
  // In production, replace this with actual email service
  console.log("📧 Email would be sent:");
  console.log("To:", to);
  console.log("Subject:", template.subject);
  console.log("HTML:", template.html);
  console.log("Text:", template.text);
  console.log("---");

  // Simulate successful send
  return true;
}

export function createWelcomeEmail(data: WelcomeEmailData): EmailTemplate {
  return {
    subject: "Welcome to Ebad Academy! 🎓",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to Ebad Academy!</h1>
        <p>Hi ${data.name},</p>
        <p>We're excited to have you join our Islamic learning community!</p>
        <p>Start your journey by exploring our 4 progressive levels, each with 6 branches of Islamic knowledge:</p>
        <ul>
          <li>Aqeedah (Creed)</li>
          <li>Fiqh (Jurisprudence)</li>
          <li>Seerah (Biography of the Prophet)</li>
          <li>Tafseer (Quranic Exegesis)</li>
          <li>Hadith Sciences</li>
          <li>Tarbiyah (Spiritual Development)</li>
        </ul>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Start Learning
          </a>
        </p>
        <p>May Allah bless your learning journey!</p>
        <p>Best regards,<br>Ebad Academy Team</p>
      </div>
    `,
    text: `Welcome to Ebad Academy!

Hi ${data.name},

We're excited to have you join our Islamic learning community!

Start your journey by exploring our 4 progressive levels, each with 6 branches of Islamic knowledge:
- Aqeedah (Creed)
- Fiqh (Jurisprudence)
- Seerah (Biography of the Prophet)
- Tafseer (Quranic Exegesis)
- Hadith Sciences
- Tarbiyah (Spiritual Development)

Visit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard to start learning.

May Allah bless your learning journey!

Best regards,
Ebad Academy Team`,
  };
}

export function createBadgeEarnedEmail(
  data: BadgeEarnedEmailData
): EmailTemplate {
  return {
    subject: `🏆 You earned a new badge: ${data.badgeName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Congratulations! 🎉</h1>
        <p>Hi ${data.name},</p>
        <p>You've earned a new badge!</p>
        <div style="text-align: center; padding: 30px; background: linear-gradient(to bottom right, #fef3c7, #fed7aa); border-radius: 12px; margin: 20px 0;">
          <div style="font-size: 64px; margin-bottom: 10px;">${data.badgeIcon}</div>
          <h2 style="margin: 10px 0; color: #92400e;">${data.badgeName}</h2>
          <p style="color: #78350f;">${data.badgeDescription}</p>
        </div>
        <p>Keep up the great work! Continue your learning journey to earn more badges.</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Continue Learning
          </a>
        </p>
        <p>Best regards,<br>Ebad Academy Team</p>
      </div>
    `,
    text: `Congratulations!

Hi ${data.name},

You've earned a new badge!

${data.badgeIcon} ${data.badgeName}
${data.badgeDescription}

Keep up the great work! Continue your learning journey to earn more badges.

Visit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard to continue learning.

Best regards,
Ebad Academy Team`,
  };
}

export function createLevelUnlockedEmail(
  data: LevelUnlockedEmailData
): EmailTemplate {
  return {
    subject: `🎓 Level ${data.levelNumber} Unlocked!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Level ${data.levelNumber} Unlocked! 🎉</h1>
        <p>Hi ${data.name},</p>
        <p>Congratulations on completing Level ${data.levelNumber - 1}!</p>
        <p>You've unlocked <strong>${
          data.levelName
        }</strong> and can now access new lessons and challenges.</p>
        <p>Keep up the excellent work and continue your journey of Islamic knowledge!</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Explore Level ${data.levelNumber}
          </a>
        </p>
        <p>May Allah continue to bless your learning!</p>
        <p>Best regards,<br>Ebad Academy Team</p>
      </div>
    `,
    text: `Level ${data.levelNumber} Unlocked!

Hi ${data.name},

Congratulations on completing Level ${data.levelNumber - 1}!

You've unlocked ${data.levelName} and can now access new lessons and challenges.

Keep up the excellent work and continue your journey of Islamic knowledge!

Visit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard to explore Level ${
      data.levelNumber
    }.

May Allah continue to bless your learning!

Best regards,
Ebad Academy Team`,
  };
}

export function createInactivityReminderEmail(
  data: InactivityReminderEmailData
): EmailTemplate {
  return {
    subject: "We miss you at Ebad Academy! 📚",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">We Miss You! 📚</h1>
        <p>Hi ${data.name},</p>
        <p>It's been ${data.daysSinceLastActivity} days since your last visit to Ebad Academy.</p>
        <p>Your learning journey is waiting for you! Come back and continue building your Islamic knowledge.</p>
        <p>Remember: Consistency is key to success. Even a few minutes a day can make a big difference!</p>
        <p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
             style="display: inline-block; padding: 12px 24px; background: linear-gradient(to right, #2563eb, #7c3aed); color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Continue Learning
          </a>
        </p>
        <p>We're here to support you every step of the way!</p>
        <p>Best regards,<br>Ebad Academy Team</p>
      </div>
    `,
    text: `We Miss You!

Hi ${data.name},

It's been ${data.daysSinceLastActivity} days since your last visit to Ebad Academy.

Your learning journey is waiting for you! Come back and continue building your Islamic knowledge.

Remember: Consistency is key to success. Even a few minutes a day can make a big difference!

Visit ${process.env.NEXT_PUBLIC_APP_URL}/dashboard to continue learning.

We're here to support you every step of the way!

Best regards,
Ebad Academy Team`,
  };
}
