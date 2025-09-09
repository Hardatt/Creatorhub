require("module-alias/register");
const express = require("express");
const app = express();
const { sequelize } = require("@models");
require("dotenv").config();

app.use(express.json());
app.use("/auth", require("@routes/authRoute"));
app.use("/admin", require("@routes/adminRoute"));


app.use((err,req,res,next)=>{
  console.error(err.stack);
  res.status(500).json({error: "Internal Server Error"});
})
sequelize.sync().then(() => {
  console.log("Database connected...");
  const PORT = process.env.PORT || 3005;
  app.listen(PORT, (err) => {
    if(err){
      console.error("Server failed to start:",err);
      process.exit(1);
    }
    console.log(`Server running on port ${PORT}`);
  });
})
.catch((error)=>{
  console.error("Database connection failed:",error)
  process.exit(1);
});
