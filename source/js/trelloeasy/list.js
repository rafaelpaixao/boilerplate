class List{
    constructor(id, name){
        this.id = id;
        this.name = name;
        this.actualCards = [];
        this.previousCards = [];
        this.cardsSetted = false;
    }
    static async getList(id){
        var response = await Trello.get('/lists/'+id);
        return new List(response.id,response.name);
    }
    async setCards(){
        if(!this.cardsSetted){
            var responseActions = await Trello.get('/lists/'+this.id+'/actions?filter=createCard,copyCard,moveCardToBoard,moveCardFromBoard,updateCard');
            for(var i=0; i<responseActions.length; i++){
                var a = responseActions[i];
                var list = this;
                var type = "";

                if(a.type=="createCard") type = "Criado";
                else if(a.type=="copyCard") type = "Copiado";
                else if(a.type=="moveCardToBoard") type = "Movido para o quadro";
                else if(a.type=="moveCardFromBoard") type = "Removido do quadro";
                else if(a.type=="updateCard"){
                    if(a.data.listBefore===undefined){
                        continue; //Card was updated, but not moved
                    }else if(a.data.listBefore.id===this.id)
                        type = "Removido da lista";
                    else
                        type = "Movido para a lista";
                }
                var user = await User.getUser(a.idMemberCreator);
                var newAction = new Action(a.id,type,new Date(a.date),user,this);
                var card = await this.getCardById(a.data.card.id);
                card.actionsInList.push(newAction);
            }

            for(var i=0; i<this.actualCards.length; i++)
                this.actualCards[i].makeHistoryInList(this.id);

            for(var i=0; i<this.previousCards.length; i++)
                this.previousCards[i].makeHistoryInList(this.id);
        }
        this.cardsSetted = true;
    }
    async getCardById(idCard){
        //Case 1: card is in actualCards
        for(var i=0;i<this.actualCards.length;i++){
            var c = this.actualCards[i];
            if(c.id==idCard) return c;
        }
        //Case 2 card is in previousCards
        for(var i=0;i<this.previousCards.length;i++){
            var c = this.previousCards[i];
            if(c.id==idCard) return c;
        }
        //Case 3 get card from Trello
        var response = await Trello.get('/cards/'+idCard);
        var newCard = new Card(response.id,response.name,response.url);
        await newCard.setCreator();
        if(response.idList===this.id){
            newCard.isInList = true;
            this.actualCards.push(newCard);
        }else{
             this.previousCards.push(newCard);
        }
        return newCard;
    }

}