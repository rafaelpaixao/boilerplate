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