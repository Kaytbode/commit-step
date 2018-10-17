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
    if (event.data.action === 'posted to indexDB'){
        const feet = document.querySelector('.feet');

        const journey = document.querySelector('.journey');

        AppController.moveFeet(feet, journey);
    }
}); 