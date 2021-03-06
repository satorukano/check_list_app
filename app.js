const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const app = express();

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


var db_config = {
     host: process.env.data_host,
  user: process.env.data_user,
  password: process.env.data_pass,
  database: process.env.database_name,
  port: '3306'
}

var connection = mysql.createPool(db_config);


function handleDisconnect() {
    console.log('INFO.CONNECTION_DB: ');
    connection = mysql.createPool(db_config);
    
    //connection取得
    connection.getConnection(function(err) {
        if (err) {
            console.log('ERROR.CONNECTION_DB: ', err);
            setTimeout(handleDisconnect, 1000);
        }
    });
    
    //error('PROTOCOL_CONNECTION_LOST')時に再接続
    connection.on('error', function(err) {
        console.log('ERROR.DB: ', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log('ERROR.CONNECTION_LOST: ', err);
            handleDisconnect();
        } else {
            throw err;
        }
    });
}

handleDisconnect();


connection.getConnection((err) => {
  if (err) {
    console.log('error connecting: ' + err.stack);
    return;
  }
  console.log('success');
});

var getHashNextValue = function(hash, targetKey) {
	var isHit = false;

	if (!hash || typeof hash !== 'object') return false;

	for (var key in hash) {
		if (key === targetKey) {
			isHit = true;
		} else if (isHit) {
			return hash[key];
		}
	}

	return false;
};

var getHashNextKey = function(hash, targetKey) {
	var isHit = false;

	if (!hash || typeof hash !== 'object') return false;

	for (var key in hash) {
		if (key === targetKey) {
			isHit = true;
		} else if (isHit) {
			return key;
		}
	}

	return false;
};








app.use(
  session({
    secret: 'my_secret_key',
    resave: false,
    saveUninitialized: false,
     cookie: {
      maxAge: 60*60*1000
    }
  })
);

app.use((req, res,next) => {
  if(req.session.username === undefined) {
    console.log('ログインしていません');
    res.locals.username = 'ゲスト';
  }else {
    console.log('ログインしています');
    res.locals.username = req.session.username;
    res.locals.id = req.session.logged_id;
  }

  next();
} );

app.get('/', (req, res) => {
  res.render('login.ejs', {errors:[]});
});


app.post('/', (req, res) => {
  const id = req.body.id;
  const errors = [];

  connection.query(
    'select * from for_crew where id = ?  ',
    [id],
    (error, results) => {
	console.log(error);
        if(results.length > 0) {
          req.session.username = results[0].name;
          req.session.logged_id = results[0].id;
          res.redirect('/check_for_crew');
        }else {
	  errors.push('このidは存在しません')
          res.render('login.ejs', {errors:errors});
        }
      } 
     
  );
});

app.post('/password', (req, res, next) =>{
  const inpass = req.body.password;
  const errors = [];
  connection.query(
    'select * from pass where id = 1',
    (error, results) => {
      console.log(results[0].password)
      if (inpass !=results[0].password) {
        errors.push('パスワードが間違っています');
        res.render('password.ejs', {errors:errors});
      } else {
        next();
      }
    }
  );

},

(req, res,) => {
  const inpass = req.body.password;
  const errors = [];
  connection.query(
    'select * from pass where id = 1',
    (error, results) => {
      console.log(results[0].password)
      if (inpass ==results[0].password) {
        res.redirect('/edit');
      }
    }
  );
});

app.post('/password_s', (req, res, next) =>{
  const inpass = req.body.password;
  const errors = [];
  connection.query(
    'select * from pass where id = 1',
    (error, results) => {
      console.log(results[0].password)
      if (inpass !=results[0].password) {
        errors.push('パスワードが間違っています');
        res.render('password_s.ejs', {errors:errors});
      } else {
        next();
      }
    }
  );

},
(req, res) => {
  const inpass = req.body.password;
  const errors = [];
  connection.query(
    'select * from pass where id = 1',
    (error, results) => {
      if (inpass ==results[0].password) {
        res.redirect('/edit_s');
      }
    }
  );
});


app.post('/password_i', (req, res, next) =>{
  const inpass = req.body.password;
  const errors = [];
  connection.query(
    'select * from pass where id = 1',
    (error, results) => {
      console.log(results[0].password)
      if (inpass !=results[0].password) {
        errors.push('パスワードが間違っています');
        res.render('password_i.ejs', {errors:errors});
      } else {
        next();
      }
    }
  );

},
(req, res) => {
  const inpass = req.body.password;
  const errors = [];
  connection.query(
    'select * from pass where id = 1',
    (error, results) => {
      if (inpass ==results[0].password) {
        res.redirect('/edit_i');
      }
    }
  );
});


app.get('/edit', (req, res) => {

  connection.query(
    'select * from for_crew where id = ? ;',
    [req.session.logged_id],
    (error, results) => {
      var values = Object.values(results[0]);
      values.shift();
      values.shift();
      console.log(values.length)
      res.render('edit_check_for_crew.ejs', {check_data:values});
    }
  );

});

app.get('/edit_s', (req, res) => {

  connection.query(
    'select * from for_skip where id = ? ;',
    [req.session.logged_id],
    (error, results) => {
      var values = Object.values(results[0]);
      values.shift();
      values.shift();
      console.log(values.length)
      res.render('edit_check_for_skipper.ejs', {check_data:values});
    }
  );

});


app.get('/edit_i', (req, res) => {

  connection.query(
    'select * from for_inst where id = ? ;',
    [req.session.logged_id],
    (error, results) => {
      var values = Object.values(results[0]);
      values.shift();
      values.shift();
      console.log(values.length)
      res.render('edit_check_for_inst.ejs', {check_data:values});
    }
  );

});



app.get('/check_for_crew', (req, res) => {
  
  connection.query(
    'select * from for_crew where id = ? ;',
    [req.session.logged_id],
    (error, results) => {
      var values = Object.values(results[0]);
      values.shift();
      values.shift();
      console.log(values.length)
      res.render('check_for_crew.ejs', {check_data:values});
    }
  );
  

});


app.get('/check_for_skipper', (req, res) => {
  
  connection.query(
    'select * from for_skip where id = ? ;',
    [req.session.logged_id],
    (error, results) => {
      var values = Object.values(results[0]);
      values.shift();
      values.shift();
      console.log(values.length)
      res.render('check_for_skipper.ejs', {check_data:values});
    }
  );
  

});


app.get('/check_for_inst', (req, res) => {
  
  connection.query(
    'select * from for_inst where id = ? ;',
    [req.session.logged_id],
    (error, results) => {
      var values = Object.values(results[0]);
      values.shift();
      values.shift();
      console.log(values.length)
      res.render('check_for_inst.ejs', {check_data:values});
    }
  );
  

});







app.get('/password', (req, res) => {
  res.render('password.ejs', {errors:[]});
});

app.get('/password_s', (req, res) => {
  res.render('password_s.ejs', {errors:[]});
});


app.get('/password_i', (req, res) => {
  res.render('password_i.ejs', {errors:[]});
});


app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    res.redirect('/');
  });
});

app.get('/add', (req, res) => {
  res.render('add.ejs', {errors:[]});
});

app.post('/add', (req, res, next) => {
  const added_id = req.body.id;
  const added_name = req.body.name;
  
  const errors = [];

  if (added_id == '') {
    errors.push('idが入力されていません');
  }

  if (added_name == '') {
    errors.push('名前が入力されていません')
  }

  if (errors.length > 0) {
    res.render('add.ejs', {errors:errors});
  }else {
    next();
  }

},

(req, res, next) => {
  const added_id = req.body.id;
  const errors = [];

  connection.query(
    'select * from for_crew where id = ?',
    [added_id],
    (error, results) => {
      if(results.length > 0) {
        errors.push('このidは使われています');

        res.render('add.ejs', {errors:errors});
      }else {
        next();
      }
    }
  );

},






(req, res) => {
  const added_id = req.body.id;
  const added_name = req.body.name;

  connection.query(
    'insert into for_crew (name, id) values(?, ?) ',
    [added_name, added_id],
    (error, results) => {
    }
  );

  connection.query(
    'insert into for_skip (name, id) values(?, ?) ',
    [added_name, added_id],
    (error, results) => {
    }
  );

  connection.query(
    'insert into for_inst (name, id) values(?, ?) ',
    [added_name, added_id],
    (error, results) => {
      res.redirect('/');
    }
  );
});

app.post('/edit', (req, res) => {
  var number = 0;
  try{
  for(var key in req.body) {

    if(req.body[key] === 'on') {
      var editted_value = getHashNextValue(req.body, key);
      var editted_key = getHashNextKey(req.body, key);
      if (editted_key == undefined) {
        break;
      }
      console.log(editted_value);
      console.log(editted_key);
    }
    connection.query(
      'update for_crew set ?? = ? where id = ?',
      [editted_key, editted_value, req.session.logged_id]
    );
  }
  res.redirect('/check_for_crew');
  }catch(err){
    req.session.destroy((error) => {
    res.redirect('/');
  });
  }
    
});


app.post('/edit_s', (req, res) => {
  var number = 0;
  for(var key in req.body) {

    if(req.body[key] === 'on') {
      var editted_value = getHashNextValue(req.body, key);
      var editted_key = getHashNextKey(req.body, key);
      if (editted_key == undefined) {
        break;
      }
      console.log(editted_value);
      console.log(editted_key);
    }
    connection.query(
      'update for_skip set ?? = ? where id = ?',
      [editted_key, editted_value, req.session.logged_id]
    );
  }
  res.redirect('/check_for_skipper');
});


app.post('/edit_i', (req, res) => {
  var number = 0;
  for(var key in req.body) {

    if(req.body[key] === 'on') {
      var editted_value = getHashNextValue(req.body, key);
      var editted_key = getHashNextKey(req.body, key);
      console.log(editted_value);
      console.log(editted_key);
    
    connection.query(
      'update for_inst set ?? = ? where id = ?',
      [editted_key, editted_value, req.session.logged_id]
    )};
  }
  res.redirect('/check_for_inst');
});

app.listen(process.env.PORT ||3000);

