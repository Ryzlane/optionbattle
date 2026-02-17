import nodemailer from 'nodemailer';

// Transporter Nodemailer (SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 2525,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Helper générique d'envoi
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@optionbattle.com',
      to,
      subject,
      html
    });
    console.log(`✉️ Email envoyé à ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Erreur envoi email à ${to}:`, error);
    throw error;
  }
};

// Email password reset
export const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <!-- Header avec fond ambre -->
      <div style="background: linear-gradient(135deg, #B45309 0%, #92400E 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">⚔️ OptionBattle</h1>
        <p style="color: #FED7AA; margin: 10px 0 0 0; font-size: 14px;">Let your options fight it out</p>
      </div>

      <!-- Contenu -->
      <div style="padding: 40px 30px; background: #FEFEFE;">
        <h2 style="color: #1F2937; font-size: 22px; margin: 0 0 20px 0;">Réinitialisation de mot de passe</h2>
        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
          Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #B45309; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(180, 83, 9, 0.3);">
            Réinitialiser mon mot de passe
          </a>
        </div>

        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #92400E; margin: 0; font-size: 14px;">
            ⏱️ Ce lien expire dans <strong>15 minutes</strong>.
          </p>
        </div>

        <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0;">
          Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F9FAFB; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          OptionBattle - L'arène où vos options combattent
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, '⚔️ Réinitialisation de votre mot de passe - OptionBattle', html);
};

// Email confirmation suppression compte
export const sendAccountDeletedEmail = async (email, userName) => {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <!-- Header avec fond rouge danger -->
      <div style="background: linear-gradient(135deg, #991B1B 0%, #7F1D1D 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">⚔️ OptionBattle</h1>
        <p style="color: #FEE2E2; margin: 10px 0 0 0; font-size: 14px;">Let your options fight it out</p>
      </div>

      <!-- Contenu -->
      <div style="padding: 40px 30px; background: #FEFEFE;">
        <h2 style="color: #1F2937; font-size: 22px; margin: 0 0 20px 0;">Compte supprimé</h2>
        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 20px 0;">
          Bonjour <strong>${userName || 'Combattant'}</strong>,
        </p>

        <div style="background: #FEE2E2; border-left: 4px solid #DC2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <p style="color: #991B1B; margin: 0 0 10px 0; font-weight: 600; font-size: 16px;">
            ⚠️ Votre compte OptionBattle a été définitivement supprimé.
          </p>
          <p style="color: #7F1D1D; margin: 0; font-size: 14px; line-height: 1.6;">
            Toutes vos données ont été effacées : battles, arènes, collaborations et statistiques.
          </p>
        </div>

        <p style="color: #4B5563; line-height: 1.6; margin: 20px 0 0 0;">
          Nous espérons vous revoir bientôt dans l'arène ! ⚔️
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F9FAFB; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          OptionBattle - L'arène où vos options combattent
        </p>
      </div>
    </div>
  `;
  return sendEmail(email, '⚠️ Votre compte OptionBattle a été supprimé', html);
};

// Email invitation battle/arena (NOUVEAU - à intégrer)
export const sendInvitationEmail = async (recipientEmail, inviterName, entityType, entityTitle, joinUrl) => {
  const typeLabel = entityType === 'battle' ? 'battle' : 'arène';
  const typeIcon = entityType === 'battle' ? '⚔️' : '🏛️';
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
      <!-- Header avec fond ambre -->
      <div style="background: linear-gradient(135deg, #B45309 0%, #92400E 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #fff; margin: 0; font-size: 28px; font-weight: bold;">⚔️ OptionBattle</h1>
        <p style="color: #FED7AA; margin: 10px 0 0 0; font-size: 14px;">Let your options fight it out</p>
      </div>

      <!-- Contenu -->
      <div style="padding: 40px 30px; background: #FEFEFE;">
        <h2 style="color: #1F2937; font-size: 22px; margin: 0 0 20px 0;">${typeIcon} Nouvelle invitation</h2>
        <p style="color: #4B5563; line-height: 1.6; margin: 0 0 10px 0;">
          <strong style="color: #B45309;">${inviterName}</strong> vous invite à rejoindre ${entityType === 'battle' ? 'sa battle' : 'son arène'} :
        </p>

        <!-- Titre de la battle/arène -->
        <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 100%); padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #B45309;">
          <h3 style="color: #92400E; margin: 0; font-size: 20px; font-weight: bold;">
            ${entityTitle}
          </h3>
        </div>

        <p style="color: #6B7280; line-height: 1.6; margin: 0 0 30px 0; font-size: 14px;">
          ${entityType === 'battle' ? '🎯 Collaborez et faites combattre vos options ensemble !' : '🏛️ Rejoignez cette arène pour créer et gérer des battles en équipe !'}
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${joinUrl}" style="display: inline-block; background: #10B981; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
            Rejoindre maintenant
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F9FAFB; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #E5E7EB;">
        <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
          OptionBattle - L'arène où vos options combattent
        </p>
      </div>
    </div>
  `;
  return sendEmail(recipientEmail, `${typeIcon} Invitation à rejoindre "${entityTitle}" - OptionBattle`, html);
};
