var mysql = require("mysql");
var inquirer = require("inquirer");

var quantity, product, stock_quantity;

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

function readProducts() {
    stock_quantity = 0;

    //Show all the products in the Product's table with quantity > 0
    connection.query("SELECT idproduct as ID, product_name as Product, price as Price FROM product WHERE  stock_quantity > ?"
    , [0], function(err, res) {
        if (err) throw err;
        if(res.length > 0){
            for(var i = 0; i < res.length; i++){
                console.log("ID: " + res[i].ID + " || Product: " + res[i].Product + " || Price: " + res[i].Price);
            }
            inquirer
            .prompt([
                {
                    type: 'input',
                    name: 'product',
                    message: 'What product would you like to by?',
                },
                {
                    type: 'input',
                    name: 'quantity',
                    message: 'How many units of the product would like to buy?'
                }
            ])
            .then(answers => {
                product = parseInt(answers.product);
                quantity = parseInt(answers.quantity);
                if(!isNaN(product)){//Validations
                    if(!isNaN(quantity)){
                        connection.query("SELECT idproduct FROM product WHERE  idproduct = ?"
                        , [product], function(err, res) {
                            if (err) throw err;
                            if(res.length <= 0){
                                console.log("Ups, no products found");
                                readProducts();
                            }else{
                                connection.query("SELECT stock_quantity FROM product WHERE  idproduct = ?"
                                , [product], function(err, res) {
                                    if (err) throw err;
                                    stock_quantity = parseInt(res[0].stock_quantity);
                                    // console.log(stock_quantity , quantity, stock_quantity < quantity);
                                    if(stock_quantity < quantity){
                                        console.log("Insufficient quantity!"); 
                                        readProducts();
                                    }else{
                                        updateProduct();
                                        readProducts();
                                    }       
                                });
                            }
                        });
                    }else{
                        console.log("Please enter the quantity you would like to by");
                        readProducts();
                    }
                }else{
                    console.log("Please enter the ID of the product you would like to by");
                    readProducts();
                }
            });
        }else{
            console.log("Ups, no products found");
            readProducts();
        }   
    });
}

readProducts();

function updateProduct() {
    quantity = stock_quantity - quantity;
    connection.query(
        "UPDATE product SET stock_quantity = ?  WHERE idproduct = ?",
        [quantity, product],
        function(err, res) {
            if (err) throw err;
            if(res.affectedRows > 0){
                console.log("Your order has been placed successfully!");
            } 
        });
}