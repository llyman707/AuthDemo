const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bycrypt = require('bcrypt');
const session = require('express-session');

mongoose.connect('mongodb://127.0.0.1:27017/loginDemo')
    .then(() => {
        console.log('mongo connection open!')
    })
    .catch(err => {
        console.log('on no mongo connection error!')
        console.log(err)
    })

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded({ extended: true }));
app.use(session({secret: 'notagoodsecret'}))

app.get('/', (req, res) => {
    res.send('this is the homepage')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const hash = await bycrypt.hash(password, 12);
    const user = new User({
        username,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const validPassword = await bycrypt.compare(password, user.password);
    if (validPassword) {
        req.session.user_id = user._id;
        res.redirect('/secret')
    }
    else {
        res.redirect('/login')
    }
})

app.get('/secret', (req, res) => {
    if (!req.session.user_id) {
        res.redirect('/login')
    }
    res.send('this is a secret! you cannot see me unless you are logged in')
})

app.listen(5000, () => {
    console.log('serving your app!')
})