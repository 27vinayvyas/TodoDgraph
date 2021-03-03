const fetch = require('node-fetch');
  
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(3000, () => {  
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);});



var query1 = `
query {
  getUser(username: "User1") {
    username
  }
}`

  app.post('/con', (req, res) => {
    let text = req.body.text;
    let uname = req.body.user_name
    
    if(text == ""){
      
      var query = `
      query getUser($username: String!) {
        getUser(username: $username) {
          todos{
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
          //console.log(typeof data["data"]["getUser"]["todos"]);
          var arr = data["data"]["getUser"]["todos"];
          var str = "";
      
          
          for( var i=1; i<=arr.length; i++){
            //console.log(arr[i-1]["text"]);
            str = str + i + ". ";
            str+= arr[i-1]["text"];
            str+="\n";
          }
          
          res.send(str);
          
          
        });
          
    }
    else{
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
          "text": text,
          "title" : "title1"
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
        todos{
          id
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
        //console.log(typeof data["data"]["getUser"]["todos"]);
        var id = data["data"]["getUser"]["todos"][todono-1]["id"];
      
        //console.log("ID: ",id);

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
            
            //console.log('DELETED:', )
          });
      });

      res.send("Task Deleted Successfully");

});




//   var author = 'User4';

// fetch('https://wild-flower.ap-south-1.aws.cloud.dgraph.io/graphql', {
//   method: 'POST',
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   body: JSON.stringify({
//     query,
//     // variables: {
//     //   post: {
//     //       "title": "GraphQL Variables",
//     //       "text": "This post uses variables to input data",
//     //       "author": { "username": "User1" },
//     //       "category": { "id": "0x5" }
//     //     }
//     // }
//   })
// })
//   .then(r => r.json())
//   .then(data => console.log('data returned:', data));





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