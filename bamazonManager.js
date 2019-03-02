var mysql = require("mysql");
var inquirer = require("inquirer");

var quantity, product, stock_quantity, productName, price;

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "Lsc880218!",
  database: "bamazon"
});

connection.connect(function(err) {
    if (err) throw err;
});

start();

function start(){
    inquirer
    .prompt([
    {
        type: 'list',
        name: 'menuOption',
        message: 'List a set of menu options:',
        choices: [
        'View Products for Sale',
        'View Low Inventory',
        'Add to Inventory',
        'Add New Product'
        ]
    }
    ])
    .then(answers => {
    option = answers["menuOption"];
    switch(option){
        case "View Products for Sale":
            selectProducts();//Shows all the products in the Product's table with quantity > 0
            break;
        case "View Low Inventory":
            selectLowInventory();//Shows all the products in the Product's table with quantity more than 0 and less than 6
            break;
        case "Add to Inventory":
            selectProductID();//search an specific pruduct and updated it quantity
            break;
        case "Add New Product":
            getPruductData();//Get the product entered by the customer and insert it
            break;
        }
    });
}


function selectProducts(){
    connection.query("SELECT idproduct as ID, product_name as Product, price as Price, stock_quantity as Stock FROM product WHERE  stock_quantity > ?"
    , [0], function(err, res) {
        if (err) throw err;
        if(res.length > 0){
            for(var i = 0; i < res.length; i++){
                console.log("ID: " + res[i].ID + " || Product: " + res[i].Product + " || Price: " + res[i].Price + " || Stock: " + res[i].Stock);
            }
        }else{
            console.log("Ups, no products to show, please post a product");
        }  
        start();
    });
}

function selectLowInventory(){
    connection.query("SELECT idproduct as ID, product_name as Product, price as Price, stock_quantity as Stock FROM product WHERE stock_quantity between ? and ?"
    , [1, 5], 
    function(err, res) {
        if (err) throw err;
        if(res.length > 0){
            for(var i = 0; i < res.length; i++){
                console.log("ID: " + res[i].ID + " || Product: " + res[i].Product + " || Price: " + res[i].Price + " || Stock: " + res[i].Stock);
            }
        }else{
            console.log("Ups, no products found");
        }
        start();
    });
}

function selectProductID(){
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'product',
                message: 'What product would you like to add more quantity?',
            },
            {
                type: 'input',
                name: 'quantity',
                message: 'How many units of the product would like to add?'
            }
        ])
        .then(answers => {
            product = parseInt(answers.product);
            quantity = parseInt(answers.quantity);
            if(!isNaN(product)){//Validations
                if(!isNaN(quantity)){
                    connection.query("SELECT stock_quantity FROM product WHERE idproduct = ?"
                    , [product], 
                    function(err, res) {
                        // console.log(res);
                        // console.log(res[0].stock_quantity);
                        // console.log(res.idproduct);
                        stock_quantity = parseInt(res[0].stock_quantity);
                        if (err) throw err;
                        if(res.length <= 0){
                            console.log("Ups, no product found"); 
                        }else{
                            updateProduct();
                        }
                    });
                }else{
                    console.log("Please enter the quantity you would like to by");
                    selectProductID();
                }
            }else{
                console.log("Please enter the ID of the product you would like to by");
                selectProductID();
            }
        });
}

function updateProduct() {
    quantity = stock_quantity + quantity;
    connection.query(
        "UPDATE product SET stock_quantity = ?  WHERE idproduct = ?",
        [quantity, product],
        function(err, res) {
            if (err) throw err;
            if(res.affectedRows > 0){
                console.log("The quantity of the products has been updated");
                start();
            } 
        });
}

function getPruductData(){
    inquirer
        .prompt([
            {
                type: 'input',
                name: 'productName',
                message: 'What is the item you like to submit?'
            },
            {
                type: 'input',
                name: 'price',
                message: 'How much does it cost?'
            },{
                type: 'input',
                name: 'quantity',
                message: 'How many items?'
            }
        ])
        .then(answers => {
            productName = answers.productName;
            price = parseFloat(answers.price);
            quantity = parseInt(answers.quantity);
            if((productName !== undefined) && (productName !== "")){
                if(!isNaN(price)){
                    if(!isNaN(quantity)){
                        insertProduct();
                    }else{
                        console.log("Please enter the product's quantiy. That shoul be only a number");
                        getPruductData(); 
                    }
                }else{
                    console.log("Please enter the product's price. That shoul be only a number");
                    getPruductData();   
                }
            }else{
                console.log("Please enter the product's name");
                getPruductData();
            }
        });
}

function insertProduct() {
    connection.query("INSERT INTO product SET ?",
    {
        product_name: productName, 
        price: price, 
        stock_quantity: quantity
    },
        function(err, res) {
            if(res.affectedRows > 0){
                if (err) throw err;
                console.log("Your product was created successfully!");
                start();
            }
        }
    );
}