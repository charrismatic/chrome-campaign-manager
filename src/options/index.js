const s = {
  DELETE_MESSAGE: 'x',
  EDIT_MESSAGE: 'edit',
  COPY_MESSAGE: 'copy',
};

var account_model = {
  id: '',
  location: '',
  url: '',
  website: '',
  name: '',
};

document.addEventListener('DOMContentLoaded', function () {
  var account_data = [
    {
      id: 'AzzipPizzaEvansville',
      location: 'evansville',
      url: 'facebook.com/AzzipPizzaEvansville',
      website: 'azzippizza.com',
      name: 'Azzip Pizza',
    }, {
      id: 'Boonville-Pizza-Chef-299288533451805',
      location: 'boonville',
      url: 'facebook.com/Boonville-Pizza-Chef-299288533451805',
      website: 'pizzachefboonville.com',
      name: 'Boonville Pizza Chef',
    }
  ];

  var message_data = [
    {id: 1, content: 'Great - You walk in {{@pageurl}} - What are you ordering and who are you with?'},
    {id: 2, content: 'Favorite thing to get at {{@pageurl}}?'},
    {id: 3, content: 'Who are you taking with you to {{@pageurl}} if you win?'}
  ];

  load_accounts_table(account_data);
  load_message_table(message_data);

  for (btn of document.querySelectorAll('.copy-message')){
  	btn.addEventListener('click', message_to_clip);
  }

  chrome.storage.local.get(['key'], function(result) {
    console.log('Value currently is ' + result.key);
  });

  var resetButton = document.querySelector('button.reset');
  var submitButton = document.querySelector('button.submit');
  var textarea = document.querySelector('textarea');

  // // load_css();
  // get_storage('accounts', function(item){
  //   console.log('testing account data', item)
  //   if (! item) {
  //       var testdata = [{
  //         id: 'AzzipPizzaEvansville',
  //         location: 'evansville',
  //         url: 'facebook.com/AzzipPizzaEvansville',
  //         website: 'azzippizza.com',
  //         name: 'Azzip Pizza',
  //       }, {
  //         id: 'Boonville-Pizza-Chef-299288533451805',
  //         location: 'boonville',
  //         url: 'facebook.com/Boonville-Pizza-Chef-299288533451805',
  //         website: 'pizzachefboonville.com',
  //         name: 'Boonville Pizza Chef',
  //       }];
  //       chrome.storage.local.set({
  //           'accounts': testdata
  //       }, function(){
  //           console.log('set accounts')
  //       });
  //   }
  //
  // });

  resetButton.addEventListener('click', reset_css);
  submitButton.addEventListener('click', save_css);

  init_test_selector();
});
