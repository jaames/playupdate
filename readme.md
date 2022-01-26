# Playupdate

Bot that periodically checks [Memfault](https://memfault.com/) for Playdate firmware updates and notifies a Discord channel when a new one is detected, so reverse engineers and super-enthusiasts can be alerted of updates as soon as they happen. It's inspired by the [ylws8 twitter bot](https://twitter.com/ylws8bot).

## Setting Up

This bot is built as a [Cloudflare worker](https://workers.cloudflare.com/), and it should be possible to deploy it there under the free tier. It's recommended to use the [wrangler](https://developers.cloudflare.com/workers/cli-wrangler/install-update) command-line tool for easy setup.

### Set up config file

Copy `wrangler.example.toml` to `wrangler.toml`.

### Set up key-value storage

A KV store is used to keep track of the current firmware version, so we need to create one called `STATE`:

`wrangler kv:namespace create --preview "STATE"`

Then follow the instructions to add the KV to your `wrangler.toml`.

### Secrets

These secret constants are set with `wrangler secret put <name>`:

| Name | Value |
|:-|:-|
| `WEBHOOK_URL` | [Discord Webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) for the channel you want to send messages into |
| `PLAYDATE_SERIAL` | A Playdate serial number to pass to Memfault |
| `MEMFAULT_PROJECT_KEY` | Playdate Memfault project key - can be obtained from firmware, but that's left as an exercise for the reader :) |

### Tweaking interval

The cron schedule interval can be adjusted in `wrangler.toml`. By default it checks every 15 minutes.

### Publish

Use `wrangler publish` to publish a live instance of this bot.