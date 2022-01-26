import { getLatestRelease } from './memfaultClient';
import { sendMessage } from './discordClient';

addEventListener('scheduled', event => {
  event.waitUntil(handleScheduledEvent(event.scheduledTime))
})

// addEventListener("fetch", event => {
//   return event.respondWith(handleRequest(event.request))
// });

async function handleScheduledEvent(scheduledTime: number) {
  // Fetch some data
  // Update API
  await checkForFirmwareUpdates();
}

// async function handleRequest(request: Request): Promise<Response> {
//   const results = await checkForFirmwareUpdates();
//   return new Response(results);
// }

async function checkForFirmwareUpdates(): Promise<string> {
  try {

    let currentVersion = await STATE.get('current_version');
    if (!currentVersion) {
      currentVersion = '1.7.0';
      await STATE.put('current_version', currentVersion);
    }

    const results = await getLatestRelease({
      hardware_version: 'dvt1',
      software_type: 'pdfw',
      current_version: currentVersion,
      device_serial: PLAYDATE_SERIAL
    });

    if (currentVersion !== results.version) {

      await STATE.put('current_version', results.version);

      await sendMessage({
        username: 'Playupdate Bot',
        embeds: [{
          type: 'rich',
          title: `New Playdate firmware detected (v${results.display_name})`,
          color: 0xffc833,
          fields: [
            {
              name: 'Revision',
              value: results.revision,
              inline: true
            },
            {
              name: 'Created',
              value: results.created_date,
              inline: true
            },
          ].concat(results.artifacts.map(artifact => ({
            name: `${artifact.filename}`,
            value: `MD5: ${artifact.md5}`,
            inline: false
          }))),
        }]
      });
    }
  }
  catch (e: any) {
    if (e.type)
      return `Memfault Error: ${e.type} ${e.message}`;
    return `Error: ${e.message}`;
  }

  return '';
}
