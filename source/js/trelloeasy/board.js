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