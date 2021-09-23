const {WaterfallDialog, ComponentDialog } = require('botbuilder-dialogs');
const {CardFactory} = require('botbuilder');
const {DialogSet, DialogTurnStatus } = require('botbuilder-dialogs');

const WATERFALL_DIALOG = 'WATERFALL_DIALOG';
var endDialog ='';

const data = require('../resources/data1');

class DataD extends ComponentDialog {
    
    constructor(conservsationState,userState) {
        super('conversation');

        this.addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
            this.display.bind(this),    
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
    async display(step){
        await step.context.sendActivity({
            attachments : [CardFactory.adaptiveCard(data)]
        });

        endDialog = true;
        return await step.endDialog();   
    }

    async isDialogComplete(){
        return endDialog;
    }
}

module.exports.DataD = DataD;








