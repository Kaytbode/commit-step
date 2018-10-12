
class AppController {
    static gitHubUrl(userName){
        return `https://api.github.com/users/${userName}/repos`;
    }

    static initializeDB() {
        const dbPromise = idb.open('commit-step', 2, upgradeDb =>{
            switch(upgradeDb.oldVersion){
                case 0:
                    upgradeDb.createObjectStore('username');
                case 1:
                    const store = upgradeDb.createObjectStore('commits');
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

    static getCommitDay() {
        const dbPromise = AppController.initializeDB();
        let day;

        dbPromise.then(async db => {
            const tx = db.transaction('commits', 'readwrite');
            const store = tx.objectStore('commits');
            const val = await store.get('counter');

            day = val
            store.put(val + 1, 'counter');
            
            return tx.complete;
        });

        return day;
    }

    static async getCommitsCount(userName){
        const url = AppController.gitHubUrl(userName);
        let commitsCount = 0;

        const response = await fetch(url);
        const data = await response.json();

        return Promise.all(data.map(async repo => {
            const commitUrl = `https://api.github.com/repos/${repo.full_name}/commits`;

            const res = await fetch(commitUrl);
            const {length} = await res.json();

            return length;
        })).then(len => commitsCount += Number(len));
    }

    static async storeCommitsCount(userName) {
        const commitsCount = await AppController.getCommitsCount(userName);

        const day = AppController.getCommitDay();

        const dbPromise = AppController.initializeDB();

        dbPromise.then(db => {
            const tx = db.transaction('commits', 'readwrite');
            const store = tx.objectStore('commits');
            store.put(commitsCount, `day ${day}`);

            return tx.complete;
        });
    }
}
