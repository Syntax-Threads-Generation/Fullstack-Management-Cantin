var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var authRouter = require('./routes/auth');
// var productsRouter = require('./routes/products');
// var productSalesRouter = require('./routes/product-sales');
// var inventoryRouter = require('./routes/inventory');
// var purchasesRouter = require('./routes/purchases');
// var profitsRouter = require('./routes/profits');
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger');
var {createTable} = require('./config/db');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

createTable();

app.use('/api/auth',authRouter);
// app.use('/api/products',productsRouter);
// app.use('/api/sales/products',productSalesRouter);
// app.use('/api/inventory',inventoryRouter);
// app.use('/api/purchases',purchasesRouter);
// app.use('/api/profits',profitsRouter);



app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
