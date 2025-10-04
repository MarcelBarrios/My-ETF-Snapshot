module.exports = {
    getHomepage: (req, res) => {
        res.render('index.ejs', { title: 'Home' });
    },
};