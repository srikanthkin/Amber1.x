var express = require('express');
var router = express.Router();
var app = express();
var Promise = require('mpromise');
var pdbconnect=require('../../routes/database/psqldbconnect');
var User = require('../../models/user');
var ensureAuthenticated=require('../../routes/utils/utils');
var moment = require('moment');
var rp = require('request-promise');
var mislog=require('winston');
var generator = require('generate-password');
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');
var arrayDifference = require("array-difference");
var mislog=require('winston');

router.get('/assetDetails',function(req,res)
{
  var emp_id =req.user.rows[0].user_id;
 var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
  console.log('req value ',req.user.rows[0].user_id);
    console.log('emp_access',req.user.rows[0].user_type);
  res.render('assetModule/assetDetails',{
    emp_access:emp_access,
    my_name:my_name,
    my_id:my_id
  });
});

router.get('/assetItDetails',function(req,res)
{
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
  console.log('req value ',req.user.rows[0].user_id);
    console.log('emp_access',req.user.rows[0].user_type);
  res.render('assetModule/assetItDetails',{
    emp_access:emp_access,
    my_name:my_name,
    my_id:my_id
  });
});

router.post('/additasset',additasset);

function additasset(req,res)
{ 

   console.log("inside asset post");
   var now = new Date();
   var rcreuserid="ADMIN";
   var rcretime=now;
   var lchguserid="ADMIN";
   var lchgtime=now;
   var code = ""; 
   var code1 = "";
   var code2 ="";
   var seq = "";
   var ptype = req.body.ptype;  
   if (ptype == "Laptop") {code = "SYS";}
   if (ptype == "Desktop")  {code = "SYS";}
   if (ptype == "Datacard") {code = "DC";}    
   if (ptype == "Server") {code = "SER";}
   if (ptype == "Others") {code = "OTH";} 
   var assetid = "NR-"+ code +"-"
   var ptype = req.body.ptype;
   var make = req.body.make;
   var model = req.body.model;
   var  sno = req.body.sno;
   var hname = req.body.hname;
   var os = req.body.os;
   var ost = req.body.ost;
   var sw = req.body.sw;
   var ram = req.body.ram;
   var procr = req.body.procr;
   var hrd = req.body.hrd;
   var accs = req.body.accs;
   var wpkey = req.body.wpkey;
   var ipadd = req.body.ipadd;

  console.log("ptype",ptype);
  console.log("code",code); 
  console.log("assetid",assetid);

  if(code == "SYS") {seq = "asset_sys";}
  if(code == "DC") {seq = "asset_dc";}
  if(code == "SER") {seq = "asset_ser";}
  if(code == "OTH") {seq = "asset_oth";}    

  pdbconnect.query("select $1||lpad(nextval($2)::text,'4','0') code1",[assetid,seq],function(err,result){
  if(err) throw err;
    var code1 = result.rows['0'].code1; 
    console.log("select done");
    console.log("code1",code1);
    

    console.log("code1",code1);

    pdbconnect.query("INSERT INTO asset_it_master_tbl(asset_id,product,make,model,serial_no,host_name,os,os_type,software,ram,processor,hard_disk,accessories,window_product_key,ip_addr,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)",[code1,ptype,make,model,sno,hname,os,ost,sw,ram,procr,hrd,accs,wpkey,ipadd,'N',rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
  if(err) throw err;
  req.flash('success',"Asset Details for " + code1 + " Added Successfully")
  console.log("success");
  res.redirect(req.get('referer'));
  });
});

};



router.get('/assetModDetails',function(req,res)
{
  
  var id = "";
  var ptype = "";
  var make = "";
  var model ="";
  var sno = "";
  var hname = "";
  var os = ""; 
  var ost = "";
  var sw = "";
  var ram = "";
  var procr = "";
  var hrd = "";
  var accs = "";
  var wpkey = "";
  var ipadd = ""; 

  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  pdbconnect.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' order by asset_id asc", function(err,result){
    asset=result.rows;
    asset_id_count=result.rowCount; 
    console.log("asset_id_count",asset_id_count);
    console.log("asset",asset);

  pdbconnect.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' order by asset_id asc", function(err,result){
    asset1=result.rows;
    asset1_id_count=result.rowCount; 
    console.log("asset_id_count",asset1_id_count);
    console.log("asset",asset1);

  //res.render('assetModule/assetViewDetails');
  res.render('assetModule/assetModDetails',{
                asset:asset,
                asset_id_count:asset_id_count,
                asset1:asset1,
                asset1_id_count:asset1_id_count,
                //assetid:assetid,
                //ptype:ptype,
                id:id,
                ptype:ptype,
                make:make,
                model:model,
                sno:sno,
                hname:hname,
                os:os,
                ost:ost,
                sw:sw,
                ram:ram,
                procr:procr,
                hrd:hrd,
                accs:accs,
                wpkey:wpkey,
                ipadd:ipadd,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id
              });
            });
        });
});


router.post('/assetmodView',assetmodView);
function assetmodView(req,res)
{
  var asset_id = req.body.asset_id;
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
    
          pdbconnect.query("SELECT asset_id,product,make,model,serial_no,host_name,os,os_type,software,ram,processor,hard_disk,accessories,window_product_key,ip_addr from asset_it_master_tbl where upper(asset_id) = upper($1)" ,[asset_id],function(err,resultset){
            if (err) throw err;
              var id = resultset.rows['0'].asset_id; 
              var ptype = resultset.rows['0'].product;
              var make = resultset.rows['0'].make;
              var model = resultset.rows['0'].model;
              var  sno = resultset.rows['0'].serial_no;
              var hname = resultset.rows['0'].host_name;
              var os = resultset.rows['0'].os;
              var ost = resultset.rows['0'].os_type;
              var sw = resultset.rows['0'].software;
              var ram = resultset.rows['0'].ram;
              var procr = resultset.rows['0'].processor;
              var hrd = resultset.rows['0'].hard_disk;
              var accs = resultset.rows['0'].accessories;
              var wpkey = resultset.rows['0'].window_product_key;
              var ipadd = resultset.rows['0'].ip_addr;

              console.log("make",make);
              console.log("sno",sno);
              console.log("id",id);

              res.render('assetModule/assetModDetails',{
                //asset : asset,
                //asset_id_count :asset_id_count,
                //assetid:assetid,
                //ptype:ptype,
                id:id,
                ptype:ptype,
                make:make,
                model:model,
                sno:sno,
                hname:hname,
                os:os,
                ost:ost,
                sw:sw,
                ram:ram,
                procr:procr,
                hrd:hrd,
                accs:accs,
                wpkey:wpkey,
                ipadd:ipadd,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              });
          });
      
}

router.post('/assetmoddet',assetmoddet);
function assetmoddet(req,res)
{

  console.log("modify");

  var now = new Date();
   var rcreuserid="ADMIN";
   var rcretime=now;
   var lchguserid="ADMIN";
   var lchgtime=now;
   var assetid = req.body.id;
   var ptype = req.body.ptype;
   var make = req.body.make;
   var model = req.body.model;
   var  sno = req.body.sno;
   var hname = req.body.hname;
   var os = req.body.os;
   var ost = req.body.ost;
   var sw = req.body.sw;
   var ram = req.body.ram;
   var procr = req.body.procr;
   var hrd = req.body.hrd;
   var accs = req.body.accs;
   var wpkey = req.body.wpkey;
   var ipadd = req.body.ipadd;

   console.log("sno",sno);
   console.log("assetid",assetid);

    pdbconnect.query("UPDATE asset_it_master_tbl set make=$1,model=$2,serial_no=$3,host_name=$4,os=$5,os_type=$6,software=$7,ram=$8,processor=$9,hard_disk=$10,accessories=$11,window_product_key=$12,ip_addr=$13,del_flg=$14,lchg_user_id=$15,lchg_time=$16 where asset_id =$17",[make,model,sno,hname,os,ost,sw,ram,procr,hrd,accs,wpkey,ipadd,'N',lchguserid,lchgtime,assetid],function(err,done){
    if(err) throw err;
  req.flash('success',"Asset Details for " + assetid + " Updated Successfully")
  //res.redirect(req.get('referer'));
  res.redirect('/assetModule/assetDetails/assetModDetails');
  console.log("modify success");
  });

}


router.get('/assetViewDetails',function(req,res)
{
  var id = "";
  var ptype = "";
  var make = "";
  var model ="";
  var sno = "";
  var hname = "";
  var os = ""; 
  var ost = "";
  var sw = "";
  var ram = "";
  var procr = "";
  var hrd = "";
  var accs = "";
  var wpkey = "";
  var ipadd = ""; 

    var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  pdbconnect.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' order by asset_id asc", function(err,result){
    asset=result.rows;
    asset_id_count=result.rowCount; 
    console.log("asset_id_count",asset_id_count);
    console.log("asset",asset);

  pdbconnect.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' order by asset_id asc", function(err,result){
    asset1=result.rows;
    asset1_id_count=result.rowCount; 
    console.log("asset_id_count",asset1_id_count);
    console.log("asset",asset1);

  //res.render('assetModule/assetViewDetails');
  res.render('assetModule/assetViewDetails',{
                asset:asset,
                asset_id_count:asset_id_count,
                asset1:asset1,
                asset1_id_count:asset1_id_count,
                //assetid:assetid,
                //ptype:ptype,
                id:id,
                ptype:ptype,
                make:make,
                model:model,
                sno:sno,
                hname:hname,
                os:os,
                ost:ost,
                sw:sw,
                ram:ram,
                procr:procr,
                hrd:hrd,
                accs:accs,
                wpkey:wpkey,
                ipadd:ipadd,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id
              });
            });
        });

});

router.post('/assetiddet',assetiddet);
function assetiddet(req,res)
{

    var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;    
    var asset_id = req.body.asset_id;
    pdbconnect.query("SELECT * from asset_it_master_tbl where asset_id = $1 order by asset_id asc",[asset_id],function(err,check){
    asset_id_count = check.rowCount; 
    
    
    if(asset_id_count != 0)
        {
          pdbconnect.query("SELECT asset_id,product,make,model,serial_no,host_name,os,os_type,software,ram,processor,hard_disk,accessories,window_product_key,ip_addr from asset_it_master_tbl where upper(asset_id) = upper($1)" ,[asset_id],function(err,resultset){
            if (err) throw err;
              var id = resultset.rows['0'].asset_id; 
              var ptype = resultset.rows['0'].product;
              var make = resultset.rows['0'].make;
              var model = resultset.rows['0'].model;
              var  sno = resultset.rows['0'].serial_no;
              var hname = resultset.rows['0'].host_name;
              var os = resultset.rows['0'].os;
              var ost = resultset.rows['0'].os_type;
              var sw = resultset.rows['0'].software;
              var ram = resultset.rows['0'].ram;
              var procr = resultset.rows['0'].processor;
              var hrd = resultset.rows['0'].hard_disk;
              var accs = resultset.rows['0'].accessories;
              var wpkey = resultset.rows['0'].window_product_key;
              var ipadd = resultset.rows['0'].ip_addr;

              console.log("make",make);
              res.render('assetModule/assetViewDetails',{
                //asset : asset,
                //asset_id_count :asset_id_count,
                //assetid:assetid,
                //ptype:ptype,
                id:id,
                ptype:ptype,
                make:make,
                model:model,
                sno:sno,
                hname:hname,
                os:os,
                ost:ost,
                sw:sw,
                ram:ram,
                procr:procr,
                hrd:hrd,
                accs:accs,
                wpkey:wpkey,
                ipadd:ipadd,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id
              });
          });
        }  

        else
        {
          //ptype = "";
          id = "";
          ptype = "";
          make = "";
          model ="";
          sno = "";
          hname = "";
          os = ""; 
          ost = "";
          sw = "";
          ram = "";
          procr = "";
          hrd = "";
          accs = "";
          wpkey = "";
          ipadd = "";

           res.render('assetModule/assetViewDetails',{
                //asset : asset,
                //asset_id_count :asset_id_count,
                //assetid:assetid,
                //ptype:ptype,
                id:id,
                ptype:ptype,
                make:make,
                model:model,
                sno:sno,
                hname:hname,
                os:os,
                ost:ost,
                sw:sw,
                ram:ram,
                procr:procr,
                hrd:hrd,
                accs:accs,
                wpkey:wpkey,
                ipadd:ipadd,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              }); 

        }  

    });

};

router.get('/assetnItDetails',function(req,res)
{
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  res.render('assetModule/assetnItDetails',{
    emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

  });
  }
);

router.post('/assetnItasset',assetnItasset);

function assetnItasset(req,res)
{ 
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
console.log("inside non it asset post");
   var now = new Date();
   var rcreuserid="ADMIN";
   var rcretime=now;
   var lchguserid="ADMIN";
   var lchgtime=now;
   var code = ""; 
   var code1 = "";
   var code2 ="";
   var seq = "";
   //var assetid = req.body.assetid;
   var assetnid = "NR-NONIT-"
   var particulr = req.body.particulr;
   var nos = req.body.nos;
   var rmks = req.body.rmks;
  console.log("nos",nos);
  
  var seq = "nitasset";
      

  pdbconnect.query("select $1||lpad(nextval($2)::text,'4','0') code1",[assetnid,seq],function(err,result){
    if(err) throw err;
      var code1 = result.rows['0'].code1; 
      console.log("select done");
      console.log("code1",code1);
    

    pdbconnect.query("INSERT INTO asset_nit_master_tbl(asset_nid,particulr,quant,rmks,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time)values($1,$2,$3,$4,$5,$6,$7,$8,$9)",[code1,particulr,nos,rmks,'N',rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
  if(err) throw err;
  req.flash('success',"Asset Details for " + code1 + " Added Successfully")
  console.log("success");
  res.redirect(req.get('referer'));
  });
});

};


router.get('/assetnItModDetails',function(req,res)
{

    var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;
var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
  var nid = "";
  var particulr = "";
  var nos = "";
  var rmks ="";
  
  pdbconnect.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function(err,result){
    asset=result.rows;
    asset_nid_count=result.rowCount; 
    console.log("asset_id_count",asset_nid_count);
    console.log("asset",asset);

  pdbconnect.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function(err,result){
    asset1=result.rows;
    asset1_nid_count=result.rowCount; 
    console.log("asset_id_count",asset1_nid_count);
    console.log("asset",asset1);

  //res.render('assetModule/assetViewDetails');
  res.render('assetModule/assetnItModDetails',{
                asset:asset,
                asset_nid_count:asset_nid_count,
                asset1:asset1,
                asset1_nid_count:asset1_nid_count,
                //assetid:assetid,
                //ptype:ptype,
                nid:nid,
                particulr:particulr,
                nos:nos,
                rmks:rmks,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id
  
              });
            });
        });
});



router.post('/assetnmodView',assetnmodView);
function assetnmodView(req,res)
{
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  var asset_nid = req.body.asset_nid;
    
          pdbconnect.query("SELECT asset_nid,particulr,quant,rmks from asset_nit_master_tbl where upper(asset_nid) = upper($1)" ,[asset_nid],function(err,resultset){
            if (err) throw err;
              var id = resultset.rows['0'].asset_nid; 
              var particulr = resultset.rows['0'].particulr;
              var nos = resultset.rows['0'].quant;
              var rmks = resultset.rows['0'].rmks;

              res.render('assetModule/assetnItModDetails',{
                //asset : asset,
                //asset_id_count :asset_id_count,
                //assetid:assetid,
                //ptype:ptype,
                nid:id,
                particulr:particulr,
                nos:nos,
                rmks:rmks,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              });
          });
      
}

router.post('/assetnmoddet',assetnmoddet);
function assetnmoddet(req,res)
{

  console.log("modify");

  var now = new Date();
   var rcreuserid="ADMIN";
   var rcretime=now;
   var lchguserid="ADMIN";
   var lchgtime=now;
   var assetid = req.body.nid;
   var particulr = req.body.particulr;
   var nos = req.body.nos;
   var rmks = req.body.rmks;

    pdbconnect.query("UPDATE asset_nit_master_tbl set particulr=$1,quant=$2,rmks=$3,del_flg=$4,lchg_user_id=$5,lchg_time=$6 where asset_nid =$7",[particulr,nos,rmks,'N',lchguserid,lchgtime,assetid],function(err,done){
    if(err) throw err;
  req.flash('success',"Asset Details for " + assetid + " Updated Successfully")
  //res.redirect(req.get('referer'));
  res.redirect('/assetModule/assetDetails/assetnItModDetails');
  console.log("modify success");
  });

}



router.get('/assetnItViewDetails',function(req,res)
{
  
  var nid = "";
  var particulr = "";
  var nos = "";
  var rmks ="";
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  
  pdbconnect.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function(err,result){
    asset=result.rows;
    asset_nid_count=result.rowCount; 
    console.log("asset_id_count",asset_nid_count);
    console.log("asset",asset);

  pdbconnect.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function(err,result){
    asset1=result.rows;
    asset1_nid_count=result.rowCount; 
    console.log("asset_id_count",asset1_nid_count);
    console.log("asset",asset1);

  //res.render('assetModule/assetViewDetails');
  res.render('assetModule/assetnItViewDetails',{
                asset:asset,
                asset_nid_count:asset_nid_count,
                asset1:asset1,
                asset1_nid_count:asset1_nid_count,
                //assetid:assetid,
                //ptype:ptype,
                nid:nid,
                particulr:particulr,
                nos:nos,
                rmks:rmks,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              });
            });
        });
});


router.post('/assetniddet',assetniddet);
function assetniddet(req,res)
{
  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  var asset_nid = req.body.asset_nid;
    
          pdbconnect.query("SELECT asset_nid,particulr,quant,rmks from asset_nit_master_tbl where upper(asset_nid) = upper($1)" ,[asset_nid],function(err,resultset){
            if (err) throw err;
              var id = resultset.rows['0'].asset_nid; 
              var particulr = resultset.rows['0'].particulr;
              var nos = resultset.rows['0'].quant;
              var rmks = resultset.rows['0'].rmks;

              res.render('assetModule/assetnItViewDetails',{
                //asset : asset,
                //asset_id_count :asset_id_count,
                //assetid:assetid,
                //ptype:ptype,
                nid:id,
                particulr:particulr,
                nos:nos,
                rmks:rmks,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              });
          });
   
}

router.get('/assetItAlloc',function(req,res)
{

  var empid = "";
  var empName = "";
  var rdate ="";
  var sdate ="";
  var asset_id ="";

  var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  
  pdbconnect.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' and asset_id not in (select asset_id from asset_alloc_master_tbl where del_flg = 'N') order by asset_id asc", function(err,result){
    asset=result.rows;
    asset_id_count=result.rowCount; 
    console.log("asset_id_count",asset_id_count);
    console.log("asset",asset);

  pdbconnect.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' and asset_id not in (select asset_id from asset_alloc_master_tbl where del_flg = 'N') order by asset_id asc", function(err,result){
    asset1=result.rows;
    asset1_id_count=result.rowCount; 
    console.log("asset_id_count",asset1_id_count);
    console.log("asset",asset1);

  pdbconnect.query("SELECT emp_id from emp_master_tbl where del_flg = 'N' and emp_id not in (select  emp_id from asset_alloc_master_tbl where del_flg = 'N') order by emp_id asc",function(err,result){
    employee=result.rows;
    emp_id_count=result.rowCount;


  pdbconnect.query("SELECT emp_id from emp_master_tbl where del_flg = 'N' and emp_id not in (select  emp_id from asset_alloc_master_tbl where del_flg = 'N') order by emp_id asc",function(err,result){
    employee1=result.rows;
    emp1_id_count=result.rowCount;



  //res.render('assetModule/assetViewDetails');
  res.render('assetModule/assetItAlloc',{
                asset:asset,
                asset_id_count:asset_id_count,
                asset1:asset1,
                asset1_id_count:asset1_id_count,
                //assetid:assetid,
                //ptype:ptype,
                employee:employee,
                emp_id_count:emp_id_count,
                employee1:employee1,
                emp1_id_count:emp1_id_count,
                //empname:empname,
                empid:empid,
                empName:empName,
                sdate:sdate,
                rdate:rdate,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              });
            });
        });
    });
  });
});

router.post('/assetAllocList',assetAllocList);
function assetAllocList(req,res)
{
   var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  var emp1_id = req.body.emp_id;
  console.log("alloc");
    
          pdbconnect.query("SELECT emp_id,emp_name from emp_master_tbl where upper(emp_id) = upper($1)" ,[emp1_id],function(err,resultset){
            if (err) throw err;
              var id = resultset.rows['0'].emp_id; 
              var empName = resultset.rows['0'].emp_name;

              res.render('assetModule/assetItAlloc',{
                //asset : asset,
                //asset_id_count :asset_id_count,
                //assetid:assetid,
                //ptype:ptype,
                empid:id,
                empName:empName,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id

              });
          });
}

router.post('/assetaddAlloc',assetaddAlloc);
function assetaddAlloc(req,res)
{
  console.log("Insert");
  var now = new Date();
  var rcreuserid="ADMIN";
  var rcretime=now;
  var lchguserid="ADMIN";
  var lchgtime=now;
  var asset_id = req.body.asset_id;
  var empid = req.body.empid;
  var empName = req.body.empName;
  var sdate = req.body.sdate;
  var rdate = req.body.rdate;

 


 var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;

  pdbconnect.query("SELECT * from asset_alloc_master_tbl where emp_id =$1",[empid],function(err,resultset){
   if(err) throw err;
    var rcount = resultset.rowCount;
    console.log("rcount",rcount);
        if(rcount == 0)
        {

  pdbconnect.query("INSERT INTO asset_alloc_master_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[asset_id,empid,empName,sdate,rdate,'N',rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
  if(err) throw err;
  req.flash('success',"Asset Details for " + empid + " Added Successfully")
  console.log("success");
  res.redirect('/assetModule/assetDetails/assetItAlloc');
  });
      
   }
   else
   {
    req.flash('error',"Record already Exists")
    res.redirect('/assetModule/assetDetails/assetItAlloc');
   } 

   });
};

router.get('/assetItAllocMod',function(req,res)
{
    console.log("test");
    var empid = "";
    var empName = "";
    var asset_id = "";
    var sdate = "";
    var rdate = "";
    var asset_list = "";
    var other_asset_id = "";
    var other_asset_id_count = "";

     var emp_id =req.user.rows[0].user_id;
var emp_access =req.user.rows[0].user_type;

var my_id =req.user.rows[0].user_id;
var my_name =req.user.rows[0].user_name;
 
    pdbconnect.query("SELECT emp_id from asset_alloc_master_tbl order by emp_id asc",function(err,result){
    employee=result.rows;
    emp_id_count=result.rowCount;

  	res.render('assetModule/assetItAllocMod',{
               employee:employee,
               emp_id_count:emp_id_count,
	       empid:empid,
	       empName:empName,
	       asset_id:asset_id,
  	       other_asset_id:other_asset_id,
               other_asset_id_count:other_asset_id_count,
	       sdate:sdate,
	       rdate:rdate,
         empName:empName,
                emp_access:emp_access,
                my_name:my_name,
                my_id:my_id
       						});
     });
});

router.post('/assetmAllocList',assetmAllocList);
function assetmAllocList(req,res)
{
  var emp_id = req.body.emp_id;
  console.log("emp id",emp_id);
    
  pdbconnect.query("SELECT asset_id,emp_id,emp_name,allocdate,rdate from asset_alloc_master_tbl where upper(emp_id) = upper($1)" ,[emp_id],function(err,resultset){
  if (err) throw err;
  var asset_id = resultset.rows['0'].asset_id;
  var emp_id = resultset.rows['0'].emp_id; 
  var empName = resultset.rows['0'].emp_name;
  var sdate = resultset.rows['0'].allocdate;
  var rdate = resultset.rows['0'].rdate;

  pdbconnect.query("SELECT asset_id from asset_alloc_master_tbl where emp_id = $1",[emp_id],function(err,result){
  asset_id=result.rows['0'].asset_id;
  console.log("asset id is :",asset_id);

  pdbconnect.query("SELECT asset_id from asset_it_master_tbl order by asset_id asc",function(err,resultset){
  other_asset_id=resultset.rows;
  console.log("other_asset_id",other_asset_id);
  other_asset_id_count=resultset.rowCount;
  console.log("other_asset_id_count",other_asset_id_count);


  res.render('assetModule/assetItAllocMod',{
  asset_id:asset_id,
  other_asset_id:other_asset_id,
  other_asset_id_count:other_asset_id_count,
  empid:emp_id,
  empName:empName,
  sdate:sdate,
  rdate:rdate
              				   });

          });
          });
          });
}


router.post('/assetmodAlloc',assetmodAlloc);
function assetmodAlloc(req,res)
{
  console.log("Modify");
  var now = new Date();
  var rcreuserid="ADMIN";
  var rcretime=now;
  var lchguserid="ADMIN";
  var lchgtime=now;
  var asset_id = req.body.asset_id;
  var empid = req.body.empid;
  var empName = req.body.empName;
  var sdate = req.body.sdate;
  var rdate = req.body.rdate;

 

  pdbconnect.query("SELECT * from asset_alloc_master_tbl where emp_id =$1",[empid],function(err,resultset){
   if(err) throw err;
    var rcount = resultset.rowCount;
    console.log("rcount",rcount);
        if(rcount == 0)
        {

  pdbconnect.query("INSERT INTO asset_alloc_master_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[asset_id,empid,empName,sdate,rdate,'N',rcreuserid,rcretime,lchguserid,lchgtime],function(err,done){
  if(err) throw err;
  req.flash('success',"Asset Details for " + empid + " Added Successfully")
  console.log("success");
  res.redirect('/assetModule/assetDetails/assetItAlloc');
  });
      
   }
   else
   {
    req.flash('error',"Record already Exists")
    res.redirect('/assetModule/assetDetails/assetItAlloc');
   } 

   });
};


router.get('/assetItAllocView',function(req,res)
{
  res.render('assetModule/assetItAllocView');
}
);

module.exports = router;


