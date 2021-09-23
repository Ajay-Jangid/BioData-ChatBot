const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');

const {ConfirmPrompt, ChoicePrompt, NumberPrompt, TextPrompt  } = require('botbuilder-dialogs');

const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');
const {CardFactory} = require('botbuilder');

const data = require('../resources/data');
const cardd = require('../resources/card');

const CHOICE_PROMPT    = 'CHOICE_PROMPT';
const CONFIRM_PROMPT   = 'CONFIRM_PROMPT';
const TEXT_PROMPT      = 'TEXT_PROMPT';
const NUMBER_PROMPT    = 'NUMBER_PROMPT';
const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

class Conversation extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('conversation');

        this.addDialog(new TextPrompt(TEXT_PROMPT));
        this.addDialog(new ChoicePrompt(CHOICE_PROMPT));
        this.addDialog(new ConfirmPrompt(CONFIRM_PROMPT));
        this.addDialog(new NumberPrompt(NUMBER_PROMPT));



        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.getName.bind(this),    
            this.getAddress.bind(this), 
            this.getAge.bind(this),  
            this.getMobile.bind(this),
            this.confirmStep.bind(this), 
            this.feedback.bind(this),

        ]));

        this.initialDialogId = WATERFALL_DIALOG;
   }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);
        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }
    async getName(step){

        endDialog = false;
        return await step.prompt(TEXT_PROMPT, 'What is Your Name?');
    }

    async getAddress(step){
        step.values.name = step.result  
        var k = {
            "type": "TextBlock","text": "Details That You Entered","size": "large","color":"attention","weight":"bolder"
        };
        var m = {
            "type": "TextBlock","text": `Name : ${step.values.name}`,"size": "small","color":"accent"
        };
        data.body[0]=k;
        data.body[1]=m;

        return await step.prompt(TEXT_PROMPT, 'Please Enter Your Address');
    }

    async getAge(step){
        
        step.values.address = step.result
        var k = {
            "type": "TextBlock","text": `Address : ${step.values.address}`,"size": "small","color":"accent"
        };
        data.body[2]=k;
        return await step.prompt(NUMBER_PROMPT, 'Please Enter Your Age?');
    }

    async getMobile(step){
        step.values.age = step.result;
        var k = {
            "type": "TextBlock","text": `Age : ${step.values.age}`,"size": "small","color":"accent"
        };
        data.body[3]=k;
        return await step.prompt(NUMBER_PROMPT,'Please Enter your Mobile Number');
    }

    async confirmStep(step){
        step.values.mobile = step.result
        var k = {
            "type": "TextBlock","text": `Mobile : ${step.values.mobile}`,"size": "small","color":"accent"
        };
        data.body[4]=k;
        // var msg = `Details That You Entered: \n\n Name: ${step.values.name} \n\n Address: ${step.values.address} \n\n Age: ${step.values.age} \n\n Mobile: ${step.values.mobile}`;    
        //     await step.context.sendActivity(msg);
        await step.context.sendActivity({
            attachments : [CardFactory.adaptiveCard(data)]
        });

        return await step.prompt(CONFIRM_PROMPT, 'Are You Satisfied with the BIODATA CHAT BOT', ['Yes', 'No']);  

        // endDialog = true;
        // return await step.endDialog();   
    }

    async feedback(step){
        if(step.result===true){
            // var im = "C:\Users\ajay1\OneDrive\Desktop\myJsBots\Biodata Bot\biodata-bot\smile.jpg";
            var t = "Thank You For your Feedback.";
            cardd.body[0].text=t;
            await step.context.sendActivity({
                attachments : [CardFactory.adaptiveCard(cardd)]
            })
            endDialog = true;
            return await step.endDialog();   
        }
        else{
    
            const endMessage = `Thanks For using BioData ChatBot.`;
                cardd.body[0].text = endMessage;
                 await step.context.sendActivity({
                       attachments : [CardFactory.adaptiveCard(cardd)]
                  });
            
                  endDialog = true;
                  return await step.endDialog();   

        }
}

    async isDialogComplete(){
        return endDialog;
    }
}

module.exports.Conversation = Conversation;








