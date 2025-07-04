const emojis = ['🔥','❄️','⚡','✨','💎','🦅','🐺','👑','🔱','🩸'];

export async function doReact(emoji, msg, sock) {
  try {
    await sock.sendMessage(msg.key.remoteJid, {
      react: { text: emoji, key: msg.key }
    });
  } catch (e) {
    console.error('AutoReact error:', e);
  }
}

export default { emojis, doReact };
