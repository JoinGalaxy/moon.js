const { Client, GatewayIntentBits } = require("discord.js");
const handleMessage = require("../handlers/messageHandler");
const colors = require("colors");
const logTable = require("../utils/logTable.js");
const loadCommands = require("../handlers/commandHandler.js");
const loadEvents = require("../handlers/eventHandler.js");

const INTENT_MAP = {
  GUILDS: GatewayIntentBits.Guilds,
  GUILD_MEMBERS: GatewayIntentBits.GuildMembers,
  GUILD_MESSAGES: GatewayIntentBits.GuildMessages,
  MESSAGE_CONTENT: GatewayIntentBits.MessageContent
};

class Moon {
  constructor(options = {}) {
    const {
      token,
      prefix = "!",
      intents = ["GUILDS", "GUILD_MESSAGES", "MESSAGE_CONTENT"]
    } = options;

    this.prefix = prefix;
    this.commands = [];

    const resolvedIntents = intents.map(i => INTENT_MAP[i] ?? null).filter(Boolean);
    this.client = new Client({ intents: resolvedIntents });

    this.client.on("messageCreate", message => handleMessage(message, this));

    if (!token) {
      logTable("Moon Critical Error", ["Bot token not provided."], {
        header: "red",
        lines: "yellow",
        borders: "grey"
      });
      process.exit(1);
    }
    
    this.client.login(token).catch(error => {
      logTable("Moon Login Error", [`${error.message}`], {
        header: "red",
        lines: "yellow",
        borders: "grey"
      });
      process.exit(1);
    });

    this.client.on("ready", client => {
      logTable("Moon Client Logged In", [`${client.user.tag}`], {
        header: "cyan",
        lines: null,
        borders: "grey"
      });
    });

    this.client.on("error", error => {
      logTable("Moon Client Error", [`${error.message}`], {
        header: "red",
        lines: "yellow",
        borders: "grey"
      });
      process.exit(1);
    });
  }

  static connect(options) {
    const instance = new Moon(options);
    Moon._setInstance(instance);
    return instance;
  }

  command(commandObject) {
    this.commands.push(commandObject);
  }

  static config(paths = {}) {
    const instance = this.prototype._instance;
    if (!instance) {
      logTable("Moon Client Error", ["Moon.connect needs to be called before Moon.config"], {
        header: "red",
        lines: "yellow",
        borders: "grey"
      });
      process.exit(1);
    }

    if (paths.functionSyntax) {
      instance.functionSyntax = paths.functionSyntax;
    }

    if (paths.commands) loadCommands(paths.commands, instance);
    if (paths.events) loadEvents(paths.events, instance.client, instance);
  }

  static _setInstance(instance) {
    this.prototype._instance = instance;
  }
}

module.exports = Moon;