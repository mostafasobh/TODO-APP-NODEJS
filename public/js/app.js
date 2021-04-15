document.querySelector('form').addEventListener('submit', (e) => {
e.preventDefault()
})
document.querySelector('#submit').addEventListener('click', () => {
    let firstName, lastName, email, password
    firstName= document.querySelector('#firstName').value
    lastName= document.querySelector('#lastName').vaule
    email= document.querySelector('#email').value
    password= document.querySelector('#password').value
    console.log(email)
    console.log(password)

        let url = 'http://localhost:3000/users'
axios.get(url).then((res)=>console.log(res))
    
})