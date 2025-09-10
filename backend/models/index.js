const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes } = require("sequelize");
const dbconfig = require("@config");

const basename = path.basename(__filename);
const environment = process.env.NODE_ENV || "development";
const config = dbconfig[environment];
if (!config) {
  throw new Error(
    `Database configuration for environment "${environment}" not found in config/database.js`
  );
}

const sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
        host:config.host,
        dialect:config.dialect || 'mysql',
        logging:config.logging ?? false,
        ...(config.dialectoption?{dialectoption:config.dialectoption}:{}),
        ...(config.pool?{pool:config.pool}:{})
    }
);
const db ={}
fs.readdirSync(__dirname)
.filter((file)=>{
    return(
    file.indexOf('.') !==0 &&
    file !== basename &&
    file.slice(file) === '.js'
    )
})
.forEach((file)=>{
    const modelFactory = require(path.join(__dirname,file));
    const model = modelFactory(sequelize,DataTypes);
    db[model.name]= model;
});
Object.keys(db).forEach((modelName)=>{
    if(typeof[modelName].associate==='function'){
        db[modelName].associate(db)
    }
});
async function authenticateDatabase(){
    try{
        await sequelize.authenticate();
        console.log("Database connection has been established..")
    }catch(error){
        console.error("Unable to connect the database:",error)
    }
};
authenticateDatabase();
db.squelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;