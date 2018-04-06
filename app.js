const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const app = express()

let inventoryArray = [];
let productsArray = [];
const inventoryURL = 'http://autumn-resonance-1298.getsandbox.com/inventory';
const productsURL = 'http://autumn-resonance-1298.getsandbox.com/products';

//handles call to the given endpoints
handleAPICall = (url1,url2, callback) => {
  axios.get(url1)
  .then(function (response) {
    inventoryArray = response.data.inventory.slice();
    axios.get(url2)
    .then(function (response) {
        if(response.data.product){
          productsArray = response.data.product.slice();
        }
        else{
          response.data.map((item) => {productsArray.push(item)})
        }
        callback(inventoryArray, productsArray);
      })
    .catch(function (error) {
      console.log("ERROR: ",error);
    });
  })
  .catch(function (error) {
    console.log("ERROR: ",error);
  });
}

app.get('/', (req, res) =>{
  handleAPICall(inventoryURL, productsURL, (inventoryArray, productsArray)=>{
        const newInventory = inventoryArray.map((item) => {
        const {name,inventory} = item //ES6 object destructuring
        return {
          name,
          price: productsArray.find(i => i.name === item.name).price,
          inventory
       }
    });
      res.send(JSON.stringify(newInventory));
  });
});

app.get('/:name', (req, res) => { //url for "sun glasses" is sun%20glasses
  const itemName = req.params.name;
  const singleItemInventoryURL = inventoryURL+'/'+itemName;
  const singleItemProductURL = productsURL+'/'+itemName;

  handleAPICall(singleItemInventoryURL, singleItemProductURL, (inventoryArray, productsArray)=>{
         const singleItemReturn = inventoryArray.map((item) => {
          const {name,inventory} = item
          return {
            name,
            price: productsArray.find(i => i.name === item.name).price,
            inventory
         }
      });
      singleItemReturn.length === 0 ? res.send("Please enter a valid item. Your requested product was not found")
          : res.send(JSON.stringify(singleItemReturn[0]));
    });
  });

app.listen(3000, () => console.log('Example app listening on port 3000!'))
