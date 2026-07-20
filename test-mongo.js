const { MongoClient } = require("mongodb");

const uri =
    "mongodb+srv://ecommerceadmin:Webzio%402026@ecommerce-cluster.qiblhdm.mongodb.net/?retryWrites=true&w=majority&appName=ecommerce-cluster";

async function main() {
    const client = new MongoClient(uri);

    try {
        console.log("Connecting...");
        await client.connect();
        console.log("✅ Connected!");

        const admin = client.db("admin").admin();
        const info = await admin.ping();

        console.log(info);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}

main();