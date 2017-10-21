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