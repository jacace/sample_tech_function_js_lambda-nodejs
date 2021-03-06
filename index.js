//Function to showcase a lambda function in nodejs for AWS
//created by jacace

var zlib = require('zlib');
const { Kafka } = require('kafkajs');

exports.handler = async (input, context) => {
    
    var payload = Buffer.from(input.awslogs.data, 'base64');

    zlib.gunzip(payload, function(e, result) {

        if (e) {
            context.fail(e);
        } else {
            result = JSON.parse(result.toString('ascii'));
            sendToKafka('jacace-ecs-app', result);
            console.log("Data Sent:", JSON.stringify(result, null, 2));
        }
    });
    
    context.succeed();

}

async function sendToKafka(topicName, logLine) {
    
    const kafka = new Kafka({
        clientId: 'my-app',
        brokers: ['<cluster_id>'], 
        ssl: false,
        sasl: {
            mechanism: 'plain', // scram-sha-256 or scram-sha-512
            username: '',
            password: ''
        },
    })        
    const producer = kafka.producer();
    
    try {        
        await producer.connect();
        await producer.send({
         topic: topicName,
           messages: [
             { value: JSON.stringify(logLine, null, 2) },
           ],
        });        
    }
    catch(error) {
        console.log("sendToKafka Error:", JSON.stringify(error, null, 2));
    }
}