import mongoose from "mongoose";
import dotenv from 'dotenv'
import chalk from "chalk";

dotenv.config()
//Consts
const DB_USER = process.env.DB_USER
const DB_PASSWORD = process.env.DB_PASSWORD
const DB_NAME = process.env.DB_NAME


const mongoDBConnect = () => {
    try {
        mongoose.connect(
            `mongodb+srv://${DB_USER}:${DB_PASSWORD}@cluster0.38wsx0v.mongodb.net/${DB_NAME}?retryWrites=true&w=majority`,
        )
        // chalk для подсветки строки другим цветом в консоле
        console.log(chalk.yellow("MongoDB - Connected"));
    } catch (error) {
        console.log(chalk.red("Error - MongoDB Connection " + error));
    }
};
export default mongoDBConnect;
