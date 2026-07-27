import { groupModel, userModel } from '#storage/models/index.js'
import { logger } from '#helpers/logger.js'

export async function onGroupParticipantsUpdate({ id, participants, action }, sock) {
  if (!id || !participants?.length) return

  try {
    const group = groupModel.find(id)

    if (action === 'add') {
      if (!group?.welcome) return
      const meta = await sock.groupMetadata(id).catch(() => null)

      for (const participant of participants) {
        const jid = participant.phoneNumber || participant.id
        userModel.ensure(jid)

        const pushName = meta?.participants?.find(p => p.id === jid)?.notify ?? jid.split('@')[0]
        const groupName = meta?.subject ?? 'this group'
        const memberCount = meta?.participants?.length ?? 0

        const msg = group.welcome_msg
          ? group.welcome_msg.replace(/{name}/gi, `@${jid.split('@')[0]}`)
              .replace(/{group}/gi, groupName).replace(/{count}/gi, memberCount.toString())
          : `Selamat datang @${jid.split('@')[0]}! Kamu anggota ke-${memberCount} di ${groupName}`

        await sock.sendMessage(id, { text: msg, mentions: [jid] })
          .catch(err => logger.warn({ err: err.message }, 'Welcome send failed'))
      }
    }

    if (action === 'remove') {
      if (!group?.welcome) return
      for (const participant of participants) {
        const jid = participant.phoneNumber || participant.id
        const meta = await sock.groupMetadata(id).catch(() => null)
        const groupName = meta?.subject ?? 'this group'
        await sock.sendMessage(id, {
          text: `@${jid.split('@')[0]} has left ${groupName}. Goodbye!`,
          mentions: [jid],
        }).catch(err => logger.warn({ err: err.message }, 'Leave send failed'))
      }
    }

    if (action === 'promote') logger.debug({ id, participants }, 'Members promoted')
    if (action === 'demote') logger.debug({ id, participants }, 'Members demoted')

  } catch (err) {
    logger.error({ err, id, action }, 'Group participant update error')
  }
}
