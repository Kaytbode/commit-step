// REGISTER SERVICE WORKER
AppController.registerSW();

document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();

    const userName = document.querySelector('input').value;
    //Add user to indexDB
    AppController.addUserToDB(userName);

    //sync service worker every 24hours
    AppController.syncSW();
});


const channel = new BroadcastChannel('sw-message');

channel.addEventListener('message', event =>{
    console.log(event.data.action);
}); 