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