import { Bot, BotConfig } from './Bot';
import { exec } from 'child_process';

function init(config: BotConfig): Promise<Bot> {
  // const bot = new Bot(config);
  return checkConfiguration(config)
    .then((validConfig) => {
      return new Bot(validConfig);
    })
    .finally(() => {
      checkPackageVersion();
    });
}

function checkConfiguration(config: BotConfig): Promise<BotConfig> {
  if (config.token === undefined || config.token === '') {
    throw new Error('No token provided in the configuration !');
  }

  if (!config.name) console.warn("⚠️ No name provided in the configuration, using default name : 'Discord Bot'");

  if (!config.options)
    console.warn(
      "⚠️ No options provided in the configuration, using default options : { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] }",
    );

  if (!config.prefix) console.warn("⚠️ No prefix provided in the configuration, using default prefix : '/'");

  if (!config.defaultCommandsDisabled)
    console.warn(
      '⚠️ No defaultCommandsDisabled provided in the configuration, using default defaultCommandsDisabled : []',
    );

  if (config.autoLog === undefined)
    console.warn('⚠️ No autoLog provided in the configuration, using default autoLog : false');

  if (!config.adminRole)
    console.warn("⚠️ No adminRole provided in the configuration, using default adminRole : 'Admin'");

  config.name = config.name || 'Discord Bot';
  config.options = config.options || { intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent'] };
  config.prefix = config.prefix || '/';
  config.defaultCommandsDisabled = config.defaultCommandsDisabled || [];
  config.autoLog = config.autoLog || false;
  config.adminRole = config.adminRole || 'Admin';

  return Promise.resolve(config);
}

function checkPackageVersion() {
  const packageJson = require('../package.json');
  const userPackageJson = require(`${require.main?.path}/package.json`);
  exec(`npm show ${packageJson.name} version`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error(exec) during version check process: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`Error(stderr) during version check process: ${stderr}`);
      return;
    }
    if (stdout) {
      const npmPackageVersion = stdout.trim();
      const userPackageVersion = userPackageJson.dependencies[packageJson.name].replace('^', '');

      if (npmPackageVersion !== userPackageVersion) {
        console.warn(
          '\x1b[32m%s\x1b[0m',
          `⚠️ You are using an outdated version of ${
            packageJson.name
          } ! Please update to the latest version (${stdout.trim()})`,
        );
      }

      const packageDiscordVersionDependency = packageJson.dependencies['discord.js'].replace('^', '');
      const userDiscordVersionDependency = userPackageJson.dependencies['discord.js'].replace('^', '');
      if (packageDiscordVersionDependency !== userDiscordVersionDependency) {
        console.warn(
          '\x1b[32m%s\x1b[0m',
          `🧨 You are using a different version of discord.js ! Please update discord.js package version to ${packageDiscordVersionDependency} for the best compatibility with ${packageJson.name}.`,
        );
      }
    }
  });
}

export { init };
