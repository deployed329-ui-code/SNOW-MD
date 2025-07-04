import chalk from 'chalk';

export async function Callupdate(call, sock) {
  try {
    for (const update of call) {
      const callerId = update.from;
      console.log(chalk.red(`📞 Appel détecté de ${callerId}`));

      if (update.status === 'offer') {
        await sock.updateBlockStatus(callerId, 'block');
        await sock.sendMessage(callerId, {
          text: `🚫 Les appels sont interdits. Tu as été bloqué temporairement.`,
        });
      }
    }
  } catch (err) {
    console.error("❌ Erreur Callupdate:", err);
  }
}
