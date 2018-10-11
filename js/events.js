
async function l(x){
    let a = await AppController.getCommits(x);

    console.log(a);
}

document.querySelector('form').addEventListener('submit', event => {
    event.preventDefault();
    console.log('hey');
    const userName = document.querySelector('input').value;
    console.log(userName);
    console.log(AppController.getCommits(userName));
    l(userName);
});

