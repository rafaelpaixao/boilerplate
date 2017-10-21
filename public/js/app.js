var trelloEasy = new TrelloEasy();

Vue.component('modal', {
  template: '#modal-template'
})

Vue.component('loading-circle', {
  template: '#loading-circle-template'
});

Vue.component('loading-spinner', {
  template: '#loading-spinner-template'
});

var appVue = new Vue({
  el: '#appVue',
  data: {
    pageStatus: "login",
    tableActualCardsStatus: "",
    tablePreviousCardsStatus: "",
    loggedUser: '',
    boards: '',
    selectedBoard: '',
    selectedList: '',
    listsOfSelectedBoard: '',
    actualCards: '',
    previousCards: '',
    showModalHelp: false,
    showModalCard: '',
    showModalUser: ''
  },
  methods: {
    login: function () {
      trelloEasy.login("Relatório Trello", appVue.loginSuccess, appVue.loginError);
    },
    loginSuccess: async function () {
      appVue.loggedUser = await trelloEasy.getUser();
      appVue.boards = await trelloEasy.getBoards();
      alertify.dismissAll();
      alertify.success('Usuário autenticado!');
      this.pageStatus = "report";
    },
    loginError: function () {
      alertify.dismissAll();
      alertify.error('Não foi possível autenticar o usuário.');
      this.pageStatus = "login";
    },
    logout: function () {
      appVue.pageStatus = "loading";
      trelloEasy.logout();
      location.reload();
    },
    updateData: function(){
      appVue.pageStatus = "loading";
      appVue.tableActualCardsStatus = "";
      appVue.tablePreviousCardsStatus = "";
      appVue.boards = '';
      appVue.selectedBoard = '';
      appVue.selectedList = '';
      appVue.listsOfSelectedBoard = '';
      appVue.actualCards = '';
      appVue.previousCards = '';
      appVue.login();
    },
    msToString: function (ms) {
      function numberEnding(number) {
        return (number > 1) ? 's' : '';
      }

      var temp = Math.floor(ms / 1000);
      var years = Math.floor(temp / 31536000);
      if (years) {
        return years + ' ano' + numberEnding(years);
      }
      //TODO: Months? Weeks? 
      var days = Math.floor((temp %= 31536000) / 86400);
      if (days) {
        return days + ' dia' + numberEnding(days);
      }
      var hours = Math.floor((temp %= 86400) / 3600);
      if (hours) {
        return hours + ' hora' + numberEnding(hours);
      }
      var minutes = Math.floor((temp %= 3600) / 60);
      if (minutes) {
        return minutes + ' minuto' + numberEnding(minutes);
      }
      var seconds = temp % 60;
      if (seconds) {
        return seconds + ' segundo' + numberEnding(seconds);
      }
      return 'menos de um segundo';
    },
    dateToString: function(date){
      return date.toLocaleString();
    }
  },
  watch: {
    selectedBoard: function () {
      if(appVue.selectedBoard>=0){
        alertify.dismissAll();
        alertify.message('Carregando listas...');
        appVue.tableActualCardsStatus = "";
        appVue.tablePreviousCardsStatus = "";
        appVue.boards[appVue.selectedBoard].getLists().then(
          function (result) {
            appVue.listsOfSelectedBoard = result;
            document.getElementById("select_list").value = -1;
            appVue.selectedList = -1;
            alertify.dismissAll();
            alertify.success('Listas carregadas!');
          });
      }
    },
    selectedList: async function () {
      if(appVue.selectedList>=0){
        alertify.dismissAll();
        alertify.message('Carregando cartões...');
        appVue.tableActualCardsStatus = "loading";
        appVue.tablePreviousCardsStatus = "loading";

        var listId = appVue.listsOfSelectedBoard[appVue.selectedList].id;
        appVue.listsOfSelectedBoard[appVue.selectedList].setCards().then(
          function () {
            appVue.actualCards = appVue.listsOfSelectedBoard[appVue.selectedList].actualCards;
            appVue.previousCards = appVue.listsOfSelectedBoard[appVue.selectedList].previousCards;
            
            if(appVue.actualCards.length>0)
              appVue.tableActualCardsStatus = "ready";
            else
              appVue.tableActualCardsStatus = "";
              
            if(appVue.previousCards.length>0)
              appVue.tablePreviousCardsStatus = "ready";
            else
              appVue.tablePreviousCardsStatus = "";
            
            alertify.dismissAll();
            alertify.success('Cartões carregados!');
          });
      }
    }
  }
});