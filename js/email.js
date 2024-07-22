const form = document.querySelector('form');

const name = document.getElementById('name');
const email = document.getElementById('email');
const phoneNumber = document.getElementById('tel');
const message = document.getElementById('message');
const subject = document.getElementById('subject');

function sendMail(){
    const bodyMessage = `Full Name: ${name.value} <br> Email: ${email.value} <br> 
    Phone number: ${phoneNumber.value} <br> Message: ${message.value}`

    Email.send({
        SecureToken : 'a2239e1b-4233-404e-8d40-cc2d2b8f973a',
        To : 'mnoordinali@gmail.com',
        From : "mnoordinali@gmail.com",
        Subject : subject.value,
        Body : bodyMessage
    }).then(
        message => {
            if (message === 'OK'){
                Swal.fire({
                    title: "Thank you!",
                    text: "Message sent successfully",
                    icon: "success"
                });
            }
        }
    );
}

form.addEventListener('submit', (e)=>{
    e.preventDefault();
    sendMail();
    form.reset()
    return false;
});