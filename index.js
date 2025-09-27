const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const bycrypt = require('bcrypt');
const session = require('express-session');
const { reset } = require('colors');

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
app.use(session({ secret: 'notagoodsecret' }))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send('this is the homepage')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res) => {
    const { password, username } = req.body;
    const user = new User({username, password})
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password)
    const user = await User.findOne({ username });
    const validPassword = await bycrypt.compare(password, user.password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret')
    }
    else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
}) 

app.get('/secret', requireLogin, (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    res.render('secret')
})
app.get('/topsecret', requireLogin, (req, res) => {
    res.send('top secret!')
})

app.listen(5000, () => {
    console.log('serving your app!')
})