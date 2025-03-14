import {Telegraf} from 'telegraf';

import userModel from './user.js';

import mongoose from 'mongoose';

import connectdb from './config/db.js';

const bot = new Telegraf(process.env.BOT_TOKEN);

try{
    connectdb();
    console.log("Database Connected Successfully");
   
}
catch(err){
    console.log("Error");
    process.kill(process.id, 'SIGTERM');
}

bot.start(async (ctx) =>{
    console.log('ctx',ctx);
    
    
    const from=ctx.update.message.from;
     console.log('from',from);
     try{
        await userModel.findOneAndUpdate({tgid:from.id},{
            $setOnInsert:{
                firstName: from.first_name,
                lastName:from.last_name,
                isBot:from.is_bot,
                username:from.username
            }
        },
        
        {upsert:true , new: true}
    );
        await ctx.reply(`Hey! ${from.first_name}, Welcome to your personalized Routine Bot `)
     }
      catch(err){
        console.log("Error",err);
        await ctx.reply("Facing problems please wait ");
        console.log(process.env.DB_NAME); // Should print 'routine_bot'
        console.log(process.env.COLLECTION_NAME); // Should print 'users'

      }
});


bot.command('timetable', async (ctx) => {
    try {
        const message = ctx.message.text.split(' '); // Expecting format: /timetable <day> <class>
        
        if (message.length < 3) {
            await ctx.reply("Please provide both the day and class in the format: /timetable <day> <class> (Eg:- /timetable Monday 2)");
            return;
        }

        const day = message[1].toLowerCase().trim(); // Get day
        const classNumber = parseInt(message[2].trim()); // Get class number

        if (isNaN(classNumber)) {
            await ctx.reply("Class must be a valid number. Please use the format: /timetable <day> <class>");
            return;
        }

        console.log(`Fetching timetable for day: ${day}, class: ${classNumber}`);

        // Fetch timetable data from the database
        const timetable = await mongoose.connection.db
            .collection('timetable')
            .findOne({ day: { $regex: new RegExp(`${day}$`, 'i') } });

        console.log("Timetable fetched:", timetable);

        if (!timetable) {
            await ctx.reply("No timetable data found for the provided day. Please try again.");
            return;
        }

       // const slot = timetable.slots.find((slot) => slot.class === classNumber);

        const slot = timetable.slots[classNumber - 1]; // Fixed this line

        if (!slot) {
            await ctx.reply(`No timetable entry found for class ${classNumber} on ${day}.`);
            return;
        }
        
        await ctx.reply(`For ${day.charAt(0).toUpperCase() + day.slice(1)} (Class ${classNumber}):\nTime: ${slot.time}\nSubject: ${slot.subject}`);
        
    } catch (err) {
        console.error("Error fetching timetable:", err);
        await ctx.reply("An error occurred while fetching the timetable. Please try again later.");
    }
});


bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
