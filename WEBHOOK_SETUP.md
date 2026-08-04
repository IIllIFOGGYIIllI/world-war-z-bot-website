# GitHub Website Update Webhook (Optional)

This separate optional webhook posts website repository updates into a Discord channel whenever files are committed to GitHub. It is not used by the dashboard-managed moderation notification system in version 1.17.0.

Dashboard moderation webhooks are created and routed by the bot from **Owner → Notifications & webhooks**. Do not paste those bot-managed webhook URLs into GitHub.

## Recommended Discord settings

- **Channel name:** `#website-updates`
- **Webhook name:** `World War Z Website Updates`
- **Webhook avatar:** World War Z Bot icon

In Discord, open **Server Settings**, select **Integrations**, open **Webhooks**, and create a new webhook. Choose the `#website-updates` channel and select **Copy Webhook URL**.

Treat the copied URL like a password. Do not post it in chat, place it in the public repository or share it with members.

## GitHub webhook fields

Open the `world-war-z-bot-website` repository, then select **Settings** → **Webhooks** → **Add webhook**.

- **Payload URL:** Paste the Discord webhook URL and add `/github` to the end.
- **Content type:** `application/json`
- **Secret:** Leave blank for the direct Discord integration.
- **Which events:** `Just the push event`
- **Active:** Enabled

Example format only:

`https://discord.com/api/webhooks/WEBHOOK_ID/WEBHOOK_TOKEN/github`

Do not use the example as your real URL. GitHub should send a test delivery after the webhook is added.

## What it will do

Whenever website files are committed to the repository, GitHub will post the update into `#website-updates`. This webhook does not host the website and it does not contain the Discord bot token.
