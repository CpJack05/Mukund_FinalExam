// import dependencies you will use
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

//setting up Express Validator
const { check, validationResult } = require('express-validator');

// setting up Mongo DB
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/JuiceStore', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});


const Order = mongoose.model('Order', {
    name: String,
    phone: String,
    lichi: Number,
    beet: Number,
    peach: Number,
    subTotal: Number,
    taxAmount: Number,
    totalAmount: Number
});

// set up variables to use packages
var myApp = express();
myApp.use(bodyParser.urlencoded({ extended: false }));

// set path to public folders and view folders
myApp.set('views', path.join(__dirname, 'views'));
//use public folder for CSS etc.
myApp.use(express.static(__dirname + '/public'));
myApp.set('view engine', 'ejs');

//home page
myApp.get('/', function (req, res) {
    res.render('JuiceStore'); // no need to add .ejs to the file name
});

var phoneNumberRegex = /^[0-9]{10}$/;
var positiveNumber = /^[0-9][0-9]*$/;

//function to check that value is valid or not using regular expression
function checkRegex(userInput, regex) {
    if (regex.test(userInput)) {
        return true;
    }
    else {
        return false;
    }
}

//Custom credit card validation function
function customPhoneValidation(value) {
    if (!checkRegex(value, phoneNumberRegex)) {
        throw new Error('Phone Number should be in the format xxxxxxxxxx');
    }
    return true;
}

//For positive numbers
function lichiValidation(value, {req}){
    var lichi  = req.body.lichi;

    if(!checkRegex(value, positiveNumber)){
        throw new Error('Please enter positive number in a Lichi Juices field');
    }
    return true;
}

function beetValidation(value, {req}){
    var beet = req.body.beet;

    if(!checkRegex(value, positiveNumber)){
        throw new Error('Please enter positive number in a Beet Juices field ');
    }
    return true;
}

function peachValidation(value, {req}){
    var peach = req.body.peach;

    if(!checkRegex(value, positiveNumber)){
        throw new Error('Please enter positive number in a peach Juices field ');
    }
    return true;
}

myApp.post('/', [
    check('name', 'You must enter your Name').not().isEmpty(),
    check('phone').custom(customPhoneValidation),
    check('lichi').custom(lichiValidation),
    check('beet').custom(beetValidation),
    check('peach').custom(peachValidation),
], function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //console.log(errors); // check what is the structure of errors
        res.render('JuiceStore', {
            errors: errors.array()
        });
    }
    else {

        var name = req.body.name;
        var phone = req.body.phone;
        var lichi = req.body.lichi;
        var beet = req.body.beet;
        var peach = req.body.peach;

        //define local variable
        var lichiCharge = 0;
        var beetCharge = 0;
        var peachCharge = 0;
        var subTotal = 0;
        var totalAmount = 0;
        var taxAmount = 0;
        var tax = 0;


        // set rates for different diamonds

        lichiCharge = 3.99 * lichi;

        beetCharge = 2.99 * beet;

        peachCharge = 3.49 * peach;

        subTotal = lichiCharge + beetCharge + peachCharge;

        tax = 14.975;
        taxAmount = ((subTotal * tax) / 100);
        totalAmount = ((subTotal * tax) / 100) + subTotal;

        var pageData = {
            name: name,
            phone: phone,
            lichi: lichi,
            beet: beet,
            peach: peach,
            subTotal: subTotal,
            taxAmount: taxAmount,
            totalAmount: totalAmount
        }
        
        var myOrder = new Order(pageData);
        myOrder.save().then( function(){
            console.log('New order created');
        });

        res.render('JuiceStore', pageData);
    }
});

// All orders page
myApp.get('/AllOrders', function(req, res){
    Order.find({}).exec(function(err, orders){
        res.render('AllOrders', {orders:orders});
    });
});


// start the server and listen at a port
myApp.listen(8080);

//tell everything was ok
console.log('Everything executed fine.. website at port 8080....');