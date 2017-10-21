class User{
    constructor(id, fullName, username, url){
        this.id = id;
        this.fullName = fullName;
        this.firstName = fullName.split(" ")[0];
        this.username = username;
        this.url = url;
    }
    static async getUser(id){
        var response = await Trello.get('/members/'+id);
        return new User(response.id,response.fullName,response.username,response.url);
    }
}
class Action{
    constructor(id, type, date, user, list){
        try{
            if(!(date instanceof Date)) throw new TypeError("Invalid type! The object 'date' should be a instance of Date.");
            if(!(user instanceof User)) throw new TypeError("Invalid type! The object 'user' should be a instance of User.");
            if(!(list instanceof List)) throw new TypeError("Invalid type!  The object 'list' should be a instance of List.");
        }catch(e){
            console.log("ERROR: "+e.message+" - STACK: "+ e.stack);
        }
        this.id = id;
        this.type = type;
        this.date = date;
        this.user = user;
        this.list = list;
    }
}
class Card {
    constructor(id, name, url){
        this.id = id;
        this.name = name;
        this.url = url;
        this.timeInList = 0;
        this.actionsInList = [];
        this.isInList = false;
    }

    makeHistoryInList(listId){
        if(this.historyInList === undefined){
            this.historyInList = [];
            //Sort actions in asc order by date
            this.actionsInList.sort(function(a,b){
                return a.date - b.date;
            })

            //Create history
            var last = this.actionsInList.length;
            for(var i=0; i<last; i++){
                var a = this.actionsInList[i];
                var type = a.type;
                var list = a.list;
                var user = a.user;
                var begin = a.date;
                var end;

                if(i+1!=last)
                    end = this.actionsInList[i+1].date;  
                else
                    if(this.isInList)
                        end = new Date();
                    else
                        end=begin;

                var duration = end - begin;
                this.historyInList.push(new CardHistory(type, list, user, begin, end, duration));
            }

            //Calculate time in list
            if(this.timeInList==0){
                var total = 0;
                for(var i=0; i<this.historyInList.length; i++){
                    var h = this.historyInList[i];
                    if(h.type!="Removido da lista" && h.type!="Removido do quadro");
                    total += parseInt(h.duration);
                }
                this.timeInList = total;
            }
        }
    }
    async setCreator(){
        if(this.creator===undefined){
            var response = await Trello.get('/cards/'+this.id+"/actions?filter=createCard");
            this.creator = await User.getUser(response[0].idMemberCreator);
        }
    }
}
class CardHistory{
    constructor(type,list,user,begin,end,duration){
        this.type = type;
        this.list = list;
        this.user = user;
        this.begin = begin;
        this.end = end;
        this.duration = duration;
    }
}
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
class Board{
    constructor(id, name, url){
        this.id = id;
        this.name = name;
        this.url = url;
    }
    async getLists(){
        if(this.lists===undefined){
            var lists = [];
            var response = await Trello.get('/boards/'+this.id+'/lists');            
            for(var i=0; i<response.length; i++){
                var l = response[i];
                lists.push(new List(l.id,l.name));
            }
            this.lists = lists;
        }
        return this.lists;
    }
    getCardById(id){
        if(this.lists===undefined) return null;
        else{
            for(var i=0; i<this.lists.length; i++){
                var l = this.lists[i];
                console.log("lista: "+l.name);
                if(l.cards===undefined) return null;
                for(var j=0; j<l.cards.length; j++){
                    var c = l.cards[j];
                    console.log("card: "+c.name);
                    if(c.id==id){
                        console.log("AChou!!");
                        return c;
                    }
                }
            }
        }
        return null;
    }
}
class TrelloEasy {
    login(appName, callSuccess, callError){
        Trello.authorize({
            type: 'popup',
            name: appName,
            scope: {
                read: true,
                write: false
            },
            expiration: 'never',
            success: callSuccess,
            error: callError
        });
    }
    logout(){
        Trello.deauthorize();
    }
    async getUser(){
        var response = await Trello.get('/members/me/');
        var user = new User(response.id,response.fullName,response.username,response.url);
        return user;
    }
    async getBoards(){
        var boards = [];
        var response = await Trello.get('/members/me/boards/');
        for(var i=0; i<response.length; i++){
            var b = response[i];
            boards.push(new Board(b.id,b.name,b.url));
        }
        return boards;
    }
}