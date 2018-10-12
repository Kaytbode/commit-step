
async function l(x){
    let a = await AppController.getCommitsCount(x);

    console.log(a);
}

document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    const userName = document.querySelector('input').value;
    console.log(userName);
    //console.log(AppController.getCommitsCount(userName));
    l(userName);
    /* event.preventDefault();
    fetch('https://api.github.com/users/Kaytbode')
    .then(res => res.json())
    .then(val => console.log(val)) */
});

