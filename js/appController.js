/* const fetchGit = ()=> {
    return fetch('https://api.github.com/repos/Kaytbode/-Server/commits')
            .then(response => response.json())
            .then(data => console.log(data.length));
    }

window.onload = fetchGit; */
class AppController {
    static gitHubUrl(userName){
        return `https://api.github.com/users/${userName}/repos`;
    }

    static getCommits(userName){
      const url = AppController.gitHubUrl(userName);
      let commitsCount = 0;

      return fetch(url)
        .then(response => response.json())
        .then(data => {
            return data.map(repo => {
                return fetch(`https://api.github.com/repos/${repo.full_name}/commits`)
                    .then(response => response.json())
                    .then(commit => new Promise (resolve=> resolve(commit.length)));
             })            
        })
        .catch(err => console.log(err));
    }
}
