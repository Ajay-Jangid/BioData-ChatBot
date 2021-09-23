
const dotenv = require('dotenv');
const path = require('path');
const restify = require('restify');

const { BotFrameworkAdapter, MemoryStorage, ConversationState, UserState   } = require('botbuilder');

const { BioData } = require('./bot');

const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3980, () => {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    
});


const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

const onTurnErrorHandler = async (context, error) => {

    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

adapter.onTurnError = onTurnErrorHandler;

const memmoryStorage = new MemoryStorage();

const conversationState = new ConversationState(memmoryStorage);
const userState = new UserState(MemoryStorage)


const biodata = new BioData(conversationState,userState);

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await biodata.run(context);
    });
});


