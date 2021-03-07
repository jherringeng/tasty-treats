// document.getElementById('messageForm').addEventListener('submit', e => {
//         e.preventDefault();
//         alert("Form connected")
//
//         const name = document.querySelector('#name').value;
//         const email = document.querySelector('#email').value;
//         const message = document.querySelector('#message').value;
//         const subscribed = document.querySelector('#subscribed').value;
//         const captcha = document.querySelector('#g-recaptcha-response').value;
//
//         return fetch('/submit', {
//           method: 'POST',
//           headers: { 'Content-type': 'application/json' },
//           body: {
//             name : name,
//             email: email,
//             message: message,
//             subscribed: subscribed,
//             captcha: captcha })
//         })
//           .then(res => res.json())
//           .then(data => {
//             console.log(data);
//             alert(data.msg);
//             if (data.success) return location.reload();
//           });
//       });
