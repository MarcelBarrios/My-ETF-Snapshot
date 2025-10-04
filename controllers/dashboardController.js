module.exports = {
    getDashboard: (req, res) => {
        res.render('dashboard.ejs', {
            title: 'Dashboard',
            user: req.user // Pass the logged-in user's data to the view
        });
    },
};