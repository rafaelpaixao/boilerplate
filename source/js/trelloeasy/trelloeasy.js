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