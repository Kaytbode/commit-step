// REGISTER SERVICE WORKER
AppController.registerSW();

document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();

    const userName = document.querySelector('input').value;
    //Add user to indexDB
    AppController.addUserToDB(userName);

    //sync first time and click the button every day 
    AppController.syncSW();
});


const channel = new BroadcastChannel('sw-message');
channel.addEventListener('message', event =>{
    // if sw sync has successfully calculated the step you need to take
    if (event.data.action === 'posted to indexDB'){
        const feet = document.querySelector('.feet');

        const journey = document.querySelector('.journey');

        AppController.moveFeet(feet, journey);
    }
}); 