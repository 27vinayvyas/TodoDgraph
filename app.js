const fetch = require('node-fetch');
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 3000, () => {  
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);});

  var query1 = `
    query {
      getUser(username: "User1") {
        username
      }
    }`

  app.post('/con', (req, res) => {
    
    let text = req.body.text;
    let uname = req.body.user_name;

    if(text == ""){
      
      var query = `
      query getUser($username: String!) {
        getUser(username: $username) {
          todos(order: { asc: datePublished }){
            title
            text
          }
        }
      }`
      
      
      fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
           variables: {
            "username": uname 
          }
        })
      }).then(r => r.json())
        .then(data => {
          console.log(typeof data["data"]["getUser"]["todos"]);
          var arr = data["data"]["getUser"]["todos"];
          var str = "";
      
          for( var i=1; i<=arr.length; i++){
            //console.log(arr[i-1]["text"]);
            str = str + i + ". ";
            str+='*';
            str+= arr[i-1]["title"];
            str+='*';
            str+="\n";
            str+= arr[i-1]["text"];
            str+="\n";
          }
          res.send(str);
        });
          
    }
    else{

      //console.log(text);

      //text = "[111][222][333]"

      let vals=["","",""];
      var j=0;
    
      for(var i=1;i<text.length;i++){
        if(text[i]==']'){
          i++;j++;continue;
        }
        vals[j]+=text[i];
      }

      //console.log("NOT EMPTY")
      var query = `
        query getUser($username: String!) {
        getUser(username: $username) {
        username
        }
      }`
      fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
         variables: {
          "username": uname 
        }
      })
    }).then(r => r.json())
      .then(data => {
        //console.log("data is :",data);
        if(data["data"]["getUser"] == null){
         //console.log("NLL");
        var query = `mutation addUser($user: AddUserInput!) {
          addUser(input: [$user]) {
            user{
              username
            }
          }
        }`

        fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
             variables: {
                "user" : {
                "username" : uname
              }
            }
          })
        }).then(r => r.json())
          .then(data => {
              //console.log("NiiiLL");  
            });
        }

  var query = `mutation addTodo($todo: AddTodoInput!) {
    addTodo(input: [$todo]) {
      todo{
        id,
        title
      }
    }
  }`


  fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
       variables: {
        "todo" : {
          "author": {"username": uname},
          "title" : vals[0],
          "text": vals[1],
          "datePublished": parseInt(vals[2])
      }
      }
    })
  }).then(r => r.json())
    .then(data => {
    //console.log('data returned:', data)
    });
    });
    res.send("Task Added Successfully")
  }
});

app.post('/delete', (req, res) => {

  let uname = req.body.user_name;
  let todono = parseInt(req.body.text);

  var query = `
  query getUser($username: String!) {
    getUser(username: $username) {
      todos(order: { asc: datePublished }){
        id 
      }
    }
  }`
  
  var id;
  
  fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
       variables: {
        "username": uname 
      }
    })
  }).then(r => r.json())
    .then(data => {
      var arr = data["data"]["getUser"]["todos"];
        id =data["data"]["getUser"]["todos"][todono-1]["id"];
        
        var query = `mutation deleteTodo($filter: TodoFilter!) {
          deleteTodo(filter: $filter) {
            msg 
          }
        }`

        fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
             variables: { "filter":
             { "id": id }
           }
          })
        }).then(r => r.json())
          .then(data => {
            res.send("Task Deleted Successfully");
            //console.log('DELETED:', )
          });


      });
});

app.post('/update', (req, res) => {

  let uname = req.body.user_name;
  let q= req.body.text;
  let vals=["","","",""];
  var j=0;
  for(var i=1;i<q.length;i++){
    if(q[i]==']'){
      i++;j++;continue;
    }
    vals[j]+=q[i];
  }

  var todono = parseInt(vals[0]);

  var query = `
  query getUser($username: String!) {
    getUser(username: $username) {
      todos(order: { asc: datePublished }){
        id 
      }
    }
  }`
  
  
  fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
       variables: {
        "username": uname 
      }
    })
  }).then(r => r.json())
    .then(data => {
      var arr = data["data"]["getUser"]["todos"];
      var id =data["data"]["getUser"]["todos"][todono-1]["id"];
        
        var query = `mutation updateTodo($id: ID!, $post: TodoPatch) {
          updateTodo(input: {
            filter: { id: [$id] },
            set: $post }
          ) {
            todo {
              id,text,title
              
            }
          }
        }`

        fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
             variables: {  
              "id": id, 
              "post": {
                "title": vals[1],
                "text": vals[2],
                "datePublished": parseInt(vals[3])
              }
           }
          })
        }).then(r => r.json())
          .then(data => {
            res.send("Task Updated Successfully");
            //console.log('DELETED:', )
          });


      });
});



//  fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     query,
//      variables: {
//       "username": "User2" 
//     }
//   })
// }).then(r => r.json())
//   .then(data => {
//     if(data["data"]["getUser"] == null){
//       console.log("NLL");
//     }
//     console.log('data returned:', data["data"]["getUser"])});