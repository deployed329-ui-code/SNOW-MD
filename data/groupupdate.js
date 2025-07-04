import chalk from 'chalk';
import fs from 'fs-extra';
import config from '../config.js';

export async function GroupUpdate(sock, group) {
  try {
    const { id, participants, action, author } = group; // `author` = qui a initié l'action

    const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    // Charger welcome status pour le reste du script (pas modifié)
    let welcomeData = { enabled: false };
    if (await fs.exists('./lib/welcome.json')) {
      welcomeData = JSON.parse(await fs.readFile('./lib/welcome.json'));
    }

    participants.forEach(async participant => {
      if (action === 'add') {
        console.log(chalk.green(`👤 ${participant} a rejoint ${id}`));
        if (welcomeData.enabled) {
          try {
            const welcomeCmd = (await import('../snow/welcome.js')).default;
            const fakeMsg = { key: { remoteJid: id, participant }, message: { conversation: '!welcome' } };
            await welcomeCmd.execute(sock, fakeMsg, []);
          } catch (err) {
            console.error("Erreur appel automatique welcome :", err);
          }
        }
      }

      // 🛡️ Anti-PROMOTE
      else if (action === 'promote') {
        console.log(chalk.red(`⚠️ Tentative de promotion: ${author} ➔ ${participant}`));
        if (author !== ownerJid && author !== botJid) {
          await sock.groupParticipantsUpdate(id, [participant], 'demote'); // annuler
          await sock.groupParticipantsUpdate(id, [author], 'demote'); // punir
          await sock.sendMessage(id, { text: `🚫 @${author.split('@')[0]} a tenté de promote sans permission et a été demote.`, mentions: [author] });
        }
      }

      // 🛡️ Anti-DEMOTE
      else if (action === 'demote') {
        console.log(chalk.red(`⚠️ Tentative de demotion: ${author} ➔ ${participant}`));
        if (author !== ownerJid && author !== botJid) {
          await sock.groupParticipantsUpdate(id, [participant], 'promote'); // restaurer
          await sock.groupParticipantsUpdate(id, [author], 'demote'); // punir
          await sock.sendMessage(id, { text: `🚫 @${author.split('@')[0]} a tenté de demote sans permission et a été demote.`, mentions: [author] });
        }
      }

      // 🛡️ Anti-KICK
      else if (action === 'remove') {
        console.log(chalk.red(`⚠️ Tentative de kick: ${author} ➔ ${participant}`));
        if (author !== ownerJid && author !== botJid) {
          // essayer de réinviter
          try {
            await sock.groupParticipantsUpdate(id, [participant], 'add');
          } catch (e) {
            console.log(chalk.yellow(`ℹ️ Impossible de réinviter ${participant}: ${e.message || e}`));
          }
          await sock.groupParticipantsUpdate(id, [author], 'remove'); // expulser le fautif
          await sock.sendMessage(id, { text: `🚫 @${author.split('@')[0]} a tenté de kick sans permission et a été expulsé.`, mentions: [author] });
        }
      }
    });
  } catch (err) {
    console.error("❌ Erreur GroupUpdate:", err);
  }
}
