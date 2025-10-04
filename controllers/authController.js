const passport = require('passport');
const validator = require('validator');
const User = require('../models/User');

exports.getLogin = (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('login', {
        title: 'Login',
        messages: { error: req.flash('error'), info: req.flash('info') },
    });
};

exports.postLogin = (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
        validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (validator.isEmpty(req.body.password))
        validationErrors.push({ msg: 'Password cannot be blank.' });

    if (validationErrors.length) {
        req.flash('error', validationErrors.map(err => err.msg));
        return res.redirect('/auth/login');
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            req.flash('error', info.message);
            return res.redirect('/auth/login');
        }
        req.logIn(user, err => {
            if (err) {
                return next(err);
            }
            req.flash('info', 'Success! You are logged in.');
            res.redirect(req.session.returnTo || '/dashboard');
        });
    })(req, res, next);
};

exports.getSignup = (req, res) => {
    if (req.user) {
        return res.redirect('/dashboard');
    }
    res.render('signup', {
        title: 'Create Account',
        messages: { error: req.flash('error') },
    });
};

exports.postSignup = async (req, res, next) => {
    const validationErrors = [];
    if (!validator.isEmail(req.body.email))
        validationErrors.push({ msg: 'Please enter a valid email address.' });
    if (!validator.isLength(req.body.password, { min: 8 }))
        validationErrors.push({ msg: 'Password must be at least 8 characters long' });
    if (req.body.password !== req.body.confirmPassword)
        validationErrors.push({ msg: 'Passwords do not match' });

    if (validationErrors.length) {
        req.flash('error', validationErrors.map(err => err.msg));
        return res.redirect('/auth/signup');
    }
    req.body.email = validator.normalizeEmail(req.body.email, { gmail_remove_dots: false });

    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            req.flash('error', 'Account with that email address already exists.');
            return res.redirect('/auth/signup');
        }

        const user = new User({
            userName: req.body.userName,
            email: req.body.email,
            password: req.body.password,
        });

        await user.save();

        req.logIn(user, (err) => {
            if (err) {
                return next(err)
            }
            res.redirect('/dashboard')
        })

    } catch (err) {
        return next(err);
    }
};

exports.logout = (req, res) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) console.log('Error : Failed to destroy the session during logout.', err);
            req.user = null;
            res.redirect('/');
        });
    });
};