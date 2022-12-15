//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ashika:mongo%40123@cluster0.djabcpj.mongodb.net/todolistDB?retryWrites=true&w=majority");

const itemsSchema = new mongoose.Schema({
  name: String
})
const Item = new mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Pay bills"
})
const item2 = new Item({
  name: "Workout for 30 mins"
})
const item3 = new Item({
  name: "Drink water"
})

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items : [itemsSchema]
}

const List = new mongoose.model("List",listSchema);
//const items = ["Buy Food", "Cook Food", "Eat Food"];


app.get("/", function(req, res) {
    
    Item.find({},function(err,foundItems){
   // console.log(foundItems);
    if(err){
      console.log(err);
    }
    else{
      if(foundItems.length === 0){
        Item.insertMany(defaultItems, function(err){
          if(err){
            console.log(err);
          }
          else{
            console.log("Successfully saved in db");
          }
        });
      }
    }
    // foundItems.forEach(item => {
    //   items.push(item);
    // });
   // console.log(items);
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  })    
  
});

app.get("/:customListName",function(req,res){
 // console.log(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })

})

app.post("/", function(req, res){
  //items=[];
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  })

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

  
  
});

app.post("/delete",function(req,res){
  const checkedItemID = req.body.checkboxName;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemID,function(err){
      if(!err){
        console.log("successfully deleted");
      //  items=[];
        res.redirect("/")
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemID}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
  //console.log(checkedItemID);
  
  
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
