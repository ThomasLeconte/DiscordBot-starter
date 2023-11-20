<h1 align="center">Discord starter package</h1>
<div align="center">
<img src=https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg alt=html5 width="30" height="30"/>
<img src=https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg alt=html5 width="30" height="30"/>
</div>

---

Little package for start a discord bot fastly and easily, allowing you to focus on bot features.

## Summary

[How use it ?](#how-use-it)  
[Commands (**New features since v2.4.0**)](#commands)  
[Messages](#message)  
[Embed pagination](#embeds-pagination)  
[Modal Constructor](#modal-constructor)  
[Message component event handling](#message-component-event-handling)  
[Context menu interaction](#context-menu-interaction)  
[Webhooks](#webhooks)  
[Log](#log)

## How use it

**First of all, run `npm install discord-starter-package` for install this package on your project**.

Then, you can init your bot instance with `init()` method :

```js
//main.js
const { init } = require('discord-starter-package');

const bot = init({
  options: null,
  token: 'yourToken',
});
```

This method take many options :

```json
{
  "name": "Discord bot", //optional
  "token": "YourBotPrivateToken",
  "prefix": "/",
  "autoLog": false,
  "adminRole": "admin", //optional
  "options": {}, //ClientOptions instance
  "webhooks": [], //optional
  "commandFolders": [], //optional
  "commandsDisabled": [] //optional, to disable all use: ["disableCommand", "feedback", "help", "ping"]
}
```

Have a look to all properties :
|     argument    | Required | Type | Default | Description |
|:--------------:|:-----------:|:-----------:|:-----------:|:-----------:|
| name | ✅ | String | - | Your bot name |
| token | ✅ | String | - | Your bot private token |
| prefix | ❌ | String | `/` | Prefix for basic commands (does not work with slash commands!). Ex. of `"prefix": "!"` the `ping` command will listen to the Discord message `!ping` instead of `ping`. |
| autoLog | ❌ | Boolean | `false` | Define if you want automatic logs when commands are executed for see command name, player and arguments provided. |
| adminRole | ❌ | String | `Admin` | Your bot name |
| options | ❌ | [Discord.ClientOptions](https://old.discordjs.dev/#/docs/discord.js/14.11.0/typedef/ClientOptions) | `{ "intents": [ "Guilds", "GuildMembers", "GuildMessages", "MessageContent" ] }` | Options that you want to add on your bot. This property is just a copy of `Discord.CLientOptions` class. |
| webhooks | ❌ | `{name: String; url: String}` | - | Your bot name |
| commandsDisabled | ❌ | String[] | `[]` | List of commands you want to disable. You can disable one of defaults commands: `help`, `disableCommand`, `feedback`, `ping`, `reload` |
| commandFolders | ❌ | String[] | `["commands"]` | Folders the bot loads commands from, relative to your root folder. |
| | | |

Finally, you can launch your discord bot with `node main.js` or `ts-node main.ts` if you're using Typescript.

#### **An example of implementation has been made in ["example" folder](https://github.com/ThomasLeconte/discord-starter-package/tree/master/example) of this repository.**

## Commands
Your commands must either be located in a `commands` folder at root of your project, or in folders configured through the `commandFolders` array given on initialization, to be detected during bot initialization.Then, each command can be declared with `module.exports` or with a **default exported class**. 

|     argument    | Required | Type | Default | Description |
|:--------------:|:-----------:|:-----------:|:-----------:|:-----------:|
| **name** | ✅ | String | - | Name of command |
| **description** | ✅ | String | - | Description of command displayed in `help` command result |
| **usage** | ✅ | String | - | Usage of command displayed in `help` |
| **admin** | ✅ | Boolean | - | Permission guard |
| **roles** | ❌ | String[] | - | Roles needed to execute command |
| **slashCommand** | ❌ | {data: SlashCommandBuilder} | - | data of Slash-Command to initialize |
| **private** | ❌ | Boolean | `false` | Send result in private message or private interaction reply |
| | | |

Basically, a new command without slash command system should be like that :
```js
module.exports = {
  ..., //required and optional options
  execute(client, message, args) {},
};
```

Then, if you want to declare a slash command, you just need to provide this configuration :

```js
module.exports = {
  ...
  slashCommand: {
    data: new SlashCommandBuilder()
            .setName("yourCommandName")
            .setDescription("Your command description"),
  },
  ...,

  execute(client, message, args){
  }
}
```

You can also use a class extending `AbstractCommand`. Here is an example :
```js
import { AbstractCommand } from 'discord-starter-package'

export default class MyCommand extends AbstractCommand {
    protected name = "my-command";
    protected desc = "A fantastic command";
    protected usage = "/my-command";
    protected admin = false;
    execute(client, message, args) {
        return "Hello world!";
    }
}
```

### Dev cycle
During your development, you can dynamically reload one command using `/reload <optional name command>` command included in this library. If you're not specifying a command name, it will reload all commands. 

## Message

DiscordJS v13 has introduced new features like Buttons or Select Menu components. So you can add them easily in your messages, with my tool `MessageFormatter` ! It easy to use, trust me :-)
Just make a new instance of it and look at possibilites :

```js
// Concider you're on a command file ...

const result = new MessageFormatter();
// parameters: EmbedBuilder object
result.addEmbedMessage(SuccessEmbed(client, `**Disable - Success**`, `The command "${args[0]}" has been enabled !`));

// parameters: label of button, icon of button, color of button, and custom_id of button
result.addButton("Get karmated", "💥", "DANGER", "karma_button");

// parameters: type of selectmenu, options inside select menu, custom_id of select menu, placeholder of select menu
result.addSelectMenu("STRING", [
  { label: "NOW IT'S FANTASTIC !", description: "optional description", value: "now" },
  { label: "NEVER !", description: "optional description", value: "never" }
], "download_menu", "When you will download my project ?");

// add attachment file
result.addFile("myPicture.png")

// All at same time ? Why not
result.addEmbedMessage(...)
  .addButton(...)
  .addSelectMenu(...)
  .setContent(...)
  ...

return result;
```

## Embeds pagination

Sometimes, a pagination should be great to not spam your channel. With Discord.JS v13 and Embeds components, user experience is so much better, and developers can make embeds pagination more cleaner ! So I made a tool for it : EmbedPaginator. It generate an embed with options provided in constructor, handle automatically buttons events and it shows the range of items corresponding to the current page.
You can personnalize your embed with available options of `EmbedMessage`, and personnalize skin of your previous / next button.

```js
// Concider you're on a command file ...
const content = [];
for (let i = 0; i < 30; i++) {
  content.push({ name: 'name-' + i, value: 'value-' + i });
}

// EmbedPaginator(client, message, content to show in embed, embed options, paginator options)
return new EmbedPaginator(
  client,
  message,
  content,
  { title: 'Items' },
  { itemsPerPage: 10, nextLabel: 'Next page', previousLabel: 'Previous page' },
);
```

Pagination options are optionals. By default, there is 10 items per page, and pagination buttons looking like that :  
![Pagination default buttons](https://cdn.discordapp.com/attachments/784412126763548683/970297665134923796/unknown.png)

## Message component event handling

Imagine that you just added a new button with `my_custom_id` customId property :

```js
// Concider you're on a command file ...
const result = new MessageFormatter();
result.addButton('Get karmated', '💥', 'DANGER', 'karma_button');

return result;
```

With the `client` property in your command function `async execute(client: Bot, message: Message, args: any[])`, you can register an event when this new button will be clicked. For example, you want to log the player who clicked on the button. With the `interaction` that you must provide on event declaration, you will be able to get his / her username ! By using `client.setNewEvent()`, you can register an event for a button click or a select menu interaction (for the moment).
Check this out :

```js
// Concider you're on a command file ...
const result = new MessageFormatter();
result.addButton('Get karmated', '💥', 'DANGER', 'karma_button');

client.setNewEvent(EventType.BUTTON_EVENT, 'karma_button', (interaction) => {
  console.log(interaction.member.user.username + ' has clicked on the main menu button');
});

return result;
```

## Modal Constructor

Discord v13 just released first version of Modals. You can create fast instance of them with `ModalBuilder` :

> Warning : Modals can be showed only after an interaction of any type (button click, slash command, etc ..)

```js
// Concider you're on a command file ...
const modal = new ModalConstructor('My modal title', 'my_modal_custom_id');
//Add text input or textarea
modal.addTextInput('My Input label', 'my_input_custom_id', false); //textInput
modal.addTextInput('My Textarea label', 'my_textarea_custom_id', true); //textarea
```

Like Embed components, you can handle interaction of modal submission like this :

```js
client.setNewEvent(EventType.MODAL_SUBMIT_EVENT, modal.getCustomId(), (interaction) => {
  if (interaction.isModalSubmit()) {
    console.log(`${interaction.customId} modal has been submitted...`);
  }
});
```

For more informations about modal, [check this out](https://discordjs.guide/interactions/modals.html#building-and-responding-with-modals).

## Context menu interaction

DiscordJS makes able creation of context menu items. I've developed more easily way to create it. You just have to use current client bot instance and call `addContextMenuItem()` function :

```js
//Add context menu item
client.addContextMenuItem('test', message.guildId);
```

And obviously, you can declare an event when this menu item is used :

```js
//Add event triggerer when context menu item is used
client.setNewEvent(EventType.CONTEXT_MENU_EVENT, 'test', (interaction) => {
  console.log(`${interaction.commandName} has been used...`);
});
```

## Webhooks

You can define all webhooks that you want to use with your bot. For do this, you just have to declare them inside `webhooks` property in environment that you're using.

```json
{
  ...
  "webhooks": [
    { "name": "myWebHook", "url": "https://discordapp.com/api/webhooks/id/token" }
  ]
}
```

Then you can call your webhook with your bot client by the function `getWebhook(webhookName)`, inside one of your commands for example :

```js
  async execute(client, message, args) {
    client.getWebHook("myWebHook").send("Hi")
    ...
  }
```

Errors are catched if webhook is not registered and reply with an error embed message to user, and also log error in your console.

## Log

By default, all environments have `autoLog` property on `false` value. But if you enable this property by changing it value to `true`, when a command (slash or not) will be executed, it will automatically log execution date, username, command name and command arguments.
You can log by yourself if you want, just use `client.log('YourContent')` 😉 When you log something, log is prefixed by default with current date. But you can personalize prefix by using `client.log('YourContent', 'YourPrefix')`
