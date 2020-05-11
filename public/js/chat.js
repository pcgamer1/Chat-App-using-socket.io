const socket = io()
$messageForm = document.querySelector('#message-form')
// $signupForm = document.querySelector('#signup-form')
$messageFormButton = $messageForm.querySelector('button')
// $signupFormButton = $signupForm.querySelector('button')
$messageFormInput = $messageForm.querySelector('input')
// $signupFormInput = $signupForm.querySelector('input')
$messages = document.querySelector('#messages')

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const messageTemplate = document.querySelector('#message-template').innerHTML

socket.on('pvtMessage', (data) => {
    console.log('From: ', data.username, 'Message: ', data.text)
    const html = Mustache.render(messageTemplate, {
        message: data.text,
        user: data.username,
        time: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)

})

socket.on('message', (data) => {
    console.log(data)
    const html = Mustache.render(messageTemplate, {
        message: data.text,
        user: data.username,
        time: moment(data.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

// $signupForm.addEventListener('submit', (e) => {
//     e.preventDefault()
//     $signupFormButton.setAttribute('disabled', 'disabled')
//     $messageFormButton.removeAttribute('disabled')
//     const username = e.target.elements.username.value
//     socket.emit('signup', username)
    
// })

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
    $messageFormButton.setAttribute('disabled', 'disabled')
    const uni = e.target.elements.message.value.includes('@')
    if(!uni)
        return socket.emit('uniMessage', e.target.elements.message.value, (error) => {
            $messageFormButton.removeAttribute('disabled')
            if(error) {
                const html = Mustache.render(messageTemplate, {
                    user: 'Server',
                    message: error,
                    time: moment(new Date().getTime()).format('h:mm a')
                })
                $messages.insertAdjacentHTML('beforeend', html)
            }
            else {
                const html = Mustache.render(messageTemplate, {
                    user: 'Server',
                    message: 'Message Delivered',
                    time: moment(new Date().getTime()).format('h:mm a')
                })
                $messages.insertAdjacentHTML('beforeend', html)
            }
        })
    const msg = e.target.elements.message.value.split(" ")
    const to = msg[0].replace('@','')
    delete msg[0]
    var fmsg = msg.join().replace(/,/g, ' ')
    socket.emit('pvtMessage' , {
        to,
        message: fmsg
    }, (error) => {
        $messageFormButton.removeAttribute('disabled')
        if(error) {
            const html = Mustache.render(messageTemplate, {
                user: 'Server',
                message: error,
                time: moment(new Date().getTime()).format('h:mm a')
            })
            $messages.insertAdjacentHTML('beforeend', html)
        }
        else {
            const html = Mustache.render(messageTemplate, {
                user: 'Server',
                message: 'Message Delivered',
                time: moment(new Date().getTime()).format('h:mm a')
            })
            $messages.insertAdjacentHTML('beforeend', html)
        }
    })
})

socket.emit('join', { username })