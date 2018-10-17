
class AppController {
    static registerSW() {
        navigator.serviceWorker.register('./sw.js').then(reg=>{
            if(!navigator.serviceWorker.controller)return;
            console.log('sw registered')
            return reg.sync.getTags();
          }).then(tags=>{
              if(tags.includes('move-step')) console.log('background sync pending');
          }).catch(err=>{
              console.log('sync not supported or flag not enabled');
              console.log(err.message);
          });
    }
    // service worker background sync
    static syncSW() {
        navigator.serviceWorker.ready.then(swRegistration=>{
            console.log('service worker ready')
            return swRegistration.sync.register('moveStep');
           })
          .then(()=> console.log('moveStep registered'))
          .catch(()=> {
            console.log('moveStep failed');
          });
    }

    static gitHubUrl(userName){
        return `https://api.github.com/users/${userName}/repos`;
    }

    static initializeDB() {
        const dbPromise = idb.open('commit-step', 2, upgradeDb =>{
            switch(upgradeDb.oldVersion){
                case 0:
                    let store = upgradeDb.createObjectStore('username');
                    store.put(365, 'stepUp');
                    store.put(0, 'stepRight');
                case 1:
                    store = upgradeDb.createObjectStore('commits');
                    store.put(0, 'counter');
            }
        });
        return dbPromise;
    }

    static addUserToDB(userName) {
        const dbPromise = AppController.initializeDB();

        dbPromise.then(db => {
            const tx = db.transaction('username', 'readwrite');
            tx.objectStore('username').put(userName, 'user');
            return tx.complete;
        })
    }

    static incrementDay() {
        const dbPromise = AppController.initializeDB();

        dbPromise.then(async db => {
            const tx = db.transaction('commits', 'readwrite');
            const store = tx.objectStore('commits');
            const val = await store.get('counter');

            store.put(val + 1, 'counter');
            
            return tx.complete;
        });
    }
    /* Get total commits */
    static async getCommitsCount(userName){
        const url = AppController.gitHubUrl(userName);
    
        const response = await fetch(url);
        const data = await response.json();

        return Promise.all(data.map(async repo => {
            const commitUrl = `https://api.github.com/repos/${repo.full_name}/commits`;

            const res = await fetch(commitUrl);
            const {length} = await res.json();

            return length;
            //return total commits of all repos
        }))
        .then(len => len.reduce((a,b)=> a + b, 0));
    }

    static async storeCommitsCount(userName) {
        const commitsCount = await AppController.getCommitsCount(userName);

        if(typeof(commitsCount) !== 'number') return;

        let prevDay = commitsCount, 
            diff;

        const dbPromise = AppController.initializeDB();

        dbPromise.then(async db => {
            const tx = db.transaction('commits', 'readwrite');
            const store = tx.objectStore('commits');
            const toDay = await store.get('counter');
            const dayb4 = toDay - 1;

            //only get the previous day total if it is not the first day
            if(dayb4 > 0 )prevDay = await store.get(`day ${dayb4}`);

            store.put(commitsCount, `day ${toDay}`);

            return tx.complete;
        });
        
        AppController.incrementDay();
        
        diff = commitsCount - prevDay;

        return diff;
    }

    static async calcSteps(userName) {
        const diff = await AppController.storeCommitsCount(userName);
        let step;

        switch(diff) {
            case 0:
                step = 0;
                break;
            case 1:
            case 2:
            case 3:
                step = 1;
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                step = 2;
                break;
            case 8:
            case 9:
            case 10:
            case 11:
                step = 3;
                break;
            default:
                step = 4;
        }
        
        return step;
    }

    static createFootPrints() {
        const footprints = document.createElement('div');
        footprints.innerHTML = '<i class="fas fa-shoe-prints"></i>';
        footprints.classList.add('foot-prints');

        return footprints;
    }

    static moveFeet(feet, journey) {
        const dbPromise = AppController.initializeDB();

        dbPromise.then(async db => {
            const tx = db.transaction('username').objectStore('username');

            const stepUp = await tx.get('stepUp');
            const stepRight = await tx.get('stepRight');
            const step = await tx.get('step');

            //move your feet 
            feet.style.top = stepUp;
            feet.style.left = stepRight;

            // leave footprints if you moved
            if(step){
                const footprints = AppController.createFootPrints();
                footprints.style.top = stepUp + step;
                footprints.style.left = stepRight - step;
                journey.appendChild(footprints);
            }
         
            return tx.complete;
        })
    }
}
