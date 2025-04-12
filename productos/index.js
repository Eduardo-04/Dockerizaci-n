const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const mongoose = require("mongoose")

const amqp = require("amqplib")
const product = require("./src/models/Product")


var channel, connection, order;

mongoose.connect("mongodb://localhost/producto", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Producto servicio conectado")
})

app.use(express.json());

// docker : docker run -p 5672:5672 rabbitmq
async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCTO")
}
connect();


// Crea nuevo  product
app.post("/product/crear",   async(req, res) => {
    const {nombre, descripcion, precio} = req.body;
    const newProduct = new Product({
        nombre, 
        descripcion,
        precio,
    });
    newProduct.save()
    return res.json(newProduct)
})

// Comprar  un producto
app.post("/product/compra",  async(req, res) => {
    const {ids} = req.body;
    const products =  await Product.find({_id: {$in : ids}});
    channel.sendToQueue("IDCOMPRA", Buffer.from(JSON.stringify({
        products,
        userEmail: req.user?.email
    })
  ))
  channel.consume("PRODUCTO", data => {
    console.log("CONSUMIR  COLA PRODUCTO")
    order = JSON.parse(data.content);
    channel.ack(data);
  });
  return res.json(order);
})

app.listen(PORT, () => {
    console.log(`Producto servicio esta corriendo sobre el puerto ${PORT}`)
})