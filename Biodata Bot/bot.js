const { ActivityHandler, MessageFactory } = require('botbuilder');
const { Conversation } = require('./Dialogs/conversation');
const {DataD} = require('./Dialogs/data');

const {CardFactory} = require('botbuilder');
const cardd = require('./resources/card');
// const d = require('./resources/di');

const CARDS = [
    cardd
];


class BioData extends ActivityHandler {
    constructor(conversationState,userState) {
        super();

        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty("dialogState");
        this.conversation = new Conversation(this.conversationState,this.userState);
        this.datad = new DataD(this.conversationState,this.userState);

        this.previousIntent = this.conversationState.createProperty("previousIntent");
        this.conversationData = this.conversationState.createProperty('conservationData');
        
        this.onMessage(async (context, next) => {
        
        await this.dispatchToIntentAsync(context);
        await next();
        });

    this.onDialog(async (context, next) => {
            await this.conversationState.saveChanges(context, false);
            await this.userState.saveChanges(context, false);
            await next();
        });   
    this.onMembersAdded(async (context, next) => {
            await this.sendWelcomeMessage(context)
            await next();
        });
    }

  

    async sendWelcomeMessage(turnContext) {
        const { activity } = turnContext;

        for (const idx in activity.membersAdded) {
            if (activity.membersAdded[idx].id !== activity.recipient.id) {
                await turnContext.sendActivity({
                    attachments : [CardFactory.adaptiveCard(CARDS[0])]
                });
                await this.sendSuggestedActions(turnContext);
            }
        }
    }

    async sendSuggestedActions(turnContext) {
        // var k = {"type": "TextBlock","text": "Hello Welcome to BioData ChatBot","size": "large","color":"accent"};
        // CARDS[1].body[0]=k;
        var reply = MessageFactory.suggestedActions(['Yes','No','Display Data'],'Would you like to Provide Your Personal Details?');
        await turnContext.sendActivity(reply);
        // await turnContext.sendActivity({
        //     attachments : [CardFactory.adaptiveCard(CARDS[1])]
        // });
    
    }


    async dispatchToIntentAsync(context){
        var currentIntent = '';
        const previousIntent = await this.previousIntent.get(context,{});
        const conversationData = await this.conversationData.get(context,{});   
        // console.log('Current1='+currentIntent);
        // console.log('Pervious1='+previousIntent.intentName);

        if(previousIntent.intentName && conversationData.endDialog === false )
        {
           currentIntent = previousIntent.intentName;
            
        }
        else if (previousIntent.intentName && conversationData.endDialog === true)
        {
             currentIntent = context.activity.text;
        }
        else
        {
            currentIntent = context.activity.text;

            await this.previousIntent.set(context,{intentName: context.activity.text});

        }
        // console.log('Current2='+currentIntent);
        // console.log('Pervious2='+previousIntent.intentName);

        switch(currentIntent)
        {

            case 'Yes':
                await this.conversationData.set(context,{endDialog: false});
                await this.conversation.run(context,this.dialogState);
                conversationData.endDialog = await this.conversation.isDialogComplete();
                if(conversationData.endDialog)
                {
                    await this.conversationData.set(context,{endDialog:conversationData.endDialog});
                    await this.sendSuggestedActions(context);
                }
                break;

            case 'No':
                const endMessage = `Thanks For using BioData ChatBot.`;
                // await context.sendActivity(endMessage);
                CARDS[0].body[0].text = endMessage;
                 await context.sendActivity({
                       attachments : [CardFactory.adaptiveCard(CARDS[0])]
                  });
                await this.conversationData.set(context,{endDialog: true});
                break;

            case 'Display Data':
                await this.conversationData.set(context,{endDialog: false});
                await this.datad.run(context,this.dialogState);
                conversationData.endDialog = await this.conversation.isDialogComplete();
                CARDS[0].body[0].text = `Thanks For using BioData ChatBot.`;
                 await context.sendActivity({
                       attachments : [CardFactory.adaptiveCard(CARDS[0])]
                  });
                if(conversationData.endDialog)
                {
                    await this.conversationData.set(context,{endDialog:conversationData.endDialog});
                    await this.sendSuggestedActions(context);
                }
            
            break;
            
            default:
                console.log("Something Happens.... ERROR");
                break;
        }   
  }
}

module.exports.BioData = BioData;