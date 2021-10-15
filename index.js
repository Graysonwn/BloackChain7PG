const { Client, MirrorClient, MirrorConsensusTopicQuery, TopicInfoQuery, TopicMessageQuery, TopicCreateTransaction, TopicMessageSubmitTransaction} = require("@hashgraph/sdk");
require("dotenv").config();

async function main() {

    //Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = "0.0.2524487";
    const myPrivateKey = "302e020100300506032b6570042204200bbffbfe31af793991057f248b6793126a7642334fd86215af0292039c9c1659";

    // If we weren't able to grab it, we should throw a new error
    if (myAccountId == null ||
        myPrivateKey == null ) {
        throw new Error("Environment variables myAccountId and myPrivateKey must be present");
    }

    // Create our connection to the Hedera network
    // The Hedera JS SDK makes this really easy!
    const myClient = Client.forTestnet();

    myClient.setOperator(myAccountId, myPrivateKey);

    const transaction = new TopicCreateTransaction();
    const txResponse = await transaction.execute(myClient);
    const receipt = await txResponse.getReceipt(myClient);
    //Get the topic ID
    const newTopicId = receipt.topicId;
    console.log("The new topic ID is " + newTopicId);


    for(var i=0; i<10; i++) {
        //Create the transaction
        await new TopicMessageSubmitTransaction({
            topicId: newTopicId,
            message: "Hello World",
        }).execute(myClient);
    }

    //Create the query
    new TopicMessageQuery()
        .setTopicId(newTopicId)
        .setStartTime(0)
        .subscribe(
            myClient,
            (message) => console.log(Buffer.from(message.contents, "utf8").toString())
        );

    //Create the account info query
    const query = new TopicInfoQuery()
        .setTopicId(newTopicId);

    //Submit the query to a Hedera network
    const info = await query.execute(myClient);

    //Print the account key to the console
    console.log(info);

}
main();