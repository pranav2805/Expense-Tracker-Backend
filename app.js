const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const path = require('path');
const https = require('https');
const morgan = require('morgan');

dotenv.config();

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const User = require('./models/user');
const Expense = require('./models/expense');
const Order = require('./models/order');
const Forgotpassword = require('./models/forgotpassword');
const DownloadedFile = require('./models/downloadedfile');

const app = express();
app.use(cors());

const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a'}
);

app.use(morgan('combined', { stream: accessLogStream}));

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(Forgotpassword);
Forgotpassword.belongsTo(User);

User.hasMany(DownloadedFile);
DownloadedFile.belongsTo(User);

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
const userRoutes = require('./routes/user');
const expRoutes = require('./routes/expRoute');
const purchaseRoutes = require('./routes/purchase');
const premiumRoutes = require('./routes/premium');
const resetpasswordRoutes = require('./routes/resetpassword');

app.use('/purchase', purchaseRoutes);
app.use('/premium', premiumRoutes);
app.use(userRoutes);
app.use(expRoutes);
app.use('/password', resetpasswordRoutes);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, `public/${req.url}`));
})

//app.use(errorController.get404);

sequelize.sync().then((result) => {
    // https.createServer({ key: privateKey, cert: certificate }, app)
    // .listen(process.env.PORT_NUMBER || 3000);
    app.listen(process.env.PORT_NUMBER || 3000);
}).
catch(err => console.log(err))